import yahooFinance from 'yahoo-finance2';
import { StockPriceResponse, StockSymbolInput, FinancialDataResponse, ProfitabilityTurnAroundResponse, StockScreenerInput, QuarterlyEarningsForecastResponse, AnnualEarningsForecastResponse, EarningsGuidanceResponse } from '../types/schema.js';
import { SecService } from './secService.js';

export class StockService {
  private secService: SecService;

  constructor() {
    this.secService = new SecService();
  }
  // 指定されたシンボルの株価情報を取得する
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

  // 複数の銘柄の株価情報を一括取得する
  async getMultipleStockPrices(symbols: string[]): Promise<StockPriceResponse[]> {
    const promises = symbols.map(symbol => this.getStockPrice({ symbol }));
    return Promise.all(promises);
  }

  // 指定されたシンボルの財務データを取得する（PER、PBR、ROE等の指標を含む）
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

  // 四半期決算データから黒字転換を分析する（純利益と営業利益の変化を追跡）
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
        throw new Error(`Insufficient financial data for symbol: ${input.symbol}`);
      }

      const currentQuarter = sortedStatements[0];
      const previousQuarter = sortedStatements[1];

      const currentNetIncome = Number(currentQuarter.netIncome) || 0;
      const previousNetIncome = Number(previousQuarter.netIncome) || 0;
      // Yahoo Finance APIから利用可能なフィールドのみ使用
      const currentOperatingIncome = Number((currentQuarter as any).operatingIncome) || 
        ((Number(currentQuarter.totalRevenue) || 0) - (Number(currentQuarter.totalOperatingExpenses) || 0)) || 0;
      const previousOperatingIncome = Number((previousQuarter as any).operatingIncome) || 
        ((Number(previousQuarter.totalRevenue) || 0) - (Number(previousQuarter.totalOperatingExpenses) || 0)) || 0;

      let turnAroundStatus: 'profit_turnaround' | 'loss_turnaround' | 'continued_profit' | 'continued_loss';
      
      // 純利益と営業利益の2つで黒字転換を判定
      const netIncomeTurnAround = previousNetIncome < 0 && currentNetIncome > 0;
      const operatingIncomeTurnAround = previousOperatingIncome < 0 && currentOperatingIncome > 0;
      
      if (netIncomeTurnAround && operatingIncomeTurnAround) {
        turnAroundStatus = 'profit_turnaround';
      } else if (previousNetIncome > 0 && currentNetIncome < 0) {
        turnAroundStatus = 'loss_turnaround';
      } else if (currentNetIncome > 0 && currentOperatingIncome > 0) {
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
        currentQuarterOperatingIncome: currentOperatingIncome,
        previousQuarterOperatingIncome: previousOperatingIncome,
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

  // 複数銘柄から黒字転換した企業をスクリーニングする（時価総額フィルター付き）
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

  // 四半期業績予想データを取得する（アナリスト予想とYahoo Financeデータを統合）
  async getQuarterlyEarningsForecast(input: StockSymbolInput): Promise<QuarterlyEarningsForecastResponse> {
    try {
      const quoteSummary = await yahooFinance.quoteSummary(input.symbol, {
        modules: ['earnings', 'earningsTrend', 'price']
      });

      const earnings = quoteSummary.earnings;
      const earningsTrend = quoteSummary.earningsTrend;
      const price = quoteSummary.price;

      if (!earnings && !earningsTrend) {
        throw new Error(`Quarterly earnings forecast not found for symbol: ${input.symbol}`);
      }

      const forecasts = [];
      const currentYear = new Date().getFullYear();

      // Yahoo Financeの四半期予想データを処理
      if (earningsTrend?.trend) {
        for (const trend of earningsTrend.trend) {
          if (trend.period && trend.earningsEstimate) {
            const period = trend.period;
            let quarter = '';
            let fiscalYear = currentYear;

            // 期間の解析 (例: "+1q", "0q", "+2q")
            if (period.includes('q')) {
              const quarterOffset = parseInt(period.replace('q', '')) || 0;
              const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3);
              const targetQuarter = ((currentQuarter + quarterOffset - 1) % 4) + 1;
              
              if (quarterOffset > 0) {
                fiscalYear = currentYear + Math.floor((currentQuarter + quarterOffset - 1) / 4);
              }
              
              quarter = `Q${targetQuarter} ${fiscalYear}`;
            }

            if (quarter) {
              forecasts.push({
                quarter,
                fiscalYear,
                earningsPerShare: trend.earningsEstimate.avg || undefined,
                revenue: trend.revenueEstimate?.avg || undefined,
                netIncome: undefined,
                source: 'analyst_consensus' as const,
                updatedDate: new Date().toISOString(),
              });
            }
          }
        }
      }

      // 四半期履歴データからも予想を補完
      if (earnings?.earningsChart?.quarterly) {
        const quarterlies = earnings.earningsChart.quarterly;
        for (let i = 0; i < Math.min(4, quarterlies.length); i++) {
          const quarterly = quarterlies[quarterlies.length - 1 - i];
          if (quarterly.date && quarterly.estimate !== undefined) {
            const date = new Date(quarterly.date);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const quarter = `Q${Math.ceil(month / 3)} ${year}`;
            
            // 重複チェック
            const exists = forecasts.some(f => f.quarter === quarter);
            if (!exists) {
              forecasts.push({
                quarter,
                fiscalYear: year,
                earningsPerShare: quarterly.estimate,
                revenue: undefined,
                netIncome: undefined,
                source: 'yahoo_finance' as const,
                updatedDate: new Date().toISOString(),
              });
            }
          }
        }
      }

      return {
        symbol: input.symbol,
        companyName: price?.shortName || undefined,
        forecasts: forecasts.slice(0, 8), // 最大8四半期
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to fetch quarterly earnings forecast for ${input.symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // 年次業績予想データを取得する（最大5年分の予想を提供）
  async getAnnualEarningsForecast(input: StockSymbolInput): Promise<AnnualEarningsForecastResponse> {
    try {
      const quoteSummary = await yahooFinance.quoteSummary(input.symbol, {
        modules: ['earnings', 'earningsTrend', 'price']
      });

      const earnings = quoteSummary.earnings;
      const earningsTrend = quoteSummary.earningsTrend;
      const price = quoteSummary.price;

      if (!earnings && !earningsTrend) {
        throw new Error(`Annual earnings forecast not found for symbol: ${input.symbol}`);
      }

      const forecasts = [];
      const currentYear = new Date().getFullYear();

      // Yahoo Financeの年次予想データを処理
      if (earningsTrend?.trend) {
        for (const trend of earningsTrend.trend) {
          if (trend.period && trend.earningsEstimate) {
            const period = trend.period;
            let fiscalYear = currentYear;

            // 年次期間の解析 (例: "0y", "+1y", "+2y")
            if (period.includes('y')) {
              const yearOffset = parseInt(period.replace('y', '')) || 0;
              fiscalYear = currentYear + yearOffset;

              forecasts.push({
                fiscalYear,
                earningsPerShare: trend.earningsEstimate.avg || undefined,
                revenue: trend.revenueEstimate?.avg || undefined,
                netIncome: undefined,
                source: 'analyst_consensus' as const,
                updatedDate: new Date().toISOString(),
              });
            }
          }
        }
      }

      // 年次履歴データの情報は earningsTrend から取得するため、yearlyチャートは使用しない
      // Yahoo Finance APIの構造では、年次予想はearningsTrendに含まれている

      return {
        symbol: input.symbol,
        companyName: price?.shortName || undefined,
        forecasts: forecasts.slice(0, 5), // 最大5年
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to fetch annual earnings forecast for ${input.symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // SEC書類から経営ガイダンスを抽出する（10-K、10-Q、8-Kファイリングを解析）
  async getEarningsGuidance(input: StockSymbolInput): Promise<EarningsGuidanceResponse> {
    try {
      const price = await yahooFinance.quoteSummary(input.symbol, {
        modules: ['price']
      });

      const companyName = price.price?.shortName || undefined;
      const guidances = [];

      // SEC Filingsからガイダンス情報を取得
      try {
        const cik = await this.secService.convertTickerToCik(input.symbol);
        if (cik) {
          const recentFilings = await this.secService.getRecentFilings(cik, ['10-K', '10-Q', '8-K'], 5);
          
          for (const filing of recentFilings) {
            try {
              const content = await this.secService.getFilingContent(cik, filing.accessionNumber, filing.primaryDocument);
              const extractedGuidances = this.secService.extractGuidanceFromText(content, filing.form);
              
              for (const guidance of extractedGuidances) {
                // 期間の推定
                let period = 'N/A';
                if (filing.form === '10-K') {
                  const year = new Date(filing.filingDate).getFullYear();
                  period = `FY${year}`;
                } else if (filing.form === '10-Q') {
                  const date = new Date(filing.filingDate);
                  const quarter = Math.ceil((date.getMonth() + 1) / 3);
                  period = `Q${quarter} ${date.getFullYear()}`;
                } else if (filing.form === '8-K') {
                  period = `Current Period`;
                }

                guidances.push({
                  guidanceType: guidance.guidanceType as 'revenue' | 'earnings' | 'margin' | 'capex' | 'other',
                  period,
                  guidance: guidance.guidance,
                  value: this.extractNumericValue(guidance.guidance),
                  valueRange: this.extractValueRange(guidance.guidance),
                  source: filing.form,
                  filingDate: filing.filingDate,
                  url: `https://www.sec.gov/Archives/edgar/data/${parseInt(cik)}/${filing.accessionNumber.replace(/-/g, '')}/${filing.primaryDocument}`
                });
              }
            } catch (fileError) {
              console.warn(`Failed to process filing ${filing.accessionNumber}:`, fileError);
              continue;
            }
          }
        }
      } catch (secError) {
        console.warn(`Failed to fetch SEC data for ${input.symbol}:`, secError);
      }

      return {
        symbol: input.symbol,
        companyName,
        guidances: guidances.slice(0, 20), // 最大20件
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to fetch earnings guidance for ${input.symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ガイダンステキストから数値を抽出する（$123 million、12.3%等に対応）
  private extractNumericValue(text: string): number | undefined {
    // $123.45 million, 12.3%, 等の数値を抽出
    const patterns = [
      /\$?([\d,]+(?:\.\d+)?)\s*(?:million|billion)/i,
      /([\d.]+)%/,
      /\$([\d,]+(?:\.\d+)?)/
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const numStr = match[1].replace(/,/g, '');
        const num = parseFloat(numStr);
        if (!isNaN(num)) {
          // billion/millionの場合は適切にスケール
          if (text.toLowerCase().includes('billion')) {
            return num * 1000000000;
          } else if (text.toLowerCase().includes('million')) {
            return num * 1000000;
          }
          return num;
        }
      }
    }

    return undefined;
  }

  // ガイダンステキストから数値範囲を抽出する（"$10-15 million"等に対応）
  private extractValueRange(text: string): { min?: number; max?: number } | undefined {
    // "between $10 million and $15 million", "$10-15 million" 等の範囲を抽出
    const rangePatterns = [
      /between\s+\$?([\d,]+(?:\.\d+)?)\s*(?:million|billion)?\s*and\s*\$?([\d,]+(?:\.\d+)?)\s*(?:million|billion)/i,
      /\$?([\d,]+(?:\.\d+)?)\s*(?:million|billion)?\s*(?:to|-)\s*\$?([\d,]+(?:\.\d+)?)\s*(?:million|billion)/i,
      /([\d.]+)%\s*(?:to|-)\s*([\d.]+)%/
    ];

    for (const pattern of rangePatterns) {
      const match = text.match(pattern);
      if (match) {
        const min = parseFloat(match[1].replace(/,/g, ''));
        const max = parseFloat(match[2].replace(/,/g, ''));
        
        if (!isNaN(min) && !isNaN(max)) {
          let multiplier = 1;
          if (text.toLowerCase().includes('billion')) {
            multiplier = 1000000000;
          } else if (text.toLowerCase().includes('million')) {
            multiplier = 1000000;
          }
          
          return {
            min: min * multiplier,
            max: max * multiplier
          };
        }
      }
    }

    return undefined;
  }

}