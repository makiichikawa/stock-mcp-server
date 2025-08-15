import { z } from 'zod';
export declare const StockSymbolSchema: z.ZodObject<{
    symbol: z.ZodString;
}, "strip", z.ZodTypeAny, {
    symbol: string;
}, {
    symbol: string;
}>;
export declare const StockPriceResponseSchema: z.ZodObject<{
    symbol: z.ZodString;
    price: z.ZodNumber;
    currency: z.ZodString;
    change: z.ZodOptional<z.ZodNumber>;
    changePercent: z.ZodOptional<z.ZodNumber>;
    marketCap: z.ZodOptional<z.ZodNumber>;
    volume: z.ZodOptional<z.ZodNumber>;
    timestamp: z.ZodString;
}, "strip", z.ZodTypeAny, {
    symbol: string;
    price: number;
    currency: string;
    timestamp: string;
    change?: number | undefined;
    changePercent?: number | undefined;
    marketCap?: number | undefined;
    volume?: number | undefined;
}, {
    symbol: string;
    price: number;
    currency: string;
    timestamp: string;
    change?: number | undefined;
    changePercent?: number | undefined;
    marketCap?: number | undefined;
    volume?: number | undefined;
}>;
export declare const FinancialDataResponseSchema: z.ZodObject<{
    symbol: z.ZodString;
    companyName: z.ZodOptional<z.ZodString>;
    marketCap: z.ZodOptional<z.ZodNumber>;
    enterpriseValue: z.ZodOptional<z.ZodNumber>;
    trailingPE: z.ZodOptional<z.ZodNumber>;
    forwardPE: z.ZodOptional<z.ZodNumber>;
    pegRatio: z.ZodOptional<z.ZodNumber>;
    priceToBook: z.ZodOptional<z.ZodNumber>;
    priceToSales: z.ZodOptional<z.ZodNumber>;
    enterpriseToRevenue: z.ZodOptional<z.ZodNumber>;
    enterpriseToEbitda: z.ZodOptional<z.ZodNumber>;
    totalRevenue: z.ZodOptional<z.ZodNumber>;
    revenuePerShare: z.ZodOptional<z.ZodNumber>;
    quarterlyRevenueGrowth: z.ZodOptional<z.ZodNumber>;
    grossProfit: z.ZodOptional<z.ZodNumber>;
    ebitda: z.ZodOptional<z.ZodNumber>;
    netIncomeToCommon: z.ZodOptional<z.ZodNumber>;
    quarterlyEarningsGrowth: z.ZodOptional<z.ZodNumber>;
    totalCash: z.ZodOptional<z.ZodNumber>;
    totalCashPerShare: z.ZodOptional<z.ZodNumber>;
    totalDebt: z.ZodOptional<z.ZodNumber>;
    debtToEquity: z.ZodOptional<z.ZodNumber>;
    currentRatio: z.ZodOptional<z.ZodNumber>;
    bookValuePerShare: z.ZodOptional<z.ZodNumber>;
    operatingCashFlow: z.ZodOptional<z.ZodNumber>;
    leveredFreeCashFlow: z.ZodOptional<z.ZodNumber>;
    returnOnAssets: z.ZodOptional<z.ZodNumber>;
    returnOnEquity: z.ZodOptional<z.ZodNumber>;
    profitMargin: z.ZodOptional<z.ZodNumber>;
    operatingMargin: z.ZodOptional<z.ZodNumber>;
    dividendYield: z.ZodOptional<z.ZodNumber>;
    payoutRatio: z.ZodOptional<z.ZodNumber>;
    beta: z.ZodOptional<z.ZodNumber>;
    timestamp: z.ZodString;
}, "strip", z.ZodTypeAny, {
    symbol: string;
    timestamp: string;
    marketCap?: number | undefined;
    companyName?: string | undefined;
    enterpriseValue?: number | undefined;
    trailingPE?: number | undefined;
    forwardPE?: number | undefined;
    pegRatio?: number | undefined;
    priceToBook?: number | undefined;
    priceToSales?: number | undefined;
    enterpriseToRevenue?: number | undefined;
    enterpriseToEbitda?: number | undefined;
    totalRevenue?: number | undefined;
    revenuePerShare?: number | undefined;
    quarterlyRevenueGrowth?: number | undefined;
    grossProfit?: number | undefined;
    ebitda?: number | undefined;
    netIncomeToCommon?: number | undefined;
    quarterlyEarningsGrowth?: number | undefined;
    totalCash?: number | undefined;
    totalCashPerShare?: number | undefined;
    totalDebt?: number | undefined;
    debtToEquity?: number | undefined;
    currentRatio?: number | undefined;
    bookValuePerShare?: number | undefined;
    operatingCashFlow?: number | undefined;
    leveredFreeCashFlow?: number | undefined;
    returnOnAssets?: number | undefined;
    returnOnEquity?: number | undefined;
    profitMargin?: number | undefined;
    operatingMargin?: number | undefined;
    dividendYield?: number | undefined;
    payoutRatio?: number | undefined;
    beta?: number | undefined;
}, {
    symbol: string;
    timestamp: string;
    marketCap?: number | undefined;
    companyName?: string | undefined;
    enterpriseValue?: number | undefined;
    trailingPE?: number | undefined;
    forwardPE?: number | undefined;
    pegRatio?: number | undefined;
    priceToBook?: number | undefined;
    priceToSales?: number | undefined;
    enterpriseToRevenue?: number | undefined;
    enterpriseToEbitda?: number | undefined;
    totalRevenue?: number | undefined;
    revenuePerShare?: number | undefined;
    quarterlyRevenueGrowth?: number | undefined;
    grossProfit?: number | undefined;
    ebitda?: number | undefined;
    netIncomeToCommon?: number | undefined;
    quarterlyEarningsGrowth?: number | undefined;
    totalCash?: number | undefined;
    totalCashPerShare?: number | undefined;
    totalDebt?: number | undefined;
    debtToEquity?: number | undefined;
    currentRatio?: number | undefined;
    bookValuePerShare?: number | undefined;
    operatingCashFlow?: number | undefined;
    leveredFreeCashFlow?: number | undefined;
    returnOnAssets?: number | undefined;
    returnOnEquity?: number | undefined;
    profitMargin?: number | undefined;
    operatingMargin?: number | undefined;
    dividendYield?: number | undefined;
    payoutRatio?: number | undefined;
    beta?: number | undefined;
}>;
export declare const ProfitabilityTurnAroundSchema: z.ZodObject<{
    symbol: z.ZodString;
    companyName: z.ZodOptional<z.ZodString>;
    currentQuarterNetIncome: z.ZodOptional<z.ZodNumber>;
    previousQuarterNetIncome: z.ZodOptional<z.ZodNumber>;
    currentQuarterOperatingIncome: z.ZodOptional<z.ZodNumber>;
    previousQuarterOperatingIncome: z.ZodOptional<z.ZodNumber>;
    currentQuarterEarnings: z.ZodOptional<z.ZodNumber>;
    previousQuarterEarnings: z.ZodOptional<z.ZodNumber>;
    turnAroundStatus: z.ZodEnum<["profit_turnaround", "loss_turnaround", "continued_profit", "continued_loss"]>;
    quarterlyChange: z.ZodOptional<z.ZodNumber>;
    marketCap: z.ZodOptional<z.ZodNumber>;
    timestamp: z.ZodString;
}, "strip", z.ZodTypeAny, {
    symbol: string;
    timestamp: string;
    turnAroundStatus: "profit_turnaround" | "loss_turnaround" | "continued_profit" | "continued_loss";
    marketCap?: number | undefined;
    companyName?: string | undefined;
    currentQuarterNetIncome?: number | undefined;
    previousQuarterNetIncome?: number | undefined;
    currentQuarterOperatingIncome?: number | undefined;
    previousQuarterOperatingIncome?: number | undefined;
    currentQuarterEarnings?: number | undefined;
    previousQuarterEarnings?: number | undefined;
    quarterlyChange?: number | undefined;
}, {
    symbol: string;
    timestamp: string;
    turnAroundStatus: "profit_turnaround" | "loss_turnaround" | "continued_profit" | "continued_loss";
    marketCap?: number | undefined;
    companyName?: string | undefined;
    currentQuarterNetIncome?: number | undefined;
    previousQuarterNetIncome?: number | undefined;
    currentQuarterOperatingIncome?: number | undefined;
    previousQuarterOperatingIncome?: number | undefined;
    currentQuarterEarnings?: number | undefined;
    previousQuarterEarnings?: number | undefined;
    quarterlyChange?: number | undefined;
}>;
export declare const StockScreenerSchema: z.ZodObject<{
    symbols: z.ZodArray<z.ZodString, "many">;
    minMarketCap: z.ZodOptional<z.ZodNumber>;
    maxMarketCap: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    symbols: string[];
    minMarketCap?: number | undefined;
    maxMarketCap?: number | undefined;
}, {
    symbols: string[];
    minMarketCap?: number | undefined;
    maxMarketCap?: number | undefined;
}>;
export declare const ForecastSourceSchema: z.ZodEnum<["sec_filing", "analyst_consensus", "management_guidance", "yahoo_finance"]>;
export declare const QuarterlyForecastItemSchema: z.ZodObject<{
    quarter: z.ZodString;
    fiscalYear: z.ZodNumber;
    earningsPerShare: z.ZodOptional<z.ZodNumber>;
    revenue: z.ZodOptional<z.ZodNumber>;
    netIncome: z.ZodOptional<z.ZodNumber>;
    source: z.ZodEnum<["sec_filing", "analyst_consensus", "management_guidance", "yahoo_finance"]>;
    updatedDate: z.ZodString;
}, "strip", z.ZodTypeAny, {
    quarter: string;
    fiscalYear: number;
    source: "sec_filing" | "analyst_consensus" | "management_guidance" | "yahoo_finance";
    updatedDate: string;
    earningsPerShare?: number | undefined;
    revenue?: number | undefined;
    netIncome?: number | undefined;
}, {
    quarter: string;
    fiscalYear: number;
    source: "sec_filing" | "analyst_consensus" | "management_guidance" | "yahoo_finance";
    updatedDate: string;
    earningsPerShare?: number | undefined;
    revenue?: number | undefined;
    netIncome?: number | undefined;
}>;
export declare const QuarterlyEarningsForecastSchema: z.ZodObject<{
    symbol: z.ZodString;
    companyName: z.ZodOptional<z.ZodString>;
    forecasts: z.ZodArray<z.ZodObject<{
        quarter: z.ZodString;
        fiscalYear: z.ZodNumber;
        earningsPerShare: z.ZodOptional<z.ZodNumber>;
        revenue: z.ZodOptional<z.ZodNumber>;
        netIncome: z.ZodOptional<z.ZodNumber>;
        source: z.ZodEnum<["sec_filing", "analyst_consensus", "management_guidance", "yahoo_finance"]>;
        updatedDate: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        quarter: string;
        fiscalYear: number;
        source: "sec_filing" | "analyst_consensus" | "management_guidance" | "yahoo_finance";
        updatedDate: string;
        earningsPerShare?: number | undefined;
        revenue?: number | undefined;
        netIncome?: number | undefined;
    }, {
        quarter: string;
        fiscalYear: number;
        source: "sec_filing" | "analyst_consensus" | "management_guidance" | "yahoo_finance";
        updatedDate: string;
        earningsPerShare?: number | undefined;
        revenue?: number | undefined;
        netIncome?: number | undefined;
    }>, "many">;
    timestamp: z.ZodString;
}, "strip", z.ZodTypeAny, {
    symbol: string;
    timestamp: string;
    forecasts: {
        quarter: string;
        fiscalYear: number;
        source: "sec_filing" | "analyst_consensus" | "management_guidance" | "yahoo_finance";
        updatedDate: string;
        earningsPerShare?: number | undefined;
        revenue?: number | undefined;
        netIncome?: number | undefined;
    }[];
    companyName?: string | undefined;
}, {
    symbol: string;
    timestamp: string;
    forecasts: {
        quarter: string;
        fiscalYear: number;
        source: "sec_filing" | "analyst_consensus" | "management_guidance" | "yahoo_finance";
        updatedDate: string;
        earningsPerShare?: number | undefined;
        revenue?: number | undefined;
        netIncome?: number | undefined;
    }[];
    companyName?: string | undefined;
}>;
export declare const AnnualForecastItemSchema: z.ZodObject<{
    fiscalYear: z.ZodNumber;
    earningsPerShare: z.ZodOptional<z.ZodNumber>;
    revenue: z.ZodOptional<z.ZodNumber>;
    netIncome: z.ZodOptional<z.ZodNumber>;
    source: z.ZodEnum<["sec_filing", "analyst_consensus", "management_guidance", "yahoo_finance"]>;
    updatedDate: z.ZodString;
}, "strip", z.ZodTypeAny, {
    fiscalYear: number;
    source: "sec_filing" | "analyst_consensus" | "management_guidance" | "yahoo_finance";
    updatedDate: string;
    earningsPerShare?: number | undefined;
    revenue?: number | undefined;
    netIncome?: number | undefined;
}, {
    fiscalYear: number;
    source: "sec_filing" | "analyst_consensus" | "management_guidance" | "yahoo_finance";
    updatedDate: string;
    earningsPerShare?: number | undefined;
    revenue?: number | undefined;
    netIncome?: number | undefined;
}>;
export declare const AnnualEarningsForecastSchema: z.ZodObject<{
    symbol: z.ZodString;
    companyName: z.ZodOptional<z.ZodString>;
    forecasts: z.ZodArray<z.ZodObject<{
        fiscalYear: z.ZodNumber;
        earningsPerShare: z.ZodOptional<z.ZodNumber>;
        revenue: z.ZodOptional<z.ZodNumber>;
        netIncome: z.ZodOptional<z.ZodNumber>;
        source: z.ZodEnum<["sec_filing", "analyst_consensus", "management_guidance", "yahoo_finance"]>;
        updatedDate: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        fiscalYear: number;
        source: "sec_filing" | "analyst_consensus" | "management_guidance" | "yahoo_finance";
        updatedDate: string;
        earningsPerShare?: number | undefined;
        revenue?: number | undefined;
        netIncome?: number | undefined;
    }, {
        fiscalYear: number;
        source: "sec_filing" | "analyst_consensus" | "management_guidance" | "yahoo_finance";
        updatedDate: string;
        earningsPerShare?: number | undefined;
        revenue?: number | undefined;
        netIncome?: number | undefined;
    }>, "many">;
    timestamp: z.ZodString;
}, "strip", z.ZodTypeAny, {
    symbol: string;
    timestamp: string;
    forecasts: {
        fiscalYear: number;
        source: "sec_filing" | "analyst_consensus" | "management_guidance" | "yahoo_finance";
        updatedDate: string;
        earningsPerShare?: number | undefined;
        revenue?: number | undefined;
        netIncome?: number | undefined;
    }[];
    companyName?: string | undefined;
}, {
    symbol: string;
    timestamp: string;
    forecasts: {
        fiscalYear: number;
        source: "sec_filing" | "analyst_consensus" | "management_guidance" | "yahoo_finance";
        updatedDate: string;
        earningsPerShare?: number | undefined;
        revenue?: number | undefined;
        netIncome?: number | undefined;
    }[];
    companyName?: string | undefined;
}>;
export declare const GuidanceItemSchema: z.ZodObject<{
    guidanceType: z.ZodEnum<["revenue", "earnings", "margin", "capex", "operational", "growth", "strategic", "other"]>;
    period: z.ZodString;
    guidance: z.ZodString;
    value: z.ZodOptional<z.ZodNumber>;
    valueRange: z.ZodOptional<z.ZodObject<{
        min: z.ZodOptional<z.ZodNumber>;
        max: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        min?: number | undefined;
        max?: number | undefined;
    }, {
        min?: number | undefined;
        max?: number | undefined;
    }>>;
    source: z.ZodString;
    filingDate: z.ZodString;
    url: z.ZodOptional<z.ZodString>;
    context: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    source: string;
    guidanceType: "revenue" | "earnings" | "margin" | "capex" | "operational" | "growth" | "strategic" | "other";
    period: string;
    guidance: string;
    filingDate: string;
    value?: number | undefined;
    valueRange?: {
        min?: number | undefined;
        max?: number | undefined;
    } | undefined;
    url?: string | undefined;
    context?: string | undefined;
}, {
    source: string;
    guidanceType: "revenue" | "earnings" | "margin" | "capex" | "operational" | "growth" | "strategic" | "other";
    period: string;
    guidance: string;
    filingDate: string;
    value?: number | undefined;
    valueRange?: {
        min?: number | undefined;
        max?: number | undefined;
    } | undefined;
    url?: string | undefined;
    context?: string | undefined;
}>;
export declare const EarningsGuidanceSchema: z.ZodObject<{
    symbol: z.ZodString;
    companyName: z.ZodOptional<z.ZodString>;
    guidances: z.ZodArray<z.ZodObject<{
        guidanceType: z.ZodEnum<["revenue", "earnings", "margin", "capex", "operational", "growth", "strategic", "other"]>;
        period: z.ZodString;
        guidance: z.ZodString;
        value: z.ZodOptional<z.ZodNumber>;
        valueRange: z.ZodOptional<z.ZodObject<{
            min: z.ZodOptional<z.ZodNumber>;
            max: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            min?: number | undefined;
            max?: number | undefined;
        }, {
            min?: number | undefined;
            max?: number | undefined;
        }>>;
        source: z.ZodString;
        filingDate: z.ZodString;
        url: z.ZodOptional<z.ZodString>;
        context: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        source: string;
        guidanceType: "revenue" | "earnings" | "margin" | "capex" | "operational" | "growth" | "strategic" | "other";
        period: string;
        guidance: string;
        filingDate: string;
        value?: number | undefined;
        valueRange?: {
            min?: number | undefined;
            max?: number | undefined;
        } | undefined;
        url?: string | undefined;
        context?: string | undefined;
    }, {
        source: string;
        guidanceType: "revenue" | "earnings" | "margin" | "capex" | "operational" | "growth" | "strategic" | "other";
        period: string;
        guidance: string;
        filingDate: string;
        value?: number | undefined;
        valueRange?: {
            min?: number | undefined;
            max?: number | undefined;
        } | undefined;
        url?: string | undefined;
        context?: string | undefined;
    }>, "many">;
    timestamp: z.ZodString;
}, "strip", z.ZodTypeAny, {
    symbol: string;
    timestamp: string;
    guidances: {
        source: string;
        guidanceType: "revenue" | "earnings" | "margin" | "capex" | "operational" | "growth" | "strategic" | "other";
        period: string;
        guidance: string;
        filingDate: string;
        value?: number | undefined;
        valueRange?: {
            min?: number | undefined;
            max?: number | undefined;
        } | undefined;
        url?: string | undefined;
        context?: string | undefined;
    }[];
    companyName?: string | undefined;
}, {
    symbol: string;
    timestamp: string;
    guidances: {
        source: string;
        guidanceType: "revenue" | "earnings" | "margin" | "capex" | "operational" | "growth" | "strategic" | "other";
        period: string;
        guidance: string;
        filingDate: string;
        value?: number | undefined;
        valueRange?: {
            min?: number | undefined;
            max?: number | undefined;
        } | undefined;
        url?: string | undefined;
        context?: string | undefined;
    }[];
    companyName?: string | undefined;
}>;
export type StockSymbolInput = z.infer<typeof StockSymbolSchema>;
export type StockPriceResponse = z.infer<typeof StockPriceResponseSchema>;
export type FinancialDataResponse = z.infer<typeof FinancialDataResponseSchema>;
export type ProfitabilityTurnAroundResponse = z.infer<typeof ProfitabilityTurnAroundSchema>;
export type StockScreenerInput = z.infer<typeof StockScreenerSchema>;
export type QuarterlyEarningsForecastResponse = z.infer<typeof QuarterlyEarningsForecastSchema>;
export type AnnualEarningsForecastResponse = z.infer<typeof AnnualEarningsForecastSchema>;
export type EarningsGuidanceResponse = z.infer<typeof EarningsGuidanceSchema>;
export type ForecastSource = z.infer<typeof ForecastSourceSchema>;
//# sourceMappingURL=schema.d.ts.map