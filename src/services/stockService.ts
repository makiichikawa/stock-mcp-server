import yahooFinance from 'yahoo-finance2';
import { StockPriceResponse, StockSymbolInput, FinancialDataResponse, ProfitabilityTurnAroundResponse, StockScreenerInput } from '../types/schema.js';

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

  async analyzeProfitabilityTurnAround(input: StockSymbolInput): Promise<ProfitabilityTurnAroundResponse> {
    try {
      const quoteSummary = await yahooFinance.quoteSummary(input.symbol, {
        modules: ['incomeStatementHistoryQuarterly', 'earnings', 'price']
      });

      const incomeStatements = quoteSummary.incomeStatementHistoryQuarterly?.incomeStatementHistory;
      const earnings = quoteSummary.earnings;
      const price = quoteSummary.price;

      if (!incomeStatements || incomeStatements.length < 2) {
        throw new Error(`Insufficient quarterly data for symbol: ${input.symbol}`);
      }

      const sortedStatements = incomeStatements
        .filter(statement => statement.netIncome !== undefined && statement.netIncome !== null)
        .sort((a, b) => {
          const dateA = new Date(a.endDate || '');
          const dateB = new Date(b.endDate || '');
          return dateB.getTime() - dateA.getTime();
        });

      if (sortedStatements.length < 2) {
        throw new Error(`Insufficient net income data for symbol: ${input.symbol}`);
      }

      const currentQuarter = sortedStatements[0];
      const previousQuarter = sortedStatements[1];

      const currentNetIncome = Number(currentQuarter.netIncome) || 0;
      const previousNetIncome = Number(previousQuarter.netIncome) || 0;

      let turnAroundStatus: 'profit_turnaround' | 'loss_turnaround' | 'continued_profit' | 'continued_loss';
      
      if (previousNetIncome < 0 && currentNetIncome > 0) {
        turnAroundStatus = 'profit_turnaround';
      } else if (previousNetIncome > 0 && currentNetIncome < 0) {
        turnAroundStatus = 'loss_turnaround';
      } else if (previousNetIncome > 0 && currentNetIncome > 0) {
        turnAroundStatus = 'continued_profit';
      } else {
        turnAroundStatus = 'continued_loss';
      }

      const quarterlyChange = previousNetIncome !== 0 
        ? ((currentNetIncome - previousNetIncome) / Math.abs(previousNetIncome)) * 100
        : undefined;

      const quarterlyEarnings = earnings?.earningsChart?.quarterly || [];
      const currentEarnings = quarterlyEarnings.length > 0 ? quarterlyEarnings[quarterlyEarnings.length - 1]?.actual : undefined;
      const previousEarnings = quarterlyEarnings.length > 1 ? quarterlyEarnings[quarterlyEarnings.length - 2]?.actual : undefined;

      return {
        symbol: input.symbol,
        companyName: price?.shortName || undefined,
        currentQuarterNetIncome: currentNetIncome,
        previousQuarterNetIncome: previousNetIncome,
        currentQuarterEarnings: currentEarnings,
        previousQuarterEarnings: previousEarnings,
        turnAroundStatus,
        quarterlyChange,
        marketCap: Number(price?.marketCap) || undefined,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to analyze profitability turnaround for ${input.symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async screenProfitTurnAroundStocks(input: StockScreenerInput): Promise<ProfitabilityTurnAroundResponse[]> {
    const results: ProfitabilityTurnAroundResponse[] = [];
    
    for (const symbol of input.symbols) {
      try {
        const analysis = await this.analyzeProfitabilityTurnAround({ symbol });
        
        if (input.minMarketCap && analysis.marketCap && analysis.marketCap < input.minMarketCap) {
          continue;
        }
        
        if (input.maxMarketCap && analysis.marketCap && analysis.marketCap > input.maxMarketCap) {
          continue;
        }
        
        if (analysis.turnAroundStatus === 'profit_turnaround') {
          results.push(analysis);
        }
      } catch (error) {
        console.warn(`Skipping ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    return results.sort((a, b) => {
      if (!a.quarterlyChange || !b.quarterlyChange) return 0;
      return b.quarterlyChange - a.quarterlyChange;
    });
  }

}