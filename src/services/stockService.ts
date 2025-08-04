import yahooFinance from 'yahoo-finance2';
import { StockPriceResponse, StockSymbolInput, FinancialDataResponse } from '../types/schema.js';

export class StockService {
  async getStockPrice(input: StockSymbolInput): Promise<StockPriceResponse> {
    try {
      const quote = await yahooFinance.quote(input.symbol);
      
      if (!quote || !quote.regularMarketPrice) {
        throw new Error(`Stock data not found for symbol: ${input.symbol}`);
      }

      return {
        symbol: quote.symbol || input.symbol,
        price: quote.regularMarketPrice,
        currency: quote.currency || 'USD',
        change: quote.regularMarketChange,
        changePercent: quote.regularMarketChangePercent,
        marketCap: quote.marketCap,
        volume: quote.regularMarketVolume,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to fetch stock price for ${input.symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getMultipleStockPrices(symbols: string[]): Promise<StockPriceResponse[]> {
    const promises = symbols.map(symbol => this.getStockPrice({ symbol }));
    return Promise.all(promises);
  }

  async getFinancialData(input: StockSymbolInput): Promise<FinancialDataResponse> {
    try {
      const quoteSummary = await yahooFinance.quoteSummary(input.symbol, {
        modules: ['defaultKeyStatistics', 'financialData', 'summaryDetail']
      });

      const keyStats = quoteSummary.defaultKeyStatistics;
      const financialData = quoteSummary.financialData;
      const summaryDetail = quoteSummary.summaryDetail;

      if (!keyStats && !financialData && !summaryDetail) {
        throw new Error(`Financial data not found for symbol: ${input.symbol}`);
      }

      return {
        symbol: input.symbol,
        companyName: quoteSummary.price?.shortName || undefined,
        marketCap: summaryDetail?.marketCap,
        enterpriseValue: keyStats?.enterpriseValue,
        trailingPE: summaryDetail?.trailingPE,
        forwardPE: summaryDetail?.forwardPE,
        pegRatio: keyStats?.pegRatio,
        priceToBook: keyStats?.priceToBook,
        priceToSales: summaryDetail?.priceToSalesTrailing12Months,
        enterpriseToRevenue: keyStats?.enterpriseToRevenue,
        enterpriseToEbitda: keyStats?.enterpriseToEbitda,
        totalRevenue: financialData?.totalRevenue,
        revenuePerShare: financialData?.revenuePerShare,
        quarterlyRevenueGrowth: financialData?.revenueGrowth,
        grossProfit: financialData?.grossProfits,
        ebitda: financialData?.ebitda,
        netIncomeToCommon: keyStats?.netIncomeToCommon,
        quarterlyEarningsGrowth: financialData?.earningsGrowth,
        totalCash: financialData?.totalCash,
        totalCashPerShare: financialData?.totalCashPerShare,
        totalDebt: financialData?.totalDebt,
        debtToEquity: financialData?.debtToEquity,
        currentRatio: financialData?.currentRatio,
        bookValuePerShare: keyStats?.bookValue,
        operatingCashFlow: financialData?.operatingCashflow,
        leveredFreeCashFlow: financialData?.freeCashflow,
        returnOnAssets: financialData?.returnOnAssets,
        returnOnEquity: financialData?.returnOnEquity,
        profitMargin: financialData?.profitMargins,
        operatingMargin: financialData?.operatingMargins,
        dividendYield: summaryDetail?.dividendYield,
        payoutRatio: summaryDetail?.payoutRatio,
        beta: keyStats?.beta,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to fetch financial data for ${input.symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

}