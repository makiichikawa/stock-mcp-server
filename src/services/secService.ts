export interface SecCompanyInfo {
  cik: string;
  name: string;
  ticker: string;
}

export interface SecFiling {
  accessionNumber: string;
  filingDate: string;
  form: string; // "10-K", "10-Q", "8-K", etc.
  primaryDocument: string;
  reportDate?: string;
  acceptanceDateTime: string;
}

export interface SecSubmissionData {
  cik: string;
  name: string;
  filings: {
    recent: {
      accessionNumber: string[];
      filingDate: string[];
      form: string[];
      primaryDocument: string[];
      reportDate: string[];
      acceptanceDateTime: string[];
    };
  };
}

export class SecService {
  private readonly baseUrl = 'https://data.sec.gov';
  private readonly headers = {
    'User-Agent': 'Mozilla/5.0 (compatible; Stock-MCP-Server/1.0; +https://github.com/user/stock-mcp-server)'
  };

  // CIK番号を使用してSEC企業情報を検索する
  async findCompanyByCik(cik: string): Promise<SecCompanyInfo | null> {
    try {
      const paddedCik = cik.padStart(10, '0');
      const url = `${this.baseUrl}/submissions/CIK${paddedCik}.json`;
      
      const response = await fetch(url, { 
        headers: this.headers,
        method: 'GET'
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json() as SecSubmissionData;
      
      return {
        cik: paddedCik,
        name: data.name,
        ticker: '' // ticker は submissions API では取得できないので空文字列
      };
    } catch (error) {
      console.warn(`Failed to fetch company info for CIK ${cik}:`, error);
      return null;
    }
  }

  // 指定されたCIKの最近のSECファイリング情報を取得する（10-K、10-Q、8-K等）
  async getRecentFilings(cik: string, formTypes: string[] = ['10-K', '10-Q', '8-K'], limit: number = 10): Promise<SecFiling[]> {
    try {
      const paddedCik = cik.padStart(10, '0');
      const url = `${this.baseUrl}/submissions/CIK${paddedCik}.json`;
      
      const response = await fetch(url, { 
        headers: this.headers,
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`SEC API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json() as SecSubmissionData;
      const recent = data.filings.recent;

      const filings: SecFiling[] = [];
      
      for (let i = 0; i < recent.accessionNumber.length && filings.length < limit; i++) {
        const form = recent.form[i];
        
        if (formTypes.includes(form)) {
          filings.push({
            accessionNumber: recent.accessionNumber[i],
            filingDate: recent.filingDate[i],
            form: form,
            primaryDocument: recent.primaryDocument[i],
            reportDate: recent.reportDate?.[i],
            acceptanceDateTime: recent.acceptanceDateTime[i]
          });
        }
      }

      return filings.sort((a, b) => 
        new Date(b.filingDate).getTime() - new Date(a.filingDate).getTime()
      );
    } catch (error) {
      throw new Error(`Failed to fetch filings for CIK ${cik}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // SECファイリングの具体的な内容（テキスト）を取得する
  async getFilingContent(cik: string, accessionNumber: string, primaryDocument: string): Promise<string> {
    try {
      const paddedCik = cik.padStart(10, '0');
      const cleanAccessionNumber = accessionNumber.replace(/-/g, '');
      const url = `${this.baseUrl}/Archives/edgar/data/${parseInt(paddedCik)}/${cleanAccessionNumber}/${primaryDocument}`;
      
      const response = await fetch(url, { 
        headers: this.headers,
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`SEC API returned ${response.status}: ${response.statusText}`);
      }

      return await response.text();
    } catch (error) {
      throw new Error(`Failed to fetch filing content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // SECファイリングのテキストから経営ガイダンス情報を抽出する（収益予想、利益予想等）
  extractGuidanceFromText(content: string, filingType: string): Array<{
    guidanceType: string;
    guidance: string;
    context: string;
  }> {
    const guidances: Array<{ guidanceType: string; guidance: string; context: string; }> = [];
    
    // 一般的なガイダンス関連キーワード
    const guidancePatterns = [
      /(?:guidance|outlook|forecast|expect|anticipate|project|estimate).*?(?:revenue|sales|earnings|income|margin|profit)/gi,
      /(?:fiscal year|FY|quarterly|Q[1-4]).*?(?:\$[\d,.]+ (?:million|billion)|[\d.]+% (?:growth|increase|decrease))/gi,
      /(?:we expect|we anticipate|we project|we estimate|management expects|management anticipates).*?(?:to be|will be|range|between).*?(?:\$[\d,.]+ (?:million|billion)|[\d.]+%)/gi
    ];

    for (const pattern of guidancePatterns) {
      const matches = content.match(pattern);
      if (matches) {
        for (const match of matches) {
          // 前後のコンテキストを取得（最大200文字）
          const matchIndex = content.indexOf(match);
          const start = Math.max(0, matchIndex - 100);
          const end = Math.min(content.length, matchIndex + match.length + 100);
          const context = content.substring(start, end);
          
          guidances.push({
            guidanceType: this.categorizeGuidance(match),
            guidance: match.trim(),
            context: context.trim()
          });
        }
      }
    }

    // 重複除去
    const uniqueGuidances = guidances.filter((guidance, index, self) => 
      index === self.findIndex(g => g.guidance === guidance.guidance)
    );

    return uniqueGuidances.slice(0, 10); // 最大10件まで
  }

  // ガイダンステキストをカテゴリ別に分類する（revenue、earnings、margin、capex等）
  private categorizeGuidance(guidanceText: string): string {
    const text = guidanceText.toLowerCase();
    
    if (text.includes('revenue') || text.includes('sales')) return 'revenue';
    if (text.includes('earnings') || text.includes('eps') || text.includes('income')) return 'earnings';
    if (text.includes('margin')) return 'margin';
    if (text.includes('capex') || text.includes('capital expenditure')) return 'capex';
    
    return 'other';
  }

  // 株式ティッカーシンボルをSEC CIK番号に変換する
  async convertTickerToCik(ticker: string): Promise<string | null> {
    try {
      const url = `${this.baseUrl}/files/company_tickers.json`;
      
      const response = await fetch(url, { 
        headers: this.headers,
        method: 'GET'
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      
      // company_tickers.jsonの構造: { "0": {"cik_str": 320193, "ticker": "AAPL", "title": "Apple Inc."}, ... }
      for (const key in data) {
        const company = data[key];
        if (company.ticker && company.ticker.toUpperCase() === ticker.toUpperCase()) {
          return company.cik_str.toString();
        }
      }

      return null;
    } catch (error) {
      console.warn(`Failed to convert ticker ${ticker} to CIK:`, error);
      return null;
    }
  }

  // 指定されたミリ秒待機する（レート制限対応用）
  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // SEC APIのレート制限（10リクエスト/秒）に対応したリクエスト実行
  private async rateLimitedRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    // SEC API rate limit: 10 requests per second
    await this.wait(100); // 100ms between requests
    return await requestFn();
  }
}