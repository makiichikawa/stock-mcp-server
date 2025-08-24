import { z } from 'zod';

export const StockSymbolSchema = z.object({
  symbol: z.string().min(1, 'Stock symbol is required'),
});

export const StockPriceResponseSchema = z.object({
  symbol: z.string(),
  price: z.number(),
  currency: z.string(),
  change: z.number().optional(),
  changePercent: z.number().optional(),
  marketCap: z.number().optional(),
  volume: z.number().optional(),
  timestamp: z.string(),
});

export const FinancialDataResponseSchema = z.object({
  symbol: z.string(),
  companyName: z.string().optional(),
  marketCap: z.number().optional(),
  enterpriseValue: z.number().optional(),
  trailingPE: z.number().optional(),
  forwardPE: z.number().optional(),
  pegRatio: z.number().optional(),
  priceToBook: z.number().optional(),
  priceToSales: z.number().optional(),
  enterpriseToRevenue: z.number().optional(),
  enterpriseToEbitda: z.number().optional(),
  totalRevenue: z.number().optional(),
  revenuePerShare: z.number().optional(),
  quarterlyRevenueGrowth: z.number().optional(),
  grossProfit: z.number().optional(),
  ebitda: z.number().optional(),
  netIncomeToCommon: z.number().optional(),
  quarterlyEarningsGrowth: z.number().optional(),
  totalCash: z.number().optional(),
  totalCashPerShare: z.number().optional(),
  totalDebt: z.number().optional(),
  debtToEquity: z.number().optional(),
  currentRatio: z.number().optional(),
  bookValuePerShare: z.number().optional(),
  operatingCashFlow: z.number().optional(),
  leveredFreeCashFlow: z.number().optional(),
  returnOnAssets: z.number().optional(),
  returnOnEquity: z.number().optional(),
  profitMargin: z.number().optional(),
  operatingMargin: z.number().optional(),
  dividendYield: z.number().optional(),
  payoutRatio: z.number().optional(),
  beta: z.number().optional(),
  timestamp: z.string(),
});

export const ProfitabilityTurnAroundSchema = z.object({
  symbol: z.string(),
  companyName: z.string().optional(),
  currentQuarterNetIncome: z.number().optional(),
  previousQuarterNetIncome: z.number().optional(),
  currentQuarterOperatingIncome: z.number().optional(),
  previousQuarterOperatingIncome: z.number().optional(),
  currentQuarterEarnings: z.number().optional(),
  previousQuarterEarnings: z.number().optional(),
  turnAroundStatus: z.enum(['profit_turnaround', 'loss_turnaround', 'continued_profit', 'continued_loss']),
  quarterlyChange: z.number().optional(),
  marketCap: z.number().optional(),
  timestamp: z.string(),
});

export const StockScreenerSchema = z.object({
  symbols: z.array(z.string()).min(1, 'At least one stock symbol is required'),
  minMarketCap: z.number().optional(),
  maxMarketCap: z.number().optional(),
});

export const ForecastSourceSchema = z.enum(['sec_filing', 'analyst_consensus', 'management_guidance', 'yahoo_finance']);

export const QuarterlyForecastItemSchema = z.object({
  quarter: z.string(), // "Q1 2025", "Q2 2025", etc.
  fiscalYear: z.number(),
  earningsPerShare: z.number().optional(),
  revenue: z.number().optional(),
  netIncome: z.number().optional(),
  source: ForecastSourceSchema,
  updatedDate: z.string(),
});

export const QuarterlyEarningsForecastSchema = z.object({
  symbol: z.string(),
  companyName: z.string().optional(),
  forecasts: z.array(QuarterlyForecastItemSchema),
  timestamp: z.string(),
});

export const AnnualForecastItemSchema = z.object({
  fiscalYear: z.number(),
  earningsPerShare: z.number().optional(),
  revenue: z.number().optional(),
  netIncome: z.number().optional(),
  source: ForecastSourceSchema,
  updatedDate: z.string(),
});

export const AnnualEarningsForecastSchema = z.object({
  symbol: z.string(),
  companyName: z.string().optional(),
  forecasts: z.array(AnnualForecastItemSchema),
  timestamp: z.string(),
});

export const GuidanceItemSchema = z.object({
  guidanceType: z.enum(['revenue', 'earnings', 'margin', 'capex', 'operational', 'growth', 'strategic', 'other']),
  period: z.string(), // "Q1 2025", "FY2025", etc.
  guidance: z.string(), // Actual guidance text
  value: z.number().optional(),
  valueRange: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional(),
  source: z.string(), // Filing type: "10-K", "10-Q", "8-K", "Earnings Call"
  filingDate: z.string(),
  url: z.string().optional(),
  context: z.string().optional(), // 10-K用の追加コンテキスト情報
});

export const EarningsGuidanceSchema = z.object({
  symbol: z.string(),
  companyName: z.string().optional(),
  guidances: z.array(GuidanceItemSchema),
  timestamp: z.string(),
});

// IR文書処理用スキーマ

export const LocalPDFSchema = z.object({
  symbol: z.string().min(1).max(10),
  filePath: z.string().min(1),
  documentType: z.enum(['earnings_presentation', 'annual_report', 'quarterly_report', '10-K', '10-Q']),
  country: z.enum(['US', 'JP']),
});

export const IRDocumentResponseSchema = z.object({
  symbol: z.string(),
  documentType: z.string(),
  country: z.string(),
  extractedText: z.string(),
  metadata: z.object({
    pageCount: z.number(),
    processingTime: z.number(),
    documentSize: z.number(),
    extractionDate: z.string(),
  }),
  summary: z.object({
    textLength: z.number(),
    wordCount: z.number(),
    containsFinancialData: z.boolean(),
  }).optional(),
});

export type StockSymbolInput = z.infer<typeof StockSymbolSchema>;
export type StockPriceResponse = z.infer<typeof StockPriceResponseSchema>;
export type FinancialDataResponse = z.infer<typeof FinancialDataResponseSchema>;
export type ProfitabilityTurnAroundResponse = z.infer<typeof ProfitabilityTurnAroundSchema>;
export type StockScreenerInput = z.infer<typeof StockScreenerSchema>;
export type QuarterlyEarningsForecastResponse = z.infer<typeof QuarterlyEarningsForecastSchema>;
export type AnnualEarningsForecastResponse = z.infer<typeof AnnualEarningsForecastSchema>;
export type EarningsGuidanceResponse = z.infer<typeof EarningsGuidanceSchema>;
export type ForecastSource = z.infer<typeof ForecastSourceSchema>;
export type LocalPDFInput = z.infer<typeof LocalPDFSchema>;
export type IRDocumentResponse = z.infer<typeof IRDocumentResponseSchema>;

// IR要約機能用スキーマ（要件定義書準拠）
export const IRSummaryRequestSchema = z.object({
  symbol: z.string().min(1).max(10),
  companyName: z.string().optional(),
  language: z.enum(['ja', 'en']).default('ja'),
  extractionMode: z.enum(['text', 'layout', 'ocr', 'auto']).optional().default('auto'),
  documentTypeFilter: z.enum(['earnings_presentation', 'annual_report', 'quarterly_report', '10-K', '10-Q']).optional(),
  includeMarketEnvironment: z.boolean().optional().default(false),
  marketRegion: z.enum(['US', 'JP', 'GLOBAL']).optional().default('US'),
});

// 決算短信用の要約スキーマ
export const QuarterlyEarningSummarySchema = z.object({
  executive: z.string(), // 全文要約（3-5行）
  financial_comparison: z.object({
    revenue: z.object({
      current: z.number().optional(),
      previous: z.number().optional(),
      change_percent: z.number().optional(),
      change_amount: z.number().optional(),
    }).optional(),
    operating_income: z.object({
      current: z.number().optional(),
      previous: z.number().optional(),
      change_percent: z.number().optional(),
      change_amount: z.number().optional(),
    }).optional(),
    ordinary_income: z.object({
      current: z.number().optional(),
      previous: z.number().optional(),
      change_percent: z.number().optional(),
      change_amount: z.number().optional(),
    }).optional(),
    operating_cash_flow: z.object({
      current: z.number().optional(),
      previous: z.number().optional(),
      change_percent: z.number().optional(),
      change_amount: z.number().optional(),
    }).optional(),
  }),
  guidance_changes: z.object({
    has_revision: z.boolean(),
    revision_type: z.enum(['upward', 'downward', 'none']).optional(),
    details: z.string().optional(),
  }),
});

// 有価証券報告書用の要約スキーマ
export const AnnualReportSummarySchema = z.object({
  executive: z.string(), // 全文要約（3-5行）
  business_situation: z.object({
    most_profitable_segment: z.string().optional(),
    segment_details: z.string().optional(),
  }),
  balance_sheet: z.object({
    equity_ratio: z.number().optional(), // 純資産比率
    equity_ratio_assessment: z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
    total_assets: z.number().optional(),
    net_assets: z.number().optional(),
  }),
  profit_loss: z.object({
    revenue_improved: z.boolean().optional(),
    profit_improved: z.boolean().optional(),
    revenue_change_percent: z.number().optional(),
    profit_change_percent: z.number().optional(),
    details: z.string().optional(),
  }),
});

export const IRSummaryResponseSchema = z.object({
  symbol: z.string(),
  documentType: z.string(),
  processingInfo: z.object({
    pdfType: z.enum(['text', 'scanned', 'hybrid']),
    extractionMethod: z.string(),
    processingTime: z.number(),
    pageCount: z.number(),
  }),
  summary: z.union([
    QuarterlyEarningSummarySchema,
    AnnualReportSummarySchema,
  ]),
  key_metrics: z.object({
    revenue: z.number().optional(),
    profit: z.number().optional(),
    growth_rate: z.number().optional(),
  }),
  extractedText: z.string().optional(), // デバッグ用
  timestamp: z.string(),
});

export type IRSummaryRequest = z.infer<typeof IRSummaryRequestSchema>;
export type IRSummaryResponse = z.infer<typeof IRSummaryResponseSchema>;
export type QuarterlyEarningSummary = z.infer<typeof QuarterlyEarningSummarySchema>;
export type AnnualReportSummary = z.infer<typeof AnnualReportSummarySchema>;

// 市場環境データ用スキーマ
export const MarketEnvironmentRequestSchema = z.object({
  region: z.enum(['US', 'JP', 'GLOBAL']),
  timeframe: z.enum(['1M', '3M', '1Y']).optional(),
});

export type MarketEnvironmentRequest = z.infer<typeof MarketEnvironmentRequestSchema>;