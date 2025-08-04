"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndexAnalysisResponseSchema = exports.ContributionResponseSchema = exports.IndexContributionSchema = exports.FinancialDataResponseSchema = exports.StockPriceResponseSchema = exports.StockSymbolSchema = void 0;
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
exports.IndexContributionSchema = zod_1.z.object({
    symbol: zod_1.z.string().min(1, 'Stock symbol is required'),
    indexSymbol: zod_1.z.string().min(1, 'Index symbol is required (e.g., N225, TOPX)'),
});
exports.ContributionResponseSchema = zod_1.z.object({
    symbol: zod_1.z.string(),
    companyName: zod_1.z.string().optional(),
    indexSymbol: zod_1.z.string(),
    indexName: zod_1.z.string().optional(),
    currentPrice: zod_1.z.number(),
    priceChange: zod_1.z.number(),
    priceChangePercent: zod_1.z.number(),
    indexWeight: zod_1.z.number().optional(),
    contribution: zod_1.z.number(),
    contributionPercent: zod_1.z.number(),
    marketCap: zod_1.z.number().optional(),
    timestamp: zod_1.z.string(),
});
exports.IndexAnalysisResponseSchema = zod_1.z.object({
    indexSymbol: zod_1.z.string(),
    indexName: zod_1.z.string().optional(),
    indexChange: zod_1.z.number(),
    indexChangePercent: zod_1.z.number(),
    topContributors: zod_1.z.array(exports.ContributionResponseSchema),
    bottomContributors: zod_1.z.array(exports.ContributionResponseSchema),
    totalContributions: zod_1.z.object({
        positive: zod_1.z.number(),
        negative: zod_1.z.number(),
        net: zod_1.z.number(),
    }),
    timestamp: zod_1.z.string(),
});
//# sourceMappingURL=schema.js.map