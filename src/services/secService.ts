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
  private readonly archiveBaseUrl = 'https://www.sec.gov';
  private readonly headers = {
    'User-Agent': 'Individual Investor sample@email.com'
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
      
      // 正しいEDGAR URLパターンを使用（www.sec.govを使用）
      const url = `${this.archiveBaseUrl}/Archives/edgar/data/${paddedCik}/${cleanAccessionNumber}/${primaryDocument}`;
      
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

  // 10-Kファイリング専用のガイダンス情報を取得する（年次レポートから詳細なガイダンスを抽出）
  async get10KGuidance(cik: string, limit: number = 3): Promise<Array<{
    guidanceType: string;
    guidance: string;
    context: string;
    fiscalYear: string;
    filingDate: string;
    accessionNumber: string;
  }>> {
    try {
      const paddedCik = cik.padStart(10, '0');
      
      // 最新の10-Kファイリングのみを取得
      const tenKFilings = await this.getRecentFilings(paddedCik, ['10-K'], limit);
      
      if (tenKFilings.length === 0) {
        return [];
      }

      const guidances: Array<{
        guidanceType: string;
        guidance: string;
        context: string;
        fiscalYear: string;
        filingDate: string;
        accessionNumber: string;
      }> = [];

      for (const filing of tenKFilings) {
        try {
          await this.wait(100); // レート制限対応
          const content = await this.getFilingContent(paddedCik, filing.accessionNumber, filing.primaryDocument);
          
          // 10-K専用のガイダンス抽出
          const extractedGuidances = this.extract10KSpecificGuidance(content);
          
          // 会計年度を推定
          const fiscalYear = this.estimateFiscalYear(filing.filingDate, content);
          
          for (const guidance of extractedGuidances) {
            guidances.push({
              ...guidance,
              fiscalYear,
              filingDate: filing.filingDate,
              accessionNumber: filing.accessionNumber
            });
          }
        } catch (fileError) {
          console.warn(`Failed to process 10-K filing ${filing.accessionNumber}:`, fileError);
          continue;
        }
      }

      return guidances.slice(0, 20); // 最大20件まで
    } catch (error) {
      throw new Error(`Failed to fetch 10-K guidance for CIK ${cik}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // 10-K専用のガイダンス抽出（年次レポート特有の情報を重点的に抽出）
  private extract10KSpecificGuidance(content: string): Array<{
    guidanceType: string;
    guidance: string;
    context: string;
  }> {
    const guidances: Array<{ guidanceType: string; guidance: string; context: string; }> = [];
    
    // 10-K特有のガイダンスパターン（より詳細で具体的）
    const tenKPatterns = [
      // 年次ガイダンスパターン
      /(?:for (?:fiscal )?(?:year|FY) [\d]{4}|in [\d]{4}|next (?:fiscal )?year).*?(?:we expect|we anticipate|we project|expected|anticipated|projected).*?(?:revenue|sales|earnings|income|margin|growth).*?(?:to be|will be|range|between|approximately|about).*?(?:\$[\d,.]+ (?:million|billion)|[\d.]+%)/gi,
      
      // 戦略的ガイダンス
      /(?:strategic|long[- ]?term|multi[- ]?year).*?(?:plan|initiative|goal|target|objective).*?(?:revenue|growth|margin|profitability).*?(?:\$[\d,.]+ (?:million|billion)|[\d.]+%)/gi,
      
      // 設備投資ガイダンス
      /(?:capital expenditure|capex|capital investment).*?(?:expect|anticipate|plan|budget).*?(?:\$[\d,.]+ (?:million|billion))/gi,
      
      // 営業レバレッジ・効率性ガイダンス
      /(?:operating leverage|efficiency|cost reduction|margin expansion).*?(?:expect|target|plan).*?(?:[\d.]+%|basis points|bps)/gi,
      
      // 市場拡大・成長戦略
      /(?:market expansion|growth strategy|addressable market).*?(?:expect|target|plan).*?(?:revenue|growth|market share).*?(?:\$[\d,.]+ (?:million|billion)|[\d.]+%)/gi
    ];

    for (const pattern of tenKPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        for (const match of matches) {
          const matchIndex = content.indexOf(match);
          const start = Math.max(0, matchIndex - 150);
          const end = Math.min(content.length, matchIndex + match.length + 150);
          const context = content.substring(start, end);
          
          guidances.push({
            guidanceType: this.categorize10KGuidance(match),
            guidance: match.trim(),
            context: context.trim()
          });
        }
      }
    }

    // Management Discussion & Analysis (MD&A) セクション専用の抽出
    const mdaSection = this.extractMDASection(content);
    if (mdaSection) {
      const mdaGuidances = this.extractGuidanceFromMDA(mdaSection);
      guidances.push(...mdaGuidances);
    }

    // 重複除去
    const uniqueGuidances = guidances.filter((guidance, index, self) => 
      index === self.findIndex(g => g.guidance === guidance.guidance)
    );

    return uniqueGuidances.slice(0, 15); // 10-Kなので多めに15件まで
  }

  // 10-Kガイダンスのカテゴリ分類（より詳細な分類）
  private categorize10KGuidance(guidanceText: string): string {
    const text = guidanceText.toLowerCase();
    
    if (text.includes('revenue') || text.includes('sales') || text.includes('top line')) return 'revenue';
    if (text.includes('earnings') || text.includes('eps') || text.includes('net income') || text.includes('bottom line')) return 'earnings';
    if (text.includes('margin') || text.includes('profitability')) return 'margin';
    if (text.includes('capex') || text.includes('capital expenditure') || text.includes('capital investment')) return 'capex';
    if (text.includes('operating leverage') || text.includes('efficiency') || text.includes('cost')) return 'operational';
    if (text.includes('growth') || text.includes('expansion') || text.includes('market')) return 'growth';
    if (text.includes('strategic') || text.includes('long-term') || text.includes('multi-year')) return 'strategic';
    
    return 'other';
  }

  // 会計年度を推定する（ファイリング日付と内容から）
  private estimateFiscalYear(filingDate: string, content: string): string {
    const filingYear = new Date(filingDate).getFullYear();
    
    // 10-Kの内容から会計年度終了日を検索
    const fiscalYearPatterns = [
      /fiscal year ended (?:december 31, |march 31, |june 30, |september 30, )?(\d{4})/i,
      /year ended (?:december 31, |march 31, |june 30, |september 30, )?(\d{4})/i,
      /for the (?:fiscal )?year (\d{4})/i
    ];

    for (const pattern of fiscalYearPatterns) {
      const match = content.match(pattern);
      if (match) {
        return `FY${match[1]}`;
      }
    }

    // パターンマッチできない場合は、ファイリング年度の前年を推定
    return `FY${filingYear - 1}`;
  }

  // Management Discussion & Analysis セクションを抽出
  private extractMDASection(content: string): string | null {
    const mdaPatterns = [
      /item 7\..*?management['\s]*s discussion and analysis.*?item 8\./is,
      /management['\s]*s discussion and analysis.*?(?=item \d+|item [ivx]+)/is
    ];

    for (const pattern of mdaPatterns) {
      const match = content.match(pattern);
      if (match) {
        return match[0];
      }
    }

    return null;
  }

  // MD&Aセクション専用のガイダンス抽出
  private extractGuidanceFromMDA(mdaContent: string): Array<{
    guidanceType: string;
    guidance: string;
    context: string;
  }> {
    const guidances: Array<{ guidanceType: string; guidance: string; context: string; }> = [];
    
    // MD&A特有のガイダンスパターン
    const mdaPatterns = [
      /(?:looking forward|going forward|in the coming year|for the next fiscal year).*?(?:we expect|we anticipate|we believe).*?(?:\$[\d,.]+ (?:million|billion)|[\d.]+%)/gi,
      /(?:our outlook|business outlook|financial outlook).*?(?:\$[\d,.]+ (?:million|billion)|[\d.]+%)/gi,
      /(?:management believes|management expects|management anticipates).*?(?:revenue|earnings|margin|growth).*?(?:\$[\d,.]+ (?:million|billion)|[\d.]+%)/gi
    ];

    for (const pattern of mdaPatterns) {
      const matches = mdaContent.match(pattern);
      if (matches) {
        for (const match of matches) {
          const matchIndex = mdaContent.indexOf(match);
          const start = Math.max(0, matchIndex - 100);
          const end = Math.min(mdaContent.length, matchIndex + match.length + 100);
          const context = mdaContent.substring(start, end);
          
          guidances.push({
            guidanceType: this.categorize10KGuidance(match),
            guidance: match.trim(),
            context: context.trim()
          });
        }
      }
    }

    return guidances;
  }
}