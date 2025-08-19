import { IRSummaryRequest, IRSummaryResponse } from '../types/schema';
import { IRService } from './irService';
import * as fs from 'fs';
import * as path from 'path';


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
      const keyMetrics = this.extractKeyMetrics(documents);
      const processingInfo = this.generateProcessingInfo(documents);
      
      return {
        symbol: request.symbol,
        documentType: this.determineMainDocumentType(documents),
        processingInfo,
        summary,
        key_metrics: keyMetrics,
        extractedText: undefined, // デバッグモード時のみ含める
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('IR要約生成エラー:', error);
      throw new Error(`IR summary generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async collectIRDocuments(symbol: string): Promise<Array<any>> {
    const documents: Array<any> = [];
    
    // ローカルPDFファイルのみをチェック
    await this.collectLocalDocuments(symbol, documents);

    console.log(`総計 ${documents.length} 件のIR文書を収集`);
    return documents;
  }

  private async collectLocalDocuments(symbol: string, documents: Array<any>): Promise<void> {
    const localPdfPath = path.join(process.cwd(), 'local_pdf');
    console.log(`[DEBUG] localPdfPath: ${localPdfPath}`);
    
    if (!fs.existsSync(localPdfPath)) {
      console.log('local_pdf ディレクトリが存在しません');
      return;
    }

    // 国別ディレクトリを判定
    const country = this.determineCountry(symbol);
    const countryPath = path.join(localPdfPath, country);
    console.log(`[DEBUG] country: ${country}, countryPath: ${countryPath}`);
    
    if (!fs.existsSync(countryPath)) {
      console.log(`${country} ディレクトリが存在しません`);
      return;
    }

    // 銘柄コード別ディレクトリをチェック
    const symbolPath = path.join(countryPath, symbol);
    console.log(`[DEBUG] symbolPath: ${symbolPath}`);
    
    if (!fs.existsSync(symbolPath)) {
      console.log(`銘柄 ${symbol} のディレクトリが存在しません`);
      return;
    }

    const files = fs.readdirSync(symbolPath);
    const pdfFiles = files.filter(file => file.endsWith('.pdf'));
    console.log(`[DEBUG] files: ${JSON.stringify(files)}, pdfFiles: ${JSON.stringify(pdfFiles)}`);

    console.log(`ローカルPDF検索: ${pdfFiles.length}件のPDFファイルを発見`);

    for (const file of pdfFiles) {
      try {
        const filePath = path.join(symbolPath, file);
        const documentType = this.determineDocumentTypeFromFilename(file);
        
        console.log(`ローカルPDF処理中: ${file} (type: ${documentType})`);
        const result = await this.irService.extractFromLocalPDF(filePath, symbol, documentType, country);
        documents.push(result);
        console.log(`✓ ローカルPDF処理成功: ${file}`);
      } catch (error) {
        console.warn(`✗ ローカルPDF処理失敗 ${file}:`, error);
      }
    }
  }


  private async analyzeAndSummarize(documents: Array<any>, request: IRSummaryRequest): Promise<any> {
    console.log('IR文書分析・要約処理開始');
    
    const combinedText = documents.map(doc => doc.extractedText).join('\n\n');
    const totalTextLength = combinedText.length;
    
    console.log(`結合テキスト長: ${totalTextLength.toLocaleString()} 文字`);
    
    // 3-5行の全体要約（executive）を生成
    const executive = this.generateExecutiveSummary(combinedText, request.language);
    console.log('全体要約生成完了');
    
    // 財務ハイライトを配列形式で抽出
    const financialHighlights = this.extractFinancialHighlightsArray(combinedText, request.language);
    console.log(`財務ハイライト抽出完了: ${financialHighlights.length}件`);
    
    // 事業セグメント情報を配列形式で抽出
    const businessSegments = this.extractBusinessSegmentsArray(combinedText, request.language);
    console.log(`事業セグメント抽出完了: ${businessSegments.length}件`);
    
    // リスク要因を抽出
    const risks = this.extractRisksArray(combinedText, request.language);
    console.log(`リスク要因抽出完了: ${risks.length}件`);
    
    // 見通し・ガイダンスを配列形式で抽出
    const outlook = this.extractOutlookArray(combinedText, request.language);
    console.log(`見通し抽出完了: ${outlook.length}件`);

    return {
      executive,
      financial_highlights: financialHighlights,
      business_segments: businessSegments,
      risks,
      outlook,
    };
  }

  private generateExecutiveSummary(text: string, language: string = 'ja'): string {
    // 文書の冒頭部分から重要な情報を抽出して3-5行の要約を生成
    const lines = text.split('\n').filter(line => line.trim().length > 20);
    const keyLines = lines.slice(0, 20); // 最初の20行から重要情報を抽出
    
    // ハイライトや要点を抽出
    const highlightPatterns = language === 'ja'
      ? [
          /(?:ハイライト|要点|重要|ポイント)[：:\s]*([^\n]{30,200})/gi,
          /(?:業績|売上|利益)[：:\s]*([^\n]{30,200})/gi
        ]
      : [
          /(?:highlights?|key points?|summary)[：:\s]*([^\n]{30,200})/gi,
          /(?:revenue|income|profit)[：:\s]*([^\n]{30,200})/gi
        ];
    
    const highlights: string[] = [];
    for (const pattern of highlightPatterns) {
      const matches = Array.from(text.matchAll(pattern));
      for (const match of matches.slice(0, 3)) {
        if (match[1] && match[1].trim().length > 20) {
          highlights.push(match[1].trim());
        }
      }
    }
    
    // 3-5行の要約を生成
    if (highlights.length > 0) {
      return highlights.slice(0, 5).join(' ');
    }
    
    // フォールバック: 最初の有意な文から要約を作成
    const meaningfulText = keyLines.join(' ').substring(0, 500);
    return language === 'ja'
      ? `当期の業績および事業概況に関する詳細情報が含まれています。${meaningfulText.substring(0, 200)}...などの重要なポイントが報告されています。`
      : `Detailed information about current period performance and business overview is included. ${meaningfulText.substring(0, 200)}... and other important points are reported.`;
  }

  private extractFinancialHighlightsArray(text: string, language: string = 'ja'): string[] {
    const highlights: string[] = [];

    // 売上高情報を抽出
    const revenuePatterns = language === 'ja' 
      ? [
          /(?:売上高|売上収益)[：:\s]*([0-9,]+(?:\.[0-9]+)?)\s*(?:億円|千万円|兆円|円)[^\n]{0,100}/gi,
          /Total Revenue[：:\s]*\$?\s*([0-9,]+(?:\.[0-9]+)?)\s*(?:billion|million)[^\n]{0,100}/gi
        ]
      : [
          /Revenue[：:\s]*\$?\s*([0-9,]+(?:\.[0-9]+)?)\s*(?:billion|million)[^\n]{0,100}/gi,
          /Net sales[：:\s]*\$?\s*([0-9,]+(?:\.[0-9]+)?)\s*(?:billion|million)[^\n]{0,100}/gi
        ];
    
    for (const pattern of revenuePatterns) {
      const matches = Array.from(text.matchAll(pattern));
      for (const match of matches.slice(0, 2)) {
        if (match[0] && match[0].trim().length > 10) {
          highlights.push(match[0].trim());
        }
      }
    }

    // 利益情報を抽出
    const profitPatterns = language === 'ja'
      ? [
          /(?:営業利益|純利益|当期純利益)[：:\s]*([+-]?[0-9,]+(?:\.[0-9]+)?)\s*(?:億円|千万円|兆円|円)[^\n]{0,100}/gi,
          /(?:Operating income|Net income)[：:\s]*\$?\s*([+-]?[0-9,]+(?:\.[0-9]+)?)\s*(?:billion|million)[^\n]{0,100}/gi
        ]
      : [
          /(?:Operating income|Net income|Profit)[：:\s]*\$?\s*([+-]?[0-9,]+(?:\.[0-9]+)?)\s*(?:billion|million)[^\n]{0,100}/gi,
          /(?:Earnings|Income)[：:\s]*\$?\s*([+-]?[0-9,]+(?:\.[0-9]+)?)\s*(?:billion|million)[^\n]{0,100}/gi
        ];
    
    for (const pattern of profitPatterns) {
      const matches = Array.from(text.matchAll(pattern));
      for (const match of matches.slice(0, 2)) {
        if (match[0] && match[0].trim().length > 10) {
          highlights.push(match[0].trim());
        }
      }
    }

    // 成長率情報を抽出
    const growthPatterns = language === 'ja'
      ? [
          /(?:前年同期比|前年比|成長率)[：:\s]*([+-]?[0-9,]+(?:\.[0-9]+)?%)[^\n]{0,80}/gi,
          /(?:up|increased?|growth)[：:\s]*([+-]?[0-9,]+(?:\.[0-9]+)?%)[^\n]{0,80}/gi
        ]
      : [
          /(?:year-over-year|YoY|growth)[：:\s]*([+-]?[0-9,]+(?:\.[0-9]+)?%)[^\n]{0,80}/gi,
          /(?:increased?|up|growth)[：:\s]*([+-]?[0-9,]+(?:\.[0-9]+)?%)[^\n]{0,80}/gi
        ];
    
    for (const pattern of growthPatterns) {
      const matches = Array.from(text.matchAll(pattern));
      for (const match of matches.slice(0, 3)) {
        if (match[0] && match[0].trim().length > 8) {
          highlights.push(match[0].trim());
        }
      }
    }

    return highlights.slice(0, 8); // 最大8項目
  }

  private extractBusinessSegmentsArray(text: string, language: string = 'ja'): string[] {
    const segments: string[] = [];
    
    const segmentPatterns = language === 'ja'
      ? [
          /([^\n]*(?:事業|セグメント|部門|分野)[^\n]{20,300})/gi,
          /([^\n]*(?:ゲーム|音楽|エレクトロニクス|金融)[^\n]{20,300})/gi
        ]
      : [
          /([^\n]*(?:segment|business|division|sector)[^\n]{20,300})/gi,
          /([^\n]*(?:iPhone|iPad|Mac|Services|Wearables|Auto|Point-of-Sale)[^\n]{20,300})/gi
        ];
    
    for (const pattern of segmentPatterns) {
      const matches = Array.from(text.matchAll(pattern));
      for (const match of matches.slice(0, 6)) {
        if (match[1] && match[1].trim().length > 15) {
          segments.push(match[1].trim());
        }
      }
    }

    return segments.slice(0, 8); // 最大8セグメント
  }

  private extractRisksArray(text: string, language: string = 'ja'): string[] {
    const risks: string[] = [];
    
    const riskPatterns = language === 'ja'
      ? [
          /([^\n]*(?:リスク|課題|懸念|不安要素|影響)[^\n]{20,300})/gi,
          /([^\n]*(?:不確実性|変動|障害)[^\n]{20,300})/gi
        ]
      : [
          /([^\n]*(?:risk|challenge|concern|uncertainty|headwind)[^\n]{20,300})/gi,
          /([^\n]*(?:impact|volatility|threat|obstacle)[^\n]{20,300})/gi
        ];
    
    for (const pattern of riskPatterns) {
      const matches = Array.from(text.matchAll(pattern));
      for (const match of matches.slice(0, 5)) {
        if (match[1] && match[1].trim().length > 15) {
          risks.push(match[1].trim());
        }
      }
    }

    return risks.slice(0, 6); // 最大6リスク
  }

  private extractOutlookArray(text: string, language: string = 'ja'): string[] {
    const outlook: string[] = [];

    // ガイダンス・見通し情報を抽出
    const outlookPatterns = language === 'ja'
      ? [
          /([^\n]*(?:業績予想|見通し|ガイダンス|今後の方針)[^\n]{30,300})/gi,
          /([^\n]*(?:2025|2026).*?(?:予想|見込み|見通し)[^\n]{30,300})/gi,
          /([^\n]*(?:成長|戦略|投資|拡大|展開)[^\n]{30,300})/gi
        ]
      : [
          /([^\n]*(?:guidance|outlook|forecast|projection)[^\n]{30,300})/gi,
          /([^\n]*(?:2025|2026).*?(?:outlook|guidance|forecast)[^\n]{30,300})/gi,
          /([^\n]*(?:growth|strategy|investment|expansion)[^\n]{30,300})/gi
        ];
    
    for (const pattern of outlookPatterns) {
      const matches = Array.from(text.matchAll(pattern));
      for (const match of matches.slice(0, 4)) {
        if (match[1] && match[1].trim().length > 25) {
          outlook.push(match[1].trim());
        }
      }
    }

    return outlook.slice(0, 6); // 最大6項目
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

  private extractKeyMetrics(documents: Array<any>): any {
    const combinedText = documents.map(doc => doc.extractedText).join('\n\n');
    const keyMetrics: any = {};

    // 売上高を数値で抽出
    const revenuePatterns = [
      /(?:Total Revenue|revenue)[：:\s]*\$?\s*([0-9,]+(?:\.[0-9]+)?)\s*(?:billion|million)/gi,
      /売上高[：:\s]*([0-9,]+(?:\.[0-9]+)?)\s*(?:億円|兆円)/gi
    ];
    
    for (const pattern of revenuePatterns) {
      const matches = Array.from(combinedText.matchAll(pattern));
      if (matches.length > 0) {
        const value = parseFloat(matches[0][1].replace(/,/g, ''));
        if (!isNaN(value)) {
          keyMetrics.revenue = value;
          break;
        }
      }
    }

    // 利益を数値で抽出
    const profitPatterns = [
      /(?:Net income|profit)[：:\s]*\$?\s*([+-]?[0-9,]+(?:\.[0-9]+)?)\s*(?:billion|million)/gi,
      /純利益[：:\s]*([+-]?[0-9,]+(?:\.[0-9]+)?)\s*(?:億円|兆円)/gi
    ];
    
    for (const pattern of profitPatterns) {
      const matches = Array.from(combinedText.matchAll(pattern));
      if (matches.length > 0) {
        const value = parseFloat(matches[0][1].replace(/,/g, ''));
        if (!isNaN(value)) {
          keyMetrics.profit = value;
          break;
        }
      }
    }

    // 成長率を数値で抽出
    const growthPatterns = [
      /(?:growth|increased?|up)[：:\s]*([+-]?[0-9,]+(?:\.[0-9]+)?)%/gi,
      /(?:前年同期比|成長率)[：:\s]*([+-]?[0-9,]+(?:\.[0-9]+)?)%/gi
    ];
    
    for (const pattern of growthPatterns) {
      const matches = Array.from(combinedText.matchAll(pattern));
      if (matches.length > 0) {
        const value = parseFloat(matches[0][1].replace(/,/g, ''));
        if (!isNaN(value)) {
          keyMetrics.growth_rate = value / 100; // パーセントを小数に変換
          break;
        }
      }
    }

    return keyMetrics;
  }

  private generateProcessingInfo(documents: Array<any>): any {
    const totalPages = documents.reduce((sum, doc) => sum + (doc.metadata?.pageCount || 0), 0);
    const totalProcessingTime = documents.reduce((sum, doc) => sum + (doc.metadata?.processingTime || 0), 0);
    
    return {
      pdfType: 'text' as const, // 現在はテキスト型のPDFのみサポート
      extractionMethod: 'pdf-parse',
      processingTime: totalProcessingTime,
      pageCount: totalPages,
    };
  }

  private determineMainDocumentType(documents: Array<any>): string {
    if (documents.length === 0) return 'unknown';
    // 最初のドキュメントのタイプをメインタイプとして返す
    return documents[0].documentType || 'quarterly_report';
  }

  private determineDocumentTypeFromFilename(filename: string): any {
    const lower = filename.toLowerCase();
    if (lower.includes('earnings')) return 'earnings_presentation';
    if (lower.includes('annual')) return 'annual_report';
    if (lower.includes('quarterly')) return 'quarterly_report';
    if (lower.includes('10k')) return '10-K';
    if (lower.includes('10q')) return '10-Q';
    if (lower.includes('presentation')) return 'earnings_presentation';
    return 'quarterly_report'; // デフォルト
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

}