#!/usr/bin/env node

const { StockService } = require('./dist/services/stockService.js');

async function findJapanProfitTurnaround() {
  const stockService = new StockService();
  
  // 日本の主要銘柄（Tokyo Stock Exchange symbols with .T suffix for Yahoo Finance）
  const japaneseSymbols = [
    // 主要指数構成銘柄
    '7203.T', // トヨタ自動車
    '6758.T', // ソニー
    '9984.T', // ソフトバンクグループ
    '6861.T', // キーエンス
    '4519.T', // 中外製薬
    '8035.T', // 東京エレクトロン
    '6954.T', // ファナック
    '9432.T', // NTT
    '8306.T', // 三菱UFJフィナンシャル・グループ
    '4661.T', // オリエンタルランド
    '7974.T', // 任天堂
    '4507.T', // 塩野義製薬
    '8058.T', // 三菱商事
    '9020.T', // 東日本旅客鉄道
    '2914.T', // 日本たばこ産業
    '4568.T', // 第一三共
    '6981.T', // 村田製作所
    '8031.T', // 三井物産
    '4063.T', // 信越化学工業
    '9434.T', // ソフトバンク
    
    // テクノロジー・IT関連
    '4755.T', // 楽天グループ
    '3659.T', // ネクソン
    '2432.T', // DeNA
    '3765.T', // ガンホー・オンライン・エンターテイメント
    '4385.T', // メルカリ
    '4689.T', // Zホールディングス
    '6098.T', // リクルート
    '4751.T', // サイバーエージェント
    '3770.T', // ザッパラス
    '2121.T', // MIXI
    
    // バイオテック・製薬
    '4523.T', // エーザイ
    '4502.T', // 武田薬品工業
    '4578.T', // 大塚ホールディングス
    '4528.T', // 小野薬品工業
    '4612.T', // 日本ペイント
    '4021.T', // 日産化学
    '4183.T', // 三井化学
    
    // 自動車関連
    '7201.T', // 日産自動車
    '7267.T', // ホンダ
    '7269.T', // スズキ
    '7211.T', // 三菱自動車工業
    '7202.T', // いすゞ自動車
    '5401.T', // 新日本製鐵
    
    // 小売・消費関連
    '8267.T', // イオン
    '3099.T', // 三越伊勢丹ホールディングス
    '8233.T', // 高島屋
    '7453.T', // 良品計画
    '9843.T', // ニトリホールディングス
    '9983.T', // ファーストリテイリング
    '2602.T', // 日清食品ホールディングス
    '2801.T', // キッコーマン
    
    // 金融・保険
    '8316.T', // 三井住友フィナンシャルグループ
    '8411.T', // みずほフィナンシャルグループ
    '8725.T', // MS&ADインシュアランスグループホールディングス
    '8766.T', // 東京海上ホールディングス
    
    // 不動産・建設
    '8802.T', // 三菱地所
    '8801.T', // 三井不動産
    '1925.T', // 大和ハウス工業
    '1928.T', // 積水ハウス
    '1963.T', // 日揮ホールディングス
    
    // エネルギー・資源
    '5020.T', // ENEOS ホールディングス
    '9501.T', // 東京電力ホールディングス
    '9502.T', // 中部電力
    '9503.T', // 関西電力
    
    // 成長株・新興企業
    '3938.T', // LINE
    '6666.T', // リバーエレテック
    '3932.T', // アカツキ
    '6039.T', // 日本動物高度医療センター
    '4348.T', // インフォコム
    '3664.T', // モブキャスト
    '4751.T', // サイバーエージェント
    '3696.T', // セレス
    '6629.T', // テクノホライゾン・ホールディングス
    '3667.T', // enish
  ];
  
  console.log('日本株の黒字転換銘柄を分析中...\n');
  console.log(`対象銘柄数: ${japaneseSymbols.length}\n`);
  
  const results = [];
  let processed = 0;
  
  for (const symbol of japaneseSymbols) {
    try {
      processed++;
      console.log(`[${processed}/${japaneseSymbols.length}] ${symbol} を分析中...`);
      
      const analysis = await stockService.analyzeProfitabilityTurnAround({ symbol });
      
      results.push({
        symbol,
        status: analysis.turnAroundStatus,
        change: analysis.quarterlyChange,
        currentIncome: analysis.currentQuarterNetIncome,
        previousIncome: analysis.previousQuarterNetIncome,
        marketCap: analysis.marketCap,
        companyName: analysis.companyName
      });
      
      if (analysis.turnAroundStatus === 'profit_turnaround') {
        console.log(`  *** 黒字転換を確認！ ***`);
        console.log(`  企業名: ${analysis.companyName || 'N/A'}`);
        console.log(`  今四半期純利益: ¥${(analysis.currentQuarterNetIncome / 1e8).toFixed(1)}億円`);
        console.log(`  前四半期純利益: ¥${(analysis.previousQuarterNetIncome / 1e8).toFixed(1)}億円`);
        console.log(`  改善率: ${analysis.quarterlyChange?.toFixed(1)}%`);
        if (analysis.marketCap) {
          console.log(`  時価総額: ¥${(analysis.marketCap / 1e12).toFixed(2)}兆円`);
        }
      } else {
        console.log(`  ステータス: ${analysis.turnAroundStatus}`);
      }
      console.log('');
      
      // レート制限回避のため遅延
      await new Promise(resolve => setTimeout(resolve, 1500));
      
    } catch (error) {
      console.error(`${symbol} の分析でエラー: ${error.message}`);
      console.log('');
    }
  }
  
  // 黒字転換銘柄のサマリー
  const turnaroundStocks = results.filter(r => r.status === 'profit_turnaround');
  console.log('\n=== 日本株 黒字転換銘柄サマリー ===');
  console.log(`分析銘柄数: ${results.length}`);
  console.log(`黒字転換銘柄数: ${turnaroundStocks.length}\n`);
  
  if (turnaroundStocks.length > 0) {
    turnaroundStocks
      .sort((a, b) => (b.change || 0) - (a.change || 0))
      .forEach((stock, index) => {
        console.log(`${index + 1}. ${stock.symbol} (${stock.companyName || 'N/A'})`);
        console.log(`   改善率: ${stock.change?.toFixed(1)}%`);
        console.log(`   今四半期: ¥${(stock.currentIncome / 1e8).toFixed(1)}億円`);
        console.log(`   前四半期: ¥${(stock.previousIncome / 1e8).toFixed(1)}億円`);
        if (stock.marketCap) {
          console.log(`   時価総額: ¥${(stock.marketCap / 1e12).toFixed(2)}兆円`);
        }
        console.log('');
      });
  } else {
    console.log('黒字転換した銘柄は見つかりませんでした。');
  }
  
  // その他のステータスも表示
  const statusCounts = {};
  results.forEach(r => {
    statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
  });
  
  console.log('\n=== ステータス別集計 ===');
  Object.entries(statusCounts).forEach(([status, count]) => {
    const statusName = {
      'profit_turnaround': '黒字転換',
      'loss_turnaround': '赤字転落',
      'continued_profit': '継続黒字',
      'continued_loss': '継続赤字'
    }[status] || status;
    console.log(`${statusName}: ${count}銘柄`);
  });
}

if (require.main === module) {
  findJapanProfitTurnaround().catch(console.error);
}