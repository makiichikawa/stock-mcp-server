"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketEnvironmentRequestSchema = exports.IRSummaryResponseSchema = exports.AnnualReportSummarySchema = exports.QuarterlyEarningSummarySchema = exports.IRSummaryRequestSchema = exports.IRDocumentResponseSchema = exports.LocalPDFSchema = exports.EarningsGuidanceSchema = exports.GuidanceItemSchema = exports.AnnualEarningsForecastSchema = exports.AnnualForecastItemSchema = exports.QuarterlyEarningsForecastSchema = exports.QuarterlyForecastItemSchema = exports.ForecastSourceSchema = exports.StockScreenerSchema = exports.ProfitabilityTurnAroundSchema = exports.FinancialDataResponseSchema = exports.StockPriceResponseSchema = exports.StockSymbolSchema = void 0;
const zod_1 = require("zod");
exports.StockSymbolSchema = zod_1.z.object({
    symbol: zod_1.z.string().min(1, 'Stock symbol is required'),
});
exports.StockPriceResponseSchema = zod_1.z.object({
    symbol: zod_1.z.string(),
    price: zod_1.z.number(),
    currency: zod_1.z.string(),
    change: zod_1.z.number().optional(),
    changePercent: zod_1.z.number().optional(),
    marketCap: zod_1.z.number().optional(),
    volume: zod_1.z.number().optional(),
    timestamp: zod_1.z.string(),
});
exports.FinancialDataResponseSchema = zod_1.z.object({
    symbol: zod_1.z.string(),
    companyName: zod_1.z.string().optional(),
    marketCap: zod_1.z.number().optional(),
    enterpriseValue: zod_1.z.number().optional(),
    trailingPE: zod_1.z.number().optional(),
    forwardPE: zod_1.z.number().optional(),
    pegRatio: zod_1.z.number().optional(),
    priceToBook: zod_1.z.number().optional(),
    priceToSales: zod_1.z.number().optional(),
    enterpriseToRevenue: zod_1.z.number().optional(),
    enterpriseToEbitda: zod_1.z.number().optional(),
    totalRevenue: zod_1.z.number().optional(),
    revenuePerShare: zod_1.z.number().optional(),
    quarterlyRevenueGrowth: zod_1.z.number().optional(),
    grossProfit: zod_1.z.number().optional(),
    ebitda: zod_1.z.number().optional(),
    netIncomeToCommon: zod_1.z.number().optional(),
    quarterlyEarningsGrowth: zod_1.z.number().optional(),
    totalCash: zod_1.z.number().optional(),
    totalCashPerShare: zod_1.z.number().optional(),
    totalDebt: zod_1.z.number().optional(),
    debtToEquity: zod_1.z.number().optional(),
    currentRatio: zod_1.z.number().optional(),
    bookValuePerShare: zod_1.z.number().optional(),
    operatingCashFlow: zod_1.z.number().optional(),
    leveredFreeCashFlow: zod_1.z.number().optional(),
    returnOnAssets: zod_1.z.number().optional(),
    returnOnEquity: zod_1.z.number().optional(),
    profitMargin: zod_1.z.number().optional(),
    operatingMargin: zod_1.z.number().optional(),
    dividendYield: zod_1.z.number().optional(),
    payoutRatio: zod_1.z.number().optional(),
    beta: zod_1.z.number().optional(),
    timestamp: zod_1.z.string(),
});
exports.ProfitabilityTurnAroundSchema = zod_1.z.object({
    symbol: zod_1.z.string(),
    companyName: zod_1.z.string().optional(),
    currentQuarterNetIncome: zod_1.z.number().optional(),
    previousQuarterNetIncome: zod_1.z.number().optional(),
    currentQuarterOperatingIncome: zod_1.z.number().optional(),
    previousQuarterOperatingIncome: zod_1.z.number().optional(),
    currentQuarterEarnings: zod_1.z.number().optional(),
    previousQuarterEarnings: zod_1.z.number().optional(),
    turnAroundStatus: zod_1.z.enum(['profit_turnaround', 'loss_turnaround', 'continued_profit', 'continued_loss']),
    quarterlyChange: zod_1.z.number().optional(),
    marketCap: zod_1.z.number().optional(),
    timestamp: zod_1.z.string(),
});
exports.StockScreenerSchema = zod_1.z.object({
    symbols: zod_1.z.array(zod_1.z.string()).min(1, 'At least one stock symbol is required'),
    minMarketCap: zod_1.z.number().optional(),
    maxMarketCap: zod_1.z.number().optional(),
});
exports.ForecastSourceSchema = zod_1.z.enum(['sec_filing', 'analyst_consensus', 'management_guidance', 'yahoo_finance']);
exports.QuarterlyForecastItemSchema = zod_1.z.object({
    quarter: zod_1.z.string(), // "Q1 2025", "Q2 2025", etc.
    fiscalYear: zod_1.z.number(),
    earningsPerShare: zod_1.z.number().optional(),
    revenue: zod_1.z.number().optional(),
    netIncome: zod_1.z.number().optional(),
    source: exports.ForecastSourceSchema,
    updatedDate: zod_1.z.string(),
});
exports.QuarterlyEarningsForecastSchema = zod_1.z.object({
    symbol: zod_1.z.string(),
    companyName: zod_1.z.string().optional(),
    forecasts: zod_1.z.array(exports.QuarterlyForecastItemSchema),
    timestamp: zod_1.z.string(),
});
exports.AnnualForecastItemSchema = zod_1.z.object({
    fiscalYear: zod_1.z.number(),
    earningsPerShare: zod_1.z.number().optional(),
    revenue: zod_1.z.number().optional(),
    netIncome: zod_1.z.number().optional(),
    source: exports.ForecastSourceSchema,
    updatedDate: zod_1.z.string(),
});
exports.AnnualEarningsForecastSchema = zod_1.z.object({
    symbol: zod_1.z.string(),
    companyName: zod_1.z.string().optional(),
    forecasts: zod_1.z.array(exports.AnnualForecastItemSchema),
    timestamp: zod_1.z.string(),
});
exports.GuidanceItemSchema = zod_1.z.object({
    guidanceType: zod_1.z.enum(['revenue', 'earnings', 'margin', 'capex', 'operational', 'growth', 'strategic', 'other']),
    period: zod_1.z.string(), // "Q1 2025", "FY2025", etc.
    guidance: zod_1.z.string(), // Actual guidance text
    value: zod_1.z.number().optional(),
    valueRange: zod_1.z.object({
        min: zod_1.z.number().optional(),
        max: zod_1.z.number().optional(),
    }).optional(),
    source: zod_1.z.string(), // Filing type: "10-K", "10-Q", "8-K", "Earnings Call"
    filingDate: zod_1.z.string(),
    url: zod_1.z.string().optional(),
    context: zod_1.z.string().optional(), // 10-K用の追加コンテキスト情報
});
exports.EarningsGuidanceSchema = zod_1.z.object({
    symbol: zod_1.z.string(),
    companyName: zod_1.z.string().optional(),
    guidances: zod_1.z.array(exports.GuidanceItemSchema),
    timestamp: zod_1.z.string(),
});
// IR文書処理用スキーマ
exports.LocalPDFSchema = zod_1.z.object({
    symbol: zod_1.z.string().min(1).max(10),
    filePath: zod_1.z.string().min(1),
    documentType: zod_1.z.enum(['earnings_presentation', 'annual_report', 'quarterly_report', '10-K', '10-Q']),
    country: zod_1.z.enum(['US', 'JP']),
});
exports.IRDocumentResponseSchema = zod_1.z.object({
    symbol: zod_1.z.string(),
    documentType: zod_1.z.string(),
    country: zod_1.z.string(),
    extractedText: zod_1.z.string(),
    metadata: zod_1.z.object({
        pageCount: zod_1.z.number(),
        processingTime: zod_1.z.number(),
        documentSize: zod_1.z.number(),
        extractionDate: zod_1.z.string(),
    }),
    summary: zod_1.z.object({
        textLength: zod_1.z.number(),
        wordCount: zod_1.z.number(),
        containsFinancialData: zod_1.z.boolean(),
    }).optional(),
});
// IR要約機能用スキーマ（要件定義書準拠）
exports.IRSummaryRequestSchema = zod_1.z.object({
    symbol: zod_1.z.string().min(1).max(10),
    companyName: zod_1.z.string().optional(),
    language: zod_1.z.enum(['ja', 'en']).default('ja'),
    extractionMode: zod_1.z.enum(['text', 'layout', 'ocr', 'auto']).optional().default('auto'),
    documentTypeFilter: zod_1.z.enum(['earnings_presentation', 'annual_report', 'quarterly_report', '10-K', '10-Q']).optional(),
    includeMarketEnvironment: zod_1.z.boolean().optional().default(false),
    marketRegion: zod_1.z.enum(['US', 'JP', 'GLOBAL']).optional().default('US'),
});
// 決算短信用の要約スキーマ
exports.QuarterlyEarningSummarySchema = zod_1.z.object({
    executive: zod_1.z.string(), // 全文要約（3-5行）
    financial_comparison: zod_1.z.object({
        revenue: zod_1.z.object({
            current: zod_1.z.number().optional(),
            previous: zod_1.z.number().optional(),
            change_percent: zod_1.z.number().optional(),
            change_amount: zod_1.z.number().optional(),
        }).optional(),
        operating_income: zod_1.z.object({
            current: zod_1.z.number().optional(),
            previous: zod_1.z.number().optional(),
            change_percent: zod_1.z.number().optional(),
            change_amount: zod_1.z.number().optional(),
        }).optional(),
        ordinary_income: zod_1.z.object({
            current: zod_1.z.number().optional(),
            previous: zod_1.z.number().optional(),
            change_percent: zod_1.z.number().optional(),
            change_amount: zod_1.z.number().optional(),
        }).optional(),
        operating_cash_flow: zod_1.z.object({
            current: zod_1.z.number().optional(),
            previous: zod_1.z.number().optional(),
            change_percent: zod_1.z.number().optional(),
            change_amount: zod_1.z.number().optional(),
        }).optional(),
    }),
    guidance_changes: zod_1.z.object({
        has_revision: zod_1.z.boolean(),
        revision_type: zod_1.z.enum(['upward', 'downward', 'none']).optional(),
        details: zod_1.z.string().optional(),
    }),
});
// 有価証券報告書用の要約スキーマ
exports.AnnualReportSummarySchema = zod_1.z.object({
    executive: zod_1.z.string(), // 全文要約（3-5行）
    business_situation: zod_1.z.object({
        most_profitable_segment: zod_1.z.string().optional(),
        segment_details: zod_1.z.string().optional(),
    }),
    balance_sheet: zod_1.z.object({
        equity_ratio: zod_1.z.number().optional(), // 純資産比率
        equity_ratio_assessment: zod_1.z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
        total_assets: zod_1.z.number().optional(),
        net_assets: zod_1.z.number().optional(),
    }),
    profit_loss: zod_1.z.object({
        revenue_improved: zod_1.z.boolean().optional(),
        profit_improved: zod_1.z.boolean().optional(),
        revenue_change_percent: zod_1.z.number().optional(),
        profit_change_percent: zod_1.z.number().optional(),
        details: zod_1.z.string().optional(),
    }),
});
exports.IRSummaryResponseSchema = zod_1.z.object({
    symbol: zod_1.z.string(),
    documentType: zod_1.z.string(),
    processingInfo: zod_1.z.object({
        pdfType: zod_1.z.enum(['text', 'scanned', 'hybrid']),
        extractionMethod: zod_1.z.string(),
        processingTime: zod_1.z.number(),
        pageCount: zod_1.z.number(),
    }),
    summary: zod_1.z.union([
        exports.QuarterlyEarningSummarySchema,
        exports.AnnualReportSummarySchema,
    ]),
    key_metrics: zod_1.z.object({
        revenue: zod_1.z.number().optional(),
        profit: zod_1.z.number().optional(),
        growth_rate: zod_1.z.number().optional(),
    }),
    extractedText: zod_1.z.string().optional(), // デバッグ用
    timestamp: zod_1.z.string(),
});
// 市場環境データ用スキーマ
exports.MarketEnvironmentRequestSchema = zod_1.z.object({
    region: zod_1.z.enum(['US', 'JP', 'GLOBAL']),
    timeframe: zod_1.z.enum(['1M', '3M', '1Y']).optional(),
});
//# sourceMappingURL=schema.js.map