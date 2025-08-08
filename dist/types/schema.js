"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockScreenerSchema = exports.ProfitabilityTurnAroundSchema = exports.FinancialDataResponseSchema = exports.StockPriceResponseSchema = exports.StockSymbolSchema = void 0;
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
//# sourceMappingURL=schema.js.map