import { StockPriceResponse, StockSymbolInput, FinancialDataResponse, ProfitabilityTurnAroundResponse, StockScreenerInput, QuarterlyEarningsForecastResponse, AnnualEarningsForecastResponse, EarningsGuidanceResponse } from '../types/schema';
export declare class StockService {
    private secService;
    constructor();
    getStockPrice(input: StockSymbolInput): Promise<StockPriceResponse>;
    getMultipleStockPrices(symbols: string[]): Promise<StockPriceResponse[]>;
    getFinancialData(input: StockSymbolInput): Promise<FinancialDataResponse>;
    analyzeProfitabilityTurnAround(input: StockSymbolInput): Promise<ProfitabilityTurnAroundResponse>;
    screenProfitTurnAroundStocks(input: StockScreenerInput): Promise<ProfitabilityTurnAroundResponse[]>;
    getQuarterlyEarningsForecast(input: StockSymbolInput): Promise<QuarterlyEarningsForecastResponse>;
    getAnnualEarningsForecast(input: StockSymbolInput): Promise<AnnualEarningsForecastResponse>;
    getEarningsGuidance(input: StockSymbolInput): Promise<EarningsGuidanceResponse>;
    private extractNumericValue;
    private extractValueRange;
    get10KEarningsGuidance(input: StockSymbolInput): Promise<EarningsGuidanceResponse>;
}
//# sourceMappingURL=stockService.d.ts.map