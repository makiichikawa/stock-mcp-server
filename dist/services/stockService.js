"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockService = void 0;
const yahoo_finance2_1 = __importDefault(require("yahoo-finance2"));
class StockService {
    async getStockPrice(input) {
        try {
            const quote = await yahoo_finance2_1.default.quote(input.symbol);
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
        }
        catch (error) {
            throw new Error(`Failed to fetch stock price for ${input.symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getMultipleStockPrices(symbols) {
        const promises = symbols.map(symbol => this.getStockPrice({ symbol }));
        return Promise.all(promises);
    }
    async getFinancialData(input) {
        try {
            const quoteSummary = await yahoo_finance2_1.default.quoteSummary(input.symbol, {
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
        }
        catch (error) {
            throw new Error(`Failed to fetch financial data for ${input.symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getIndexContribution(input) {
        try {
            // 個別銘柄の情報を取得
            const stockQuote = await yahoo_finance2_1.default.quote(input.symbol);
            // 指数の情報を取得
            const indexQuote = await yahoo_finance2_1.default.quote(input.indexSymbol);
            if (!stockQuote || !indexQuote) {
                throw new Error(`Data not found for symbol: ${input.symbol} or index: ${input.indexSymbol}`);
            }
            // 基本的な寄与率計算（簡略化）
            // 実際の寄与率は指数構成比率が必要だが、概算として時価総額ベースで計算
            const priceChange = stockQuote.regularMarketChange || 0;
            const priceChangePercent = stockQuote.regularMarketChangePercent || 0;
            const marketCap = stockQuote.marketCap || 0;
            // 日経平均の概算寄与率計算（株価変動 ÷ 除数）
            // 日経平均の除数は約27.4（2025年概算）
            const nikkeiDivisor = 27.4;
            const contribution = input.indexSymbol.includes('N225') || input.indexSymbol.includes('NKY')
                ? priceChange / nikkeiDivisor
                : (priceChange * marketCap) / 1000000000000; // TOPIX等の時価総額加重平均の場合
            const indexChange = indexQuote.regularMarketChange || 0;
            const contributionPercent = indexChange !== 0 ? (contribution / indexChange) * 100 : 0;
            return {
                symbol: input.symbol,
                companyName: stockQuote.shortName || stockQuote.longName,
                indexSymbol: input.indexSymbol,
                indexName: indexQuote.shortName || indexQuote.longName,
                currentPrice: stockQuote.regularMarketPrice || 0,
                priceChange: priceChange,
                priceChangePercent: priceChangePercent,
                indexWeight: undefined, // 正確な構成比率は別途データソースが必要
                contribution: contribution,
                contributionPercent: contributionPercent,
                marketCap: marketCap,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            throw new Error(`Failed to fetch contribution data for ${input.symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getIndexAnalysis(indexSymbol, topN = 10) {
        try {
            // 指数の基本情報を取得
            const indexQuote = await yahoo_finance2_1.default.quote(indexSymbol);
            if (!indexQuote) {
                throw new Error(`Index data not found for symbol: ${indexSymbol}`);
            }
            // 日経平均主要構成銘柄（概算）
            const nikkeiMajorSymbols = [
                '7203.T', // トヨタ
                '6758.T', // ソニーG
                '9984.T', // ソフトバンクG
                '8035.T', // 東京エレクトロン
                '6861.T', // キーエンス
                '9983.T', // ファーストリテイリング
                '4063.T', // 信越化学
                '6954.T', // ファナック
                '8058.T', // 三菱商事
                '7741.T', // HOYA
            ];
            // TOPIXの場合は代表的な大型株
            const topixMajorSymbols = [
                '7203.T', // トヨタ
                '6758.T', // ソニーG
                '8306.T', // 三菱UFJ
                '9432.T', // NTT
                '9984.T', // ソフトバンクG
                '8035.T', // 東京エレクトロン
                '6861.T', // キーエンス
                '8031.T', // 三井物産
                '8058.T', // 三菱商事
                '4519.T', // 中外製薬
            ];
            const symbols = indexSymbol.includes('N225') || indexSymbol.includes('NKY')
                ? nikkeiMajorSymbols
                : topixMajorSymbols;
            // 各銘柄の寄与率を取得
            const contributions = await Promise.all(symbols.map(async (symbol) => {
                try {
                    return await this.getIndexContribution({ symbol, indexSymbol });
                }
                catch (error) {
                    return null;
                }
            }));
            const validContributions = contributions.filter((c) => c !== null);
            // 寄与率でソート
            const sortedContributions = validContributions.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
            // プラス・マイナス寄与率を分類
            const positiveContributions = sortedContributions.filter(c => c.contribution > 0);
            const negativeContributions = sortedContributions.filter(c => c.contribution < 0);
            const totalPositive = positiveContributions.reduce((sum, c) => sum + c.contribution, 0);
            const totalNegative = negativeContributions.reduce((sum, c) => sum + c.contribution, 0);
            return {
                indexSymbol,
                indexName: indexQuote.shortName || indexQuote.longName,
                indexChange: indexQuote.regularMarketChange || 0,
                indexChangePercent: indexQuote.regularMarketChangePercent || 0,
                topContributors: positiveContributions.slice(0, topN),
                bottomContributors: negativeContributions.slice(0, topN),
                totalContributions: {
                    positive: totalPositive,
                    negative: totalNegative,
                    net: totalPositive + totalNegative,
                },
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            throw new Error(`Failed to fetch index analysis for ${indexSymbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
exports.StockService = StockService;
//# sourceMappingURL=stockService.js.map