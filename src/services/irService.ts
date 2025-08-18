import axios from 'axios';
import pdfParse from 'pdf-parse';
import { Buffer } from 'buffer';

export interface IRDocumentRequest {
  symbol: string;
  documentUrl: string;
  documentType: 'earnings_presentation' | 'annual_report' | 'quarterly_report' | '10-K' | '10-Q';
  country: 'US' | 'JP';
}

export interface IRDocumentResponse {
  symbol: string;
  documentType: string;
  country: string;
  extractedText: string;
  metadata: {
    pageCount: number;
    processingTime: number;
    documentSize: number;
    extractionDate: string;
  };
  summary?: {
    textLength: number;
    wordCount: number;
    containsFinancialData: boolean;
  };
}

export class IRService {
  private readonly USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  
  /**
   * PDFファイルをURLからダウンロードしてテキストを抽出
   */
  async downloadAndExtractPDF(request: IRDocumentRequest): Promise<IRDocumentResponse> {
    const startTime = Date.now();
    
    try {
      console.log(`IR PDF取得開始: ${request.symbol} (${request.country}) - ${request.documentUrl}`);
      
      // PDFファイルをダウンロード
      const response = await axios.get(request.documentUrl, {
        responseType: 'arraybuffer',
        timeout: 60000, // 60秒タイムアウト
        headers: {
          'User-Agent': this.USER_AGENT,
          'Accept': 'application/pdf,*/*',
        },
        maxContentLength: 50 * 1024 * 1024, // 50MB制限
      });
      
      if (response.status !== 200) {
        throw new Error(`PDF取得失敗: HTTP ${response.status}`);
      }
      
      const pdfBuffer = Buffer.from(response.data);
      
      // PDFヘッダー確認
      if (!this.isPDFFile(pdfBuffer)) {
        throw new Error('取得したファイルはPDF形式ではありません');
      }
      
      // PDF解析とテキスト抽出
      const pdfData = await pdfParse(pdfBuffer);
      
      const processingTime = Date.now() - startTime;
      
      // 結果を構築
      const result: IRDocumentResponse = {
        symbol: request.symbol,
        documentType: request.documentType,
        country: request.country,
        extractedText: pdfData.text,
        metadata: {
          pageCount: pdfData.numpages,
          processingTime,
          documentSize: pdfBuffer.length,
          extractionDate: new Date().toISOString(),
        },
        summary: this.generateTextSummary(pdfData.text),
      };
      
      console.log(`IR PDF処理完了: ${request.symbol} - ${result.metadata.pageCount}ページ, ${processingTime}ms`);
      
      return result;
      
    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error(`IR PDF処理エラー: ${request.symbol}`, error);
      
      throw new Error(
        `IR PDF処理失敗 (${request.symbol}): ${error instanceof Error ? error.message : '不明なエラー'} [処理時間: ${processingTime}ms]`
      );
    }
  }
  
  /**
   * ローカルPDFファイルからテキスト抽出
   */
  async extractFromLocalPDF(
    filePath: string, 
    symbol: string, 
    documentType: IRDocumentRequest['documentType'],
    country: IRDocumentRequest['country']
  ): Promise<IRDocumentResponse> {
    const startTime = Date.now();
    
    try {
      const fs = await import('fs/promises');
      const pdfBuffer = await fs.readFile(filePath);
      
      if (!this.isPDFFile(pdfBuffer)) {
        throw new Error('指定されたファイルはPDF形式ではありません');
      }
      
      const pdfData = await pdfParse(pdfBuffer);
      const processingTime = Date.now() - startTime;
      
      return {
        symbol,
        documentType,
        country,
        extractedText: pdfData.text,
        metadata: {
          pageCount: pdfData.numpages,
          processingTime,
          documentSize: pdfBuffer.length,
          extractionDate: new Date().toISOString(),
        },
        summary: this.generateTextSummary(pdfData.text),
      };
      
    } catch (error) {
      throw new Error(
        `ローカルPDF処理失敗: ${error instanceof Error ? error.message : '不明なエラー'}`
      );
    }
  }
  
  /**
   * PDFファイルかどうかを確認
   */
  private isPDFFile(buffer: Buffer): boolean {
    if (buffer.length < 4) return false;
    const header = buffer.slice(0, 4).toString();
    return header === '%PDF';
  }
  
  /**
   * テキストの基本統計を生成
   */
  private generateTextSummary(text: string) {
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    const containsFinancialData = this.detectFinancialData(text);
    
    return {
      textLength: text.length,
      wordCount,
      containsFinancialData,
    };
  }
  
  /**
   * 財務データが含まれているかを簡易判定
   */
  private detectFinancialData(text: string): boolean {
    const financialKeywords = [
      // 英語
      'revenue', 'profit', 'earnings', 'income', 'cash flow', 'balance sheet',
      'assets', 'liabilities', 'equity', 'quarterly', 'annual', 'fiscal',
      // 日本語
      '売上', '利益', '収益', '営業利益', '経常利益', '純利益', '売上高',
      '資産', '負債', '純資産', '四半期', '決算', '業績', 'キャッシュフロー'
    ];
    
    const lowerText = text.toLowerCase();
    return financialKeywords.some(keyword => 
      lowerText.includes(keyword.toLowerCase())
    );
  }
}

// IRServiceは汎用的なPDF処理機能のみを提供
// 具体的な企業データは tests/fixtures/ で管理