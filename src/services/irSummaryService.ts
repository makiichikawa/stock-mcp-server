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
    const documentType = this.determineMainDocumentType(documents);
    
    console.log(`結合テキスト長: ${totalTextLength.toLocaleString()} 文字`);
    console.log(`文書タイプ: ${documentType}`);
    
    // 3-5行の全体要約（executive）を生成
    const executive = this.generateExecutiveSummary(combinedText, request.language);
    console.log('全体要約生成完了');
    
    // 文書タイプに応じて異なる要約構造を生成
    if (this.isQuarterlyDocument(documentType)) {
      console.log('決算短信用要約を生成中...');
      return this.generateQuarterlyEarningSummary(combinedText, executive, request.language);
    } else if (this.isAnnualDocument(documentType)) {
      console.log('有価証券報告書用要約を生成中...');
      return this.generateAnnualReportSummary(combinedText, executive, request.language);
    } else {
      console.log('デフォルト（決算短信）として処理中...');
      return this.generateQuarterlyEarningSummary(combinedText, executive, request.language);
    }
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

  private isQuarterlyDocument(documentType: string): boolean {
    return ['earnings_presentation', 'quarterly_report', '10-Q'].includes(documentType);
  }

  private isAnnualDocument(documentType: string): boolean {
    return ['annual_report', '10-K'].includes(documentType);
  }

  private generateQuarterlyEarningSummary(text: string, executive: string, language: string = 'ja'): any {
    console.log('決算短信用要約生成開始');
    
    return {
      executive,
      financial_comparison: this.extractFinancialComparison(text, language),
      guidance_changes: this.extractGuidanceChanges(text, language),
    };
  }

  private generateAnnualReportSummary(text: string, executive: string, language: string = 'ja'): any {
    console.log('有価証券報告書用要約生成開始');
    
    return {
      executive,
      business_situation: this.extractBusinessSituation(text, language),
      balance_sheet: this.extractBalanceSheetAnalysis(text, language),
      profit_loss: this.extractProfitLossAnalysis(text, language),
    };
  }

  private extractFinancialComparison(text: string, language: string = 'ja'): any {
    console.log('財務比較データ抽出中');
    
    const comparison = {
      revenue: this.extractFinancialMetric(text, 'revenue', language),
      operating_income: this.extractFinancialMetric(text, 'operating_income', language),
      ordinary_income: this.extractFinancialMetric(text, 'ordinary_income', language),
      operating_cash_flow: this.extractFinancialMetric(text, 'operating_cash_flow', language),
    };

    console.log('財務比較データ抽出完了');
    return comparison;
  }

  private extractFinancialMetric(text: string, metricType: string, language: string = 'ja'): any {
    let patterns: RegExp[] = [];
    
    if (language === 'ja') {
      switch (metricType) {
        case 'revenue':
          patterns = [
            /売上高[：:\s]*([0-9,]+(?:\.[0-9]+)?)\s*(?:億円|千万円|兆円|円)[^\n]*?前年同期[^\n]*?([0-9,]+(?:\.[0-9]+)?)\s*(?:億円|千万円|兆円|円)/gi,
            /売上収益[：:\s]*([0-9,]+(?:\.[0-9]+)?)\s*(?:億円|千万円|兆円|円)[^\n]*?前期[^\n]*?([0-9,]+(?:\.[0-9]+)?)\s*(?:億円|千万円|兆円|円)/gi,
          ];
          break;
        case 'operating_income':
          patterns = [
            /営業利益[：:\s]*([+-]?[0-9,]+(?:\.[0-9]+)?)\s*(?:億円|千万円|兆円|円)[^\n]*?前年同期[^\n]*?([+-]?[0-9,]+(?:\.[0-9]+)?)\s*(?:億円|千万円|兆円|円)/gi,
          ];
          break;
        case 'ordinary_income':
          patterns = [
            /経常利益[：:\s]*([+-]?[0-9,]+(?:\.[0-9]+)?)\s*(?:億円|千万円|兆円|円)[^\n]*?前年同期[^\n]*?([+-]?[0-9,]+(?:\.[0-9]+)?)\s*(?:億円|千万円|兆円|円)/gi,
          ];
          break;
        case 'operating_cash_flow':
          patterns = [
            /営業活動によるキャッシュフロー[：:\s]*([+-]?[0-9,]+(?:\.[0-9]+)?)\s*(?:億円|千万円|兆円|円)[^\n]*?前年同期[^\n]*?([+-]?[0-9,]+(?:\.[0-9]+)?)\s*(?:億円|千万円|兆円|円)/gi,
            /営業CF[：:\s]*([+-]?[0-9,]+(?:\.[0-9]+)?)\s*(?:億円|千万円|兆円|円)[^\n]*?前期[^\n]*?([+-]?[0-9,]+(?:\.[0-9]+)?)\s*(?:億円|千万円|兆円|円)/gi,
          ];
          break;
      }
    }

    for (const pattern of patterns) {
      const matches = Array.from(text.matchAll(pattern));
      if (matches.length > 0) {
        const match = matches[0];
        const current = this.parseNumber(match[1]);
        const previous = this.parseNumber(match[2]);
        
        if (current !== undefined && previous !== undefined) {
          const changeAmount = current - previous;
          const changePercent = previous !== 0 ? (changeAmount / previous) * 100 : 0;
          
          return {
            current,
            previous,
            change_amount: changeAmount,
            change_percent: Math.round(changePercent * 100) / 100,
          };
        }
      }
    }

    return {};
  }

  private extractGuidanceChanges(text: string, language: string = 'ja'): any {
    console.log('業績予想変更抽出中');
    
    const revisionPatterns = language === 'ja'
      ? [
          /(?:上方修正|業績予想.*?修正.*?上方)/gi,
          /(?:下方修正|業績予想.*?修正.*?下方)/gi,
          /(?:予想.*?変更|ガイダンス.*?変更|見通し.*?変更)/gi,
        ]
      : [
          /(?:upward revision|raised.*?guidance|increased.*?forecast)/gi,
          /(?:downward revision|lowered.*?guidance|reduced.*?forecast)/gi,
          /(?:revised.*?guidance|updated.*?forecast)/gi,
        ];

    let hasRevision = false;
    let revisionType = 'none';
    let details = '';

    for (const pattern of revisionPatterns) {
      const matches = Array.from(text.matchAll(pattern));
      if (matches.length > 0) {
        hasRevision = true;
        const matchText = matches[0][0];
        details = matchText;
        
        if (matchText.includes('上方') || matchText.includes('upward') || matchText.includes('raised') || matchText.includes('increased')) {
          revisionType = 'upward';
        } else if (matchText.includes('下方') || matchText.includes('downward') || matchText.includes('lowered') || matchText.includes('reduced')) {
          revisionType = 'downward';
        }
        break;
      }
    }

    console.log(`業績予想変更: ${hasRevision ? revisionType : 'なし'}`);
    return {
      has_revision: hasRevision,
      revision_type: revisionType as 'upward' | 'downward' | 'none',
      details: details || undefined,
    };
  }

  private extractBusinessSituation(text: string, language: string = 'ja'): any {
    console.log('事業状況抽出中');
    
    const segmentPatterns = language === 'ja'
      ? [
          /([^\n]*(?:事業|セグメント|部門)[^\n]*?)(?:が|は).*?(?:最も|最大|主要|中心).*?(?:利益|収益|売上)/gi,
          /(?:利益|収益).*?(?:最も|最大|主要).*?([^\n]*(?:事業|セグメント|部門)[^\n]*)/gi,
        ]
      : [
          /([^\n]*(?:segment|business|division)[^\n]*?).*?(?:most|largest|primary|main).*?(?:profit|revenue|income)/gi,
          /(?:profit|revenue|income).*?(?:most|largest|primary).*?([^\n]*(?:segment|business|division)[^\n]*)/gi,
        ];

    let mostProfitableSegment = '';
    let segmentDetails = '';

    for (const pattern of segmentPatterns) {
      const matches = Array.from(text.matchAll(pattern));
      if (matches.length > 0) {
        mostProfitableSegment = matches[0][1]?.trim() || '';
        segmentDetails = matches[0][0]?.trim() || '';
        break;
      }
    }

    console.log(`最利益セグメント: ${mostProfitableSegment}`);
    return {
      most_profitable_segment: mostProfitableSegment || undefined,
      segment_details: segmentDetails || undefined,
    };
  }

  private extractBalanceSheetAnalysis(text: string, language: string = 'ja'): any {
    console.log('貸借対照表分析中');
    
    const bsPatterns = language === 'ja'
      ? [
          /総資産[：:\s]*([0-9,]+(?:\.[0-9]+)?)\s*(?:億円|千万円|兆円|円)[^\n]*純資産[：:\s]*([0-9,]+(?:\.[0-9]+)?)\s*(?:億円|千万円|兆円|円)/gi,
          /純資産[：:\s]*([0-9,]+(?:\.[0-9]+)?)\s*(?:億円|千万円|兆円|円)[^\n]*総資産[：:\s]*([0-9,]+(?:\.[0-9]+)?)\s*(?:億円|千万円|兆円|円)/gi,
          /自己資本比率[：:\s]*([0-9,]+(?:\.[0-9]+)?)%/gi,
        ]
      : [
          /total assets[：:\s]*([0-9,]+(?:\.[0-9]+)?)[^\n]*equity[：:\s]*([0-9,]+(?:\.[0-9]+)?)/gi,
          /equity ratio[：:\s]*([0-9,]+(?:\.[0-9]+)?)%/gi,
        ];

    let equityRatio: number | undefined;
    let totalAssets: number | undefined;
    let netAssets: number | undefined;
    let assessment: 'excellent' | 'good' | 'fair' | 'poor' | undefined;

    for (const pattern of bsPatterns) {
      const matches = Array.from(text.matchAll(pattern));
      if (matches.length > 0) {
        const match = matches[0];
        
        if (pattern.toString().includes('自己資本比率') || pattern.toString().includes('equity ratio')) {
          equityRatio = this.parseNumber(match[1]);
        } else {
          const asset1 = this.parseNumber(match[1]);
          const asset2 = this.parseNumber(match[2]);
          
          if (asset1 && asset2) {
            if (pattern.toString().includes('総資産.*純資産')) {
              totalAssets = asset1;
              netAssets = asset2;
              equityRatio = (asset2 / asset1) * 100;
            } else {
              totalAssets = asset2;
              netAssets = asset1;
              equityRatio = (asset1 / asset2) * 100;
            }
          }
        }
        
        if (equityRatio) {
          if (equityRatio >= 70) assessment = 'excellent';
          else if (equityRatio >= 40) assessment = 'good';
          else if (equityRatio >= 20) assessment = 'fair';
          else assessment = 'poor';
          break;
        }
      }
    }

    console.log(`純資産比率: ${equityRatio}% (${assessment})`);
    return {
      equity_ratio: equityRatio,
      equity_ratio_assessment: assessment,
      total_assets: totalAssets,
      net_assets: netAssets,
    };
  }

  private extractProfitLossAnalysis(text: string, language: string = 'ja'): any {
    console.log('損益計算書分析中');
    
    const plPatterns = language === 'ja'
      ? [
          /売上.*?([0-9,]+(?:\.[0-9]+)?)\s*(?:億円|兆円)[^\n]*前年.*?([0-9,]+(?:\.[0-9]+)?)\s*(?:億円|兆円)/gi,
          /利益.*?([0-9,]+(?:\.[0-9]+)?)\s*(?:億円|兆円)[^\n]*前年.*?([0-9,]+(?:\.[0-9]+)?)\s*(?:億円|兆円)/gi,
          /前年同期比.*?売上.*?([+-]?[0-9,]+(?:\.[0-9]+)?)%/gi,
          /前年同期比.*?利益.*?([+-]?[0-9,]+(?:\.[0-9]+)?)%/gi,
        ]
      : [
          /revenue.*?([0-9,]+(?:\.[0-9]+)?)[^\n]*previous.*?([0-9,]+(?:\.[0-9]+)?)/gi,
          /profit.*?([0-9,]+(?:\.[0-9]+)?)[^\n]*previous.*?([0-9,]+(?:\.[0-9]+)?)/gi,
        ];

    let revenueImproved: boolean | undefined;
    let profitImproved: boolean | undefined;
    let revenueChangePercent: number | undefined;
    let profitChangePercent: number | undefined;
    let details = '';

    for (const pattern of plPatterns) {
      const matches = Array.from(text.matchAll(pattern));
      if (matches.length > 0) {
        const match = matches[0];
        
        if (pattern.toString().includes('%')) {
          const changePercent = this.parseNumber(match[1]);
          if (changePercent !== undefined) {
            if (pattern.toString().includes('売上') || pattern.toString().includes('revenue')) {
              revenueChangePercent = changePercent;
              revenueImproved = changePercent > 0;
            } else if (pattern.toString().includes('利益') || pattern.toString().includes('profit')) {
              profitChangePercent = changePercent;
              profitImproved = changePercent > 0;
            }
          }
        } else {
          const current = this.parseNumber(match[1]);
          const previous = this.parseNumber(match[2]);
          
          if (current !== undefined && previous !== undefined) {
            const changePercent = previous !== 0 ? ((current - previous) / previous) * 100 : 0;
            
            if (pattern.toString().includes('売上') || pattern.toString().includes('revenue')) {
              revenueChangePercent = Math.round(changePercent * 100) / 100;
              revenueImproved = changePercent > 0;
            } else if (pattern.toString().includes('利益') || pattern.toString().includes('profit')) {
              profitChangePercent = Math.round(changePercent * 100) / 100;
              profitImproved = changePercent > 0;
            }
          }
        }
        
        details += match[0] + ' ';
      }
    }

    console.log(`売上向上: ${revenueImproved}, 利益向上: ${profitImproved}`);
    return {
      revenue_improved: revenueImproved,
      profit_improved: profitImproved,
      revenue_change_percent: revenueChangePercent,
      profit_change_percent: profitChangePercent,
      details: details.trim() || undefined,
    };
  }

  private parseNumber(str: string): number | undefined {
    if (!str) return undefined;
    const cleanStr = str.replace(/,/g, '').replace(/[^\d.-]/g, '');
    const num = parseFloat(cleanStr);
    return isNaN(num) ? undefined : num;
  }

}