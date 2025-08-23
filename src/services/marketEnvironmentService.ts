import { MarketEnvironmentRequest, MarketEnvironmentResponse } from '../types/marketTypes';

/**
 * 市場環境データ取得サービス
 * Phase 1: Yahoo Finance APIのみ使用
 */
export class MarketEnvironmentService {

  /**
   * 市場環境データを取得
   */
  async getMarketEnvironment(request: MarketEnvironmentRequest): Promise<MarketEnvironmentResponse> {
    console.log(`市場環境データ取得開始 - 地域: ${request.region}, 期間: ${request.timeframe}`);
    
    try {
      // 並列でYahoo Finance APIからデータ取得
      const [interestRates, usdJpy, marketIndices, sentiment, sectors] = await Promise.all([
        this.getInterestRates(),
        this.getUsdJpyData(),
        this.getMarketIndices(),
        this.getMarketSentiment(),
        this.getSectorRotation()
      ]);

      // 経済指標は手動設定（Yahoo APIでは取得困難）
      const economicData = this.getMockEconomicIndicators();

      // 投資環境の総合評価を生成
      const investmentClimate = this.analyzeInvestmentClimate({
        interestRates,
        usdJpy,
        marketIndices,
        economicData,
        sentiment
      });

      return {
        region: request.region,
        timestamp: new Date().toISOString(),
        interest_rates: interestRates,
        usd_jpy: usdJpy,
        market_indices: marketIndices,
        economic_cycle: {
          current_phase: this.determineEconomicPhase(economicData),
          indicators: economicData,
          cycle_score: this.calculateCycleScore(economicData)
        },
        sector_rotation: sectors,
        market_sentiment: sentiment,
        investment_climate: investmentClimate,
        data_sources: {
          interest_rates: 'Yahoo Finance (^TNX)',
          usd_jpy: 'Yahoo Finance (USDJPY=X)',
          market_indices: 'Yahoo Finance (^DJI)',
          economic_data: '手動設定 (FRED APIなど別途要実装)',
          sentiment: 'Yahoo Finance (^VIX)',
          sectors: 'Yahoo Finance (Sector ETFs)'
        }
      };
      
    } catch (error) {
      throw new Error(`市場環境データ取得失敗: ${error instanceof Error ? error.message : '不明なエラー'}`);
    }
  }

  /**
   * 金利データを取得 (Yahoo Finance API)
   */
  private async getInterestRates(): Promise<any> {
    console.log('金利データ取得中... (^TNX)');
    
    try {
      // 米国10年債利回りを取得（^TNX）
      const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/%5ETNX`);
      const data = await response.json();
      
      if (!data.chart?.result?.[0]?.meta) {
        throw new Error('金利データの取得に失敗');
      }

      const currentRate = data.chart.result[0].meta.regularMarketPrice;
      const previousClose = data.chart.result[0].meta.previousClose;
      
      const change1d = currentRate - previousClose;
      const changePercent = (change1d / previousClose) * 100;
      
      return {
        current_rate: currentRate,
        trend: changePercent > 0.1 ? 'rising' : changePercent < -0.1 ? 'falling' : 'stable',
        change_1m: changePercent, // TODO: 実際は1ヶ月データ取得が必要（historicalデータ）
        change_3m: 0, // TODO: 3ヶ月データ取得が必要（historicalデータ）
        fed_policy_outlook: this.assessFedPolicy(currentRate, changePercent)
      };
      
    } catch (error) {
      console.warn('金利データ取得エラー、デフォルト値を使用:', error);
      return {
        current_rate: 4.5,
        trend: 'stable' as const,
        change_1m: 0,
        change_3m: 0,
        fed_policy_outlook: 'neutral' as const
      };
    }
  }

  /**
   * ドル円データを取得 (Yahoo Finance API)
   */
  private async getUsdJpyData(): Promise<any> {
    console.log('ドル円データ取得中... (USDJPY=X)');
    
    try {
      const response = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/USDJPY%3DX');
      const data = await response.json();
      
      if (!data.chart?.result?.[0]?.meta) {
        throw new Error('ドル円データの取得に失敗');
      }

      const currentRate = data.chart.result[0].meta.regularMarketPrice;
      const previousClose = data.chart.result[0].meta.previousClose;
      
      const change1d = currentRate - previousClose;
      const changePercent = (change1d / previousClose) * 100;
      
      return {
        current_rate: currentRate,
        trend: changePercent > 0.5 ? 'usd_strengthening' : changePercent < -0.5 ? 'usd_weakening' : 'stable',
        change_1m: changePercent, // TODO: 実際は1ヶ月履歴データが必要
        change_3m: 0, // TODO: 3ヶ月履歴データが必要
        change_1y: 0, // TODO: 1年履歴データが必要
        volatility: Math.abs(changePercent) > 1 ? 'high' : Math.abs(changePercent) > 0.5 ? 'medium' : 'low'
      };
      
    } catch (error) {
      console.warn('ドル円データ取得エラー、デフォルト値を使用:', error);
      return {
        current_rate: 150.0,
        trend: 'stable' as const,
        change_1m: 0,
        change_3m: 0,
        change_1y: 0,
        volatility: 'medium' as const
      };
    }
  }

  /**
   * NYダウデータを取得 (Yahoo Finance API)
   */
  private async getMarketIndices(): Promise<any> {
    console.log('NYダウデータ取得中... (^DJI)');
    
    try {
      const response = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/%5EDJI');
      const data = await response.json();
      
      if (!data.chart?.result?.[0]?.meta) {
        throw new Error('NYダウデータの取得に失敗');
      }

      const currentLevel = data.chart.result[0].meta.regularMarketPrice;
      const previousClose = data.chart.result[0].meta.previousClose;
      
      const change1d = currentLevel - previousClose;
      const changePercent = (change1d / previousClose) * 100;
      
      return {
        dow_jones: {
          current_level: Math.round(currentLevel),
          trend: changePercent > 0.2 ? 'rising' : changePercent < -0.2 ? 'falling' : 'stable',
          change_1d: Math.round(changePercent * 100) / 100,
          change_1w: 0, // TODO: 週次データはhistoricalデータから計算必要
          change_1m: 0, // TODO: 月次データはhistoricalデータから計算必要
          change_3m: 0, // TODO: 3ヶ月データはhistoricalデータから計算必要
          technical_signal: this.assessTechnicalSignal(changePercent)
        }
      };
      
    } catch (error) {
      console.warn('NYダウデータ取得エラー、デフォルト値を使用:', error);
      return {
        dow_jones: {
          current_level: 35000,
          trend: 'stable' as const,
          change_1d: 0,
          change_1w: 0,
          change_1m: 0,
          change_3m: 0,
          technical_signal: 'neutral' as const
        }
      };
    }
  }

  /**
   * 市場センチメントを取得 (Yahoo Finance API)
   */
  private async getMarketSentiment(): Promise<any> {
    console.log('VIXデータ取得中... (^VIX)');
    
    try {
      const response = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/%5EVIX');
      const data = await response.json();
      
      if (!data.chart?.result?.[0]?.meta) {
        throw new Error('VIXデータの取得に失敗');
      }

      const vix = data.chart.result[0].meta.regularMarketPrice;
      const previousClose = data.chart.result[0].meta.previousClose;
      
      const vixChange = vix - previousClose;
      
      return {
        vix: Math.round(vix * 100) / 100,
        vix_trend: vixChange > 1 ? 'rising' : vixChange < -1 ? 'falling' : 'stable',
        sentiment_score: this.calculateSentimentScore(vix),
        fear_greed_index: this.vixToFearGreed(vix),
        put_call_ratio: undefined // TODO: Yahoo APIでは取得困難、CBOE APIが必要
      };
      
    } catch (error) {
      console.warn('VIXデータ取得エラー、デフォルト値を使用:', error);
      return {
        vix: 20.0,
        vix_trend: 'stable' as const,
        sentiment_score: 0,
        fear_greed_index: 50,
        put_call_ratio: undefined
      };
    }
  }

  /**
   * セクターローテーションを取得 (Yahoo Finance API - セクターETF)
   */
  private async getSectorRotation(): Promise<any> {
    console.log('セクター情報取得中...');
    
    try {
      // 主要セクターETFのパフォーマンスを取得
      const sectorETFs = [
        { symbol: 'XLK', name: 'Technology' },
        { symbol: 'XLV', name: 'Healthcare' }, 
        { symbol: 'XLF', name: 'Financials' },
        { symbol: 'XLE', name: 'Energy' },
        { symbol: 'XLRE', name: 'Real Estate' },
        { symbol: 'XLU', name: 'Utilities' }
      ];

      // 簡易実装: 1つのETFのみ取得してサンプル作成
      // TODO: 全セクターETFを並列取得してパフォーマンス比較
      const sampleResponse = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/XLK');
      const sampleData = await sampleResponse.json();
      
      if (sampleData.chart?.result?.[0]?.meta) {
        const currentPrice = sampleData.chart.result[0].meta.regularMarketPrice;
        const previousClose = sampleData.chart.result[0].meta.previousClose;
        const changePercent = ((currentPrice - previousClose) / previousClose) * 100;
        
        return {
          outperforming_sectors: [
            { sector: 'Technology', performance_1m: Math.round(changePercent * 100) / 100, performance_3m: 0 }
            // TODO: 他のセクターも同様に取得
          ],
          underperforming_sectors: [
            // TODO: 全セクター比較後、下位セクターを抽出
          ]
        };
      }
      
      // フォールバック
      return this.getMockSectorData();
      
    } catch (error) {
      console.warn('セクターデータ取得エラー、サンプルデータを使用:', error);
      return this.getMockSectorData();
    }
  }

  /**
   * 経済指標の手動設定（Yahoo APIでは取得不可）
   * TODO: FRED API等で実装
   */
  private getMockEconomicIndicators(): any {
    console.log('経済指標取得 (手動設定)...');
    
    // 注意: これらのデータはモック値です
    // 実際の実装では FRED API、BLS API などが必要
    return {
      gdp_growth: 2.1,        // TODO: FRED API - GDPC1
      unemployment_rate: 3.7,  // TODO: BLS API - UNRATE
      inflation_rate: 3.2,     // TODO: FRED API - CPIAUCSL
      pmi_manufacturing: 48.5, // TODO: ISM Manufacturing PMI
      pmi_services: 52.1       // TODO: ISM Services PMI
    };
  }

  /**
   * セクターデータのモック（Yahoo API並列取得の代替）
   */
  private getMockSectorData(): any {
    // TODO: 実際は全セクターETFを並列取得して比較
    return {
      outperforming_sectors: [
        { sector: 'Technology', performance_1m: 5.2, performance_3m: 12.8 },
        { sector: 'Healthcare', performance_1m: 3.1, performance_3m: 8.5 }
      ],
      underperforming_sectors: [
        { sector: 'Real Estate', performance_1m: -2.1, performance_3m: -5.3 },
        { sector: 'Utilities', performance_1m: -1.5, performance_3m: -3.2 }
      ]
    };
  }

  // =============== ヘルパーメソッド ===============

  private assessFedPolicy(rate: number, change: number): 'hawkish' | 'neutral' | 'dovish' {
    if (rate > 5 || change > 0.5) return 'hawkish';
    if (rate < 3 || change < -0.5) return 'dovish';
    return 'neutral';
  }

  private assessTechnicalSignal(change: number): 'bullish' | 'neutral' | 'bearish' {
    if (change > 1) return 'bullish';
    if (change < -1) return 'bearish';
    return 'neutral';
  }

  private calculateSentimentScore(vix: number): number {
    // VIX 10-30 を -1 to 1 にマッピング
    if (vix < 15) return 0.5;  // 楽観的
    if (vix > 25) return -0.5; // 悲観的
    return 0; // 中立
  }

  private vixToFearGreed(vix: number): number {
    // VIXを0-100のFear&Greedインデックスに変換
    return Math.max(0, Math.min(100, 100 - (vix - 10) * 3));
  }

  private determineEconomicPhase(indicators: any): 'recession' | 'recovery' | 'expansion' | 'peak' {
    const { gdp_growth, unemployment_rate, pmi_manufacturing } = indicators;
    
    if (gdp_growth < 0 || unemployment_rate > 7) return 'recession';
    if (gdp_growth < 1.5 && pmi_manufacturing < 50) return 'recovery';
    if (gdp_growth > 3 && unemployment_rate < 4) return 'peak';
    return 'expansion';
  }

  private calculateCycleScore(indicators: any): number {
    // 簡易的な景気循環スコア (-1 to 1)
    const { gdp_growth, unemployment_rate } = indicators;
    
    let score = 0;
    if (gdp_growth) score += (gdp_growth - 2) / 3; // 2%を中立とする
    if (unemployment_rate) score -= (unemployment_rate - 5) / 5; // 5%を中立とする
    
    return Math.max(-1, Math.min(1, score));
  }

  private analyzeInvestmentClimate(data: any): any {
    const { interestRates, sentiment, marketIndices } = data;
    
    // 簡易的な投資環境評価
    let score = 0;
    
    // 金利環境
    if (interestRates.trend === 'falling') score += 1;
    else if (interestRates.trend === 'rising') score -= 1;
    
    // センチメント
    score += sentiment.sentiment_score;
    
    // 市場動向
    if (marketIndices.dow_jones.technical_signal === 'bullish') score += 0.5;
    else if (marketIndices.dow_jones.technical_signal === 'bearish') score -= 0.5;
    
    const rating = score > 1 ? 'bullish' : 
                  score > 0.5 ? 'optimistic' :
                  score > -0.5 ? 'neutral' :
                  score > -1 ? 'cautious' : 'bearish';

    return {
      overall_rating: rating,
      risk_factors: this.identifyRiskFactors(data),
      opportunities: this.identifyOpportunities(data),
      recommended_allocation: this.getRecommendedAllocation(rating),
      market_trend_analysis: this.analyzeMarketTrend(marketIndices),
      fx_impact_analysis: this.analyzeFxImpact(data.usdJpy)
    };
  }

  private identifyRiskFactors(data: any): string[] {
    const risks = [];
    
    if (data.interestRates.trend === 'rising') {
      risks.push('金利上昇による債券価格下落・株式バリュエーション圧迫');
    }
    
    if (data.sentiment.vix > 25) {
      risks.push('市場ボラティリティ上昇・リスクオフムード');
    }
    
    if (data.usdJpy.volatility === 'high') {
      risks.push('為替変動リスク・輸出企業への影響');
    }
    
    return risks;
  }

  private identifyOpportunities(data: any): string[] {
    const opportunities = [];
    
    if (data.interestRates.trend === 'falling') {
      opportunities.push('金利低下による成長株・債券への追い風');
    }
    
    if (data.sentiment.sentiment_score > 0.3) {
      opportunities.push('市場楽観ムードによる上値期待');
    }
    
    if (data.marketIndices.dow_jones.technical_signal === 'bullish') {
      opportunities.push('株式市場の上昇トレンド継続期待');
    }
    
    return opportunities;
  }

  private getRecommendedAllocation(rating: string): { stocks: number; bonds: number; cash: number } {
    switch (rating) {
      case 'bullish': return { stocks: 80, bonds: 15, cash: 5 };
      case 'optimistic': return { stocks: 70, bonds: 20, cash: 10 };
      case 'neutral': return { stocks: 60, bonds: 30, cash: 10 };
      case 'cautious': return { stocks: 40, bonds: 40, cash: 20 };
      case 'bearish': return { stocks: 20, bonds: 50, cash: 30 };
      default: return { stocks: 60, bonds: 30, cash: 10 };
    }
  }

  private analyzeMarketTrend(indices: any): string {
    const dow = indices.dow_jones;
    
    if (dow.technical_signal === 'bullish') {
      return `NYダウは${dow.current_level.toLocaleString()}で堅調な上昇基調。1日で${dow.change_1d.toFixed(2)}%の上昇を見せており、市場は楽観的な展開。`;
    } else if (dow.technical_signal === 'bearish') {
      return `NYダウは${dow.current_level.toLocaleString()}で調整局面。1日で${dow.change_1d.toFixed(2)}%下落しており、慎重な姿勢が必要。`;
    } else {
      return `NYダウは${dow.current_level.toLocaleString()}でレンジ相場。明確な方向感に欠けており、様子見ムードが継続。`;
    }
  }

  private analyzeFxImpact(usdJpy: any): string {
    const rate = usdJpy.current_rate;
    
    if (usdJpy.trend === 'usd_strengthening') {
      return `ドル円${rate.toFixed(2)}円でドル高進行中。輸出企業には追い風だが、輸入コスト上昇に注意。米国株投資には為替メリット。`;
    } else if (usdJpy.trend === 'usd_weakening') {
      return `ドル円${rate.toFixed(2)}円でドル安・円高進行。輸出企業には逆風、輸入企業には追い風。米国株投資は為替デメリット。`;
    } else {
      return `ドル円${rate.toFixed(2)}円で安定推移。為替変動による投資への影響は限定的。`;
    }
  }
}