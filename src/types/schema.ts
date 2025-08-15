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

export type StockSymbolInput = z.infer<typeof StockSymbolSchema>;
export type StockPriceResponse = z.infer<typeof StockPriceResponseSchema>;
export type FinancialDataResponse = z.infer<typeof FinancialDataResponseSchema>;
export type ProfitabilityTurnAroundResponse = z.infer<typeof ProfitabilityTurnAroundSchema>;
export type StockScreenerInput = z.infer<typeof StockScreenerSchema>;
export type QuarterlyEarningsForecastResponse = z.infer<typeof QuarterlyEarningsForecastSchema>;
export type AnnualEarningsForecastResponse = z.infer<typeof AnnualEarningsForecastSchema>;
export type EarningsGuidanceResponse = z.infer<typeof EarningsGuidanceSchema>;
export type ForecastSource = z.infer<typeof ForecastSourceSchema>;