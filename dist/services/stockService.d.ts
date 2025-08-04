import { StockPriceResponse, StockSymbolInput, FinancialDataResponse, IndexContributionInput, ContributionResponse, IndexAnalysisResponse } from '../types/schema.js';
export declare class StockService {
    getStockPrice(input: StockSymbolInput): Promise<StockPriceResponse>;
    getMultipleStockPrices(symbols: string[]): Promise<StockPriceResponse[]>;
    getFinancialData(input: StockSymbolInput): Promise<FinancialDataResponse>;
    getIndexContribution(input: IndexContributionInput): Promise<ContributionResponse>;
    getIndexAnalysis(indexSymbol: string, topN?: number): Promise<IndexAnalysisResponse>;
}
//# sourceMappingURL=stockService.d.ts.map