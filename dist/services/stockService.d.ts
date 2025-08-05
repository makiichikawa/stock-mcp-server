import { StockPriceResponse, StockSymbolInput, FinancialDataResponse, ProfitabilityTurnAroundResponse, StockScreenerInput } from '../types/schema.js';
export declare class StockService {
    getStockPrice(input: StockSymbolInput): Promise<StockPriceResponse>;
    getMultipleStockPrices(symbols: string[]): Promise<StockPriceResponse[]>;
    getFinancialData(input: StockSymbolInput): Promise<FinancialDataResponse>;
    analyzeProfitabilityTurnAround(input: StockSymbolInput): Promise<ProfitabilityTurnAroundResponse>;
    screenProfitTurnAroundStocks(input: StockScreenerInput): Promise<ProfitabilityTurnAroundResponse[]>;
}
//# sourceMappingURL=stockService.d.ts.map