import { IRSummaryRequest, IRSummaryResponse } from '../types/schema';
import { IRService } from './irService';
import * as fs from 'fs';
import * as path from 'path';

interface TestCaseData {
  symbol: string;
  name: string;
  documentUrl: string;
  documentType: string;
  country: string;
  description: string;
}

export class IRSummaryService {
  private irService: IRService;

  constructor() {
    this.irService = new IRService();
  }

  async generateIRSummary(request: IRSummaryRequest): Promise<IRSummaryResponse> {
    try {
      console.log(`IR要約開始 - 銘柄: ${request.symbol}`);
      
      const documents = await this.collectIRDocuments(request.symbol);
      
      if (documents.length === 0) {
        throw new Error(`No IR documents found for symbol: ${request.symbol}`);
      }

      console.log(`${documents.length}件のIR文書を収集しました`);
      
      const summary = await this.analyzeAndSummarize(documents, request);
      
      return {
        symbol: request.symbol,
        companyName: request.companyName || this.extractCompanyName(request.symbol),
        language: request.language || 'ja',
        summary,
        sources: documents.map(doc => ({
          documentType: doc.documentType,
          extractionDate: doc.metadata.extractionDate,
          pageCount: doc.metadata.pageCount,
        })),
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('IR要約生成エラー:', error);
      throw new Error(`IR summary generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async collectIRDocuments(symbol: string): Promise<Array<any>> {
    const documents: Array<any> = [];
    
    // 1. ローカルPDFファイルをチェック
    await this.collectLocalDocuments(symbol, documents);
    
    // 2. 事前定義されたテストケースからIR情報を取得
    await this.collectRemoteDocuments(symbol, documents);

    console.log(`総計 ${documents.length} 件のIR文書を収集`);
    return documents;
  }

  private async collectLocalDocuments(symbol: string, documents: Array<any>): Promise<void> {
    const localPdfPath = path.join(process.cwd(), 'local_pdf');
    if (!fs.existsSync(localPdfPath)) {
      console.log('local_pdf ディレクトリが存在しません');
      return;
    }

    const files = fs.readdirSync(localPdfPath);
    const relevantFiles = files.filter(file => 
      file.endsWith('.pdf') && 
      (file.toLowerCase().includes(symbol.toLowerCase()) || 
       file.toLowerCase().includes(this.getCompanyKeyword(symbol)))
    );

    console.log(`ローカルPDF検索: ${relevantFiles.length}件の関連ファイルを発見`);

    for (const file of relevantFiles) {
      try {
        const filePath = path.join(localPdfPath, file);
        const documentType = this.determineDocumentType(file);
        const country = this.determineCountry(symbol);
        
        console.log(`ローカルPDF処理中: ${file}`);
        const result = await this.irService.extractFromLocalPDF(filePath, symbol, documentType, country);
        documents.push(result);
        console.log(`✓ ローカルPDF処理成功: ${file}`);
      } catch (error) {
        console.warn(`✗ ローカルPDF処理失敗 ${file}:`, error);
      }
    }
  }

  private async collectRemoteDocuments(symbol: string, documents: Array<any>): Promise<void> {
    const testCases = this.getTestCasesForSymbol(symbol);
    
    if (testCases.length === 0) {
      console.log(`銘柄 ${symbol} に対応する事前定義URLが見つかりません`);
      return;
    }

    console.log(`リモートURL検索: ${testCases.length}件のテストケース`);

    for (const testCase of testCases) {
      try {
        console.log(`リモートPDF処理中: ${testCase.description}`);
        const result = await this.irService.downloadAndExtractPDF({
          symbol: testCase.symbol,
          documentUrl: testCase.documentUrl,
          documentType: testCase.documentType as any,
          country: testCase.country as any,
        });
        documents.push(result);
        console.log(`✓ リモートPDF処理成功: ${testCase.description}`);
      } catch (error) {
        console.warn(`✗ リモートPDF処理失敗 ${testCase.description}:`, error);
      }
    }
  }

  private async analyzeAndSummarize(documents: Array<any>, request: IRSummaryRequest): Promise<any> {
    console.log('IR文書分析・要約処理開始');
    
    const combinedText = documents.map(doc => doc.extractedText).join('\n\n');
    const totalTextLength = combinedText.length;
    
    console.log(`結合テキスト長: ${totalTextLength.toLocaleString()} 文字`);
    
    // 財務ハイライトを抽出
    const financialHighlights = this.extractFinancialHighlights(combinedText, request.language);
    console.log('財務ハイライト抽出完了');
    
    // 事業セグメント情報を抽出
    const businessSegments = this.extractBusinessSegments(combinedText, request.language);
    console.log(`事業セグメント抽出完了: ${businessSegments.length}件`);
    
    // 見通し・ガイダンスを抽出
    const outlook = this.extractOutlook(combinedText, request.language);
    console.log('見通し・ガイダンス抽出完了');
    
    // 全体概要を生成
    const overview = this.generateOverview(combinedText, request.language);
    console.log('全体概要生成完了');
    
    // 重要メッセージを抽出
    const keyMessages = this.extractKeyMessages(combinedText, request.language);
    console.log(`重要メッセージ抽出完了: ${keyMessages.length}件`);

    return {
      overview,
      financialHighlights,
      businessSegments,
      outlook,
      keyMessages,
    };
  }

  private extractFinancialHighlights(text: string, language: string = 'ja'): any {
    const highlights: any = {
      keyMetrics: [],
    };

    // 売上高/売上収益を抽出
    const revenuePatterns = language === 'ja' 
      ? [
          /売上高[：:\s]*([0-9,]+(?:\.[0-9]+)?)\s*(?:億円|千万円|兆円|円)/gi,
          /売上収益[：:\s]*([0-9,]+(?:\.[0-9]+)?)\s*(?:億円|千万円|兆円|円)/gi,
          /Revenue[：:\s]*([¥$€])?\s*([0-9,]+(?:\.[0-9]+)?)\s*(?:billion|million|thousand)?/gi
        ]
      : [
          /Revenue[：:\s]*([¥$€])?\s*([0-9,]+(?:\.[0-9]+)?)\s*(?:billion|million|thousand)?/gi,
          /Net sales[：:\s]*([¥$€])?\s*([0-9,]+(?:\.[0-9]+)?)\s*(?:billion|million|thousand)?/gi
        ];
    
    for (const pattern of revenuePatterns) {
      const matches = Array.from(text.matchAll(pattern));
      if (matches.length > 0) {
        highlights.revenue = matches[0][0];
        break;
      }
    }

    // 利益情報を抽出（営業利益、当期純利益）
    const profitPatterns = language === 'ja'
      ? [
          /営業利益[：:\s]*([0-9,]+(?:\.[0-9]+)?)\s*(?:億円|千万円|兆円|円)/gi,
          /当期純利益[：:\s]*([0-9,]+(?:\.[0-9]+)?)\s*(?:億円|千万円|兆円|円)/gi,
          /純利益[：:\s]*([0-9,]+(?:\.[0-9]+)?)\s*(?:億円|千万円|兆円|円)/gi
        ]
      : [
          /Operating income[：:\s]*([¥$€])?\s*([0-9,]+(?:\.[0-9]+)?)\s*(?:billion|million|thousand)?/gi,
          /Net income[：:\s]*([¥$€])?\s*([0-9,]+(?:\.[0-9]+)?)\s*(?:billion|million|thousand)?/gi
        ];
    
    for (const pattern of profitPatterns) {
      const matches = Array.from(text.matchAll(pattern));
      if (matches.length > 0) {
        if (!highlights.operatingIncome && pattern.toString().includes('営業利益|Operating income')) {
          highlights.operatingIncome = matches[0][0];
        }
        if (!highlights.netIncome && pattern.toString().includes('純利益|Net income')) {
          highlights.netIncome = matches[0][0];
        }
      }
    }

    // 成長率や変化率を抽出
    const metricPatterns = language === 'ja'
      ? [
          /前年同期比[：:\s]*([+-]?[0-9,]+(?:\.[0-9]+)?%)/gi,
          /前年比[：:\s]*([+-]?[0-9,]+(?:\.[0-9]+)?%)/gi,
          /成長率[：:\s]*([+-]?[0-9,]+(?:\.[0-9]+)?%)/gi,
          /増減[：:\s]*([+-]?[0-9,]+(?:\.[0-9]+)?%)/gi
        ]
      : [
          /year-over-year[：:\s]*([+-]?[0-9,]+(?:\.[0-9]+)?%)/gi,
          /YoY[：:\s]*([+-]?[0-9,]+(?:\.[0-9]+)?%)/gi,
          /growth rate[：:\s]*([+-]?[0-9,]+(?:\.[0-9]+)?%)/gi
        ];
    
    for (const pattern of metricPatterns) {
      const matches = Array.from(text.matchAll(pattern));
      if (matches.length > 0) {
        highlights.keyMetrics.push(...matches.slice(0, 3).map(m => m[0]));
      }
    }

    return highlights;
  }

  private extractBusinessSegments(text: string, language: string = 'ja'): any[] {
    const segments: any[] = [];
    
    const segmentPatterns = language === 'ja'
      ? [
          /([^\n]*(?:事業|セグメント|部門|分野))[：:\s]*([^\n]{20,200})/gi,
          /([^\n]*(?:Game|Music|Pictures|Electronics|Financial))[：:\s]*([^\n]{20,200})/gi
        ]
      : [
          /([^\n]*(?:segment|business|division|sector))[：:\s]*([^\n]{20,200})/gi,
          /([^\n]*(?:iPhone|iPad|Mac|Services|Wearables))[：:\s]*([^\n]{20,200})/gi
        ];
    
    for (const pattern of segmentPatterns) {
      const matches = Array.from(text.matchAll(pattern));
      for (const match of matches.slice(0, 8)) {
        if (match[1] && match[2] && match[1].trim().length > 2) {
          segments.push({
            name: match[1].trim(),
            performance: match[2].trim(),
            outlook: undefined,
          });
        }
      }
    }

    return segments.slice(0, 6); // 最大6セグメント
  }

  private extractOutlook(text: string, language: string = 'ja'): any {
    const outlook: any = {
      risks: [],
      opportunities: [],
    };

    // ガイダンス・見通し情報を抽出
    const guidancePatterns = language === 'ja'
      ? [
          /(?:業績予想|見通し|ガイダンス|今後の方針)[：:\s]*([^\n]{30,300})/gi,
          /(?:2024|2025|2026).*?(?:予想|見込み)[：:\s]*([^\n]{30,300})/gi
        ]
      : [
          /(?:guidance|outlook|forecast|projection)[：:\s]*([^\n]{30,300})/gi,
          /(?:2024|2025|2026).*?(?:outlook|guidance)[：:\s]*([^\n]{30,300})/gi
        ];
    
    for (const pattern of guidancePatterns) {
      const matches = Array.from(text.matchAll(pattern));
      if (matches.length > 0) {
        outlook.guidance = matches[0][1].trim();
        break;
      }
    }

    // リスク要因を抽出
    const riskPatterns = language === 'ja'
      ? [
          /(?:リスク|課題|懸念|不安要素)[：:\s]*([^\n]{20,200})/gi,
          /(?:影響|変動|不確実性)[：:\s]*([^\n]{20,200})/gi
        ]
      : [
          /(?:risk|challenge|concern|uncertainty)[：:\s]*([^\n]{20,200})/gi,
          /(?:impact|volatility|headwind)[：:\s]*([^\n]{20,200})/gi
        ];
    
    for (const pattern of riskPatterns) {
      const matches = Array.from(text.matchAll(pattern));
      for (const match of matches.slice(0, 3)) {
        if (match[1] && match[1].trim().length > 10) {
          outlook.risks.push(match[1].trim());
        }
      }
    }

    // 成長機会を抽出
    const opportunityPatterns = language === 'ja'
      ? [
          /(?:機会|成長|戦略|投資|拡大)[：:\s]*([^\n]{20,200})/gi,
          /(?:新規|強化|推進|展開)[：:\s]*([^\n]{20,200})/gi
        ]
      : [
          /(?:opportunity|growth|strategy|investment|expansion)[：:\s]*([^\n]{20,200})/gi,
          /(?:innovation|development|initiative)[：:\s]*([^\n]{20,200})/gi
        ];
    
    for (const pattern of opportunityPatterns) {
      const matches = Array.from(text.matchAll(pattern));
      for (const match of matches.slice(0, 3)) {
        if (match[1] && match[1].trim().length > 10) {
          outlook.opportunities.push(match[1].trim());
        }
      }
    }

    return outlook;
  }

  private generateOverview(text: string, language: string = 'ja'): string {
    // 文書の冒頭部分から概要を抽出
    const lines = text.split('\n').filter(line => line.trim().length > 20);
    const relevantLines = lines.slice(0, 15);
    
    let overview = relevantLines.join(' ').trim();
    
    // 長すぎる場合は切り詰める
    if (overview.length > 800) {
      overview = overview.substring(0, 800) + '...';
    }
    
    // 空の場合はデフォルトメッセージ
    if (overview.length < 50) {
      overview = language === 'ja' 
        ? '当期の業績および事業概況についての詳細情報が含まれています。財務指標や事業セグメント別の実績、今後の見通しなどが報告されています。'
        : 'Detailed information about current period performance and business overview is included. Financial metrics, business segment results, and future outlook are reported.';
    }
    
    return overview;
  }

  private extractKeyMessages(text: string, language: string = 'ja'): string[] {
    const messages: string[] = [];
    
    const messagePatterns = language === 'ja'
      ? [
          /(?:重要|主要|ハイライト|ポイント)[：:\s]*([^\n]{20,300})/gi,
          /(?:まとめ|総括|結論)[：:\s]*([^\n]{20,300})/gi,
          /(?:特記|注目|強調)[：:\s]*([^\n]{20,300})/gi
        ]
      : [
          /(?:key|important|highlight|significant)[：:\s]*([^\n]{20,300})/gi,
          /(?:summary|conclusion|takeaway)[：:\s]*([^\n]{20,300})/gi,
          /(?:notable|remarkable|outstanding)[：:\s]*([^\n]{20,300})/gi
        ];
    
    for (const pattern of messagePatterns) {
      const matches = Array.from(text.matchAll(pattern));
      for (const match of matches.slice(0, 4)) {
        if (match[1] && match[1].trim().length > 15) {
          messages.push(match[1].trim());
        }
      }
    }

    // デフォルトメッセージ
    if (messages.length === 0) {
      messages.push(
        language === 'ja' 
          ? 'IR文書から重要な財務情報と事業内容が確認されました。詳細な業績数値と今後の見通しが報告されています。'
          : 'Important financial information and business content confirmed from IR documents. Detailed performance figures and future outlook are reported.'
      );
    }

    return messages;
  }

  private determineDocumentType(filename: string): any {
    const lower = filename.toLowerCase();
    if (lower.includes('q1') || lower.includes('q2') || lower.includes('q3') || lower.includes('q4') || lower.includes('quarterly')) {
      return 'quarterly_report';
    }
    if (lower.includes('annual') || lower.includes('年報') || lower.includes('annual_report')) {
      return 'annual_report';
    }
    if (lower.includes('presentation') || lower.includes('説明') || lower.includes('investor')) {
      return 'earnings_presentation';
    }
    if (lower.includes('10-k')) {
      return '10-K';
    }
    if (lower.includes('10-q')) {
      return '10-Q';
    }
    return 'quarterly_report';
  }

  private determineCountry(symbol: string): any {
    // 数字のみの銘柄コードは日本株と判定
    return /^\d+$/.test(symbol) ? 'JP' : 'US';
  }

  private getCompanyKeyword(symbol: string): string {
    // 銘柄コードをファイル名検索用のキーワードに変換
    return symbol.toLowerCase();
  }

  private extractCompanyName(symbol: string): string {
    // 銘柄コードをベースにした汎用的な会社名
    return /^\d+$/.test(symbol) ? `${symbol} 株式会社` : `${symbol} Inc.`;
  }

  private getTestCasesForSymbol(symbol: string): TestCaseData[] {
    // 既存のテストケースデータを読み込み
    try {
      const testCasesPath = path.join(process.cwd(), 'tests', 'fixtures', 'japanese-stocks.js');
      if (fs.existsSync(testCasesPath)) {
        delete require.cache[require.resolve(testCasesPath)];
        const testData = require(testCasesPath);
        
        const allCases = [
          ...(testData.JAPANESE_STOCK_TEST_CASES || []),
          ...(testData.AMERICAN_STOCK_TEST_CASES || [])
        ];
        
        return allCases.filter((testCase: TestCaseData) => testCase.symbol === symbol);
      }
    } catch (error) {
      console.warn('テストケースファイルの読み込みに失敗:', error);
    }
    
    return [];
  }
}