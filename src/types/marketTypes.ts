// 市場環境データの型定義

export interface MarketEnvironmentRequest {
  region: 'US' | 'JP' | 'GLOBAL';
  timeframe?: '1M' | '3M' | '1Y';
}

export interface InterestRateInfo {
  current_rate: number;
  trend: 'rising' | 'stable' | 'falling';
  change_1m: number;
  change_3m: number;
  fed_policy_outlook?: 'hawkish' | 'neutral' | 'dovish';
  boj_policy_outlook?: 'hawkish' | 'neutral' | 'dovish';
}

export interface UsdJpyInfo {
  current_rate: number;
  trend: 'usd_strengthening' | 'stable' | 'usd_weakening';
  change_1m: number;
  change_3m: number;
  change_1y: number;
  volatility: 'low' | 'medium' | 'high';
}

export interface MarketIndicesInfo {
  dow_jones: {
    current_level: number;
    trend: 'rising' | 'stable' | 'falling';
    change_1d: number;
    change_1w: number;
    change_1m: number;
    change_3m: number;
    technical_signal: 'bullish' | 'neutral' | 'bearish';
  };
}

export interface EconomicIndicators {
  gdp_growth?: number;
  unemployment_rate?: number;
  inflation_rate?: number;
  pmi_manufacturing?: number;
  pmi_services?: number;
}

export interface EconomicCycle {
  current_phase: 'recession' | 'recovery' | 'expansion' | 'peak';
  indicators: EconomicIndicators;
  cycle_score: number; // -1 (recession) to 1 (expansion)
}

export interface SectorRotation {
  outperforming_sectors: Array<{
    sector: string;
    performance_1m: number;
    performance_3m: number;
  }>;
  underperforming_sectors: Array<{
    sector: string;
    performance_1m: number;
    performance_3m: number;
  }>;
}

export interface MarketSentiment {
  vix: number;
  vix_trend: 'rising' | 'stable' | 'falling';
  sentiment_score: number; // -1 (fear) to 1 (greed)
  fear_greed_index?: number; // 0-100
  put_call_ratio?: number;
}

export interface MarketEnvironmentResponse {
  region: string;
  timestamp: string;
  interest_rates: InterestRateInfo;
  usd_jpy: UsdJpyInfo;
  market_indices: MarketIndicesInfo;
  economic_cycle: EconomicCycle;
  sector_rotation: SectorRotation;
  market_sentiment: MarketSentiment;
  investment_climate: {
    overall_rating: 'bearish' | 'cautious' | 'neutral' | 'optimistic' | 'bullish';
    risk_factors: string[];
    opportunities: string[];
    recommended_allocation: {
      stocks: number;
      bonds: number;
      cash: number;
    };
    market_trend_analysis: string; // NYダウの動向分析
    fx_impact_analysis: string; // ドル円が投資に与える影響分析
  };
  data_sources: {
    interest_rates: string;
    usd_jpy: string;
    market_indices: string;
    economic_data: string;
    sentiment: string;
    sectors: string;
  };
}