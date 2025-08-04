const { StockService } = require('./dist/services/stockService.js');

async function testFinancialData() {
  const stockService = new StockService();
  
  try {
    console.log('北里コーポ（368A.T）の財務データを取得中...\n');
    const financialData = await stockService.getFinancialData({ symbol: '368A.T' });
    
    console.log('=== 北里コーポ ファンダメンタル分析 ===\n');
    
    console.log('【基本情報】');
    console.log(`企業名: ${financialData.companyName || 'N/A'}`);
    console.log(`シンボル: ${financialData.symbol}`);
    console.log(`時価総額: ¥${financialData.marketCap ? (financialData.marketCap / 100000000).toFixed(0) + '億' : 'N/A'}`);
    console.log(`ベータ値: ${financialData.beta || 'N/A'}\n`);
    
    console.log('【株価指標】');
    console.log(`PER (実績): ${financialData.trailingPE || 'N/A'}`);
    console.log(`PER (予想): ${financialData.forwardPE || 'N/A'}`);
    console.log(`PBR: ${financialData.priceToBook || 'N/A'}`);
    console.log(`PSR: ${financialData.priceToSales || 'N/A'}`);
    console.log(`PEG比率: ${financialData.pegRatio || 'N/A'}\n`);
    
    console.log('【収益性】');
    console.log(`ROE: ${financialData.returnOnEquity ? (financialData.returnOnEquity * 100).toFixed(2) + '%' : 'N/A'}`);
    console.log(`ROA: ${financialData.returnOnAssets ? (financialData.returnOnAssets * 100).toFixed(2) + '%' : 'N/A'}`);
    console.log(`利益率: ${financialData.profitMargin ? (financialData.profitMargin * 100).toFixed(2) + '%' : 'N/A'}`);
    console.log(`営業利益率: ${financialData.operatingMargin ? (financialData.operatingMargin * 100).toFixed(2) + '%' : 'N/A'}\n`);
    
    console.log('【財務健全性】');
    console.log(`負債比率: ${financialData.debtToEquity || 'N/A'}`);
    console.log(`流動比率: ${financialData.currentRatio || 'N/A'}`);
    console.log(`総負債: ¥${financialData.totalDebt ? (financialData.totalDebt / 100000000).toFixed(0) + '億' : 'N/A'}`);
    console.log(`総現金: ¥${financialData.totalCash ? (financialData.totalCash / 100000000).toFixed(0) + '億' : 'N/A'}\n`);
    
    console.log('【成長性】');
    console.log(`売上成長率: ${financialData.quarterlyRevenueGrowth ? (financialData.quarterlyRevenueGrowth * 100).toFixed(2) + '%' : 'N/A'}`);
    console.log(`利益成長率: ${financialData.quarterlyEarningsGrowth ? (financialData.quarterlyEarningsGrowth * 100).toFixed(2) + '%' : 'N/A'}\n`);
    
    console.log('【配当】');
    console.log(`配当利回り: ${financialData.dividendYield ? (financialData.dividendYield * 100).toFixed(2) + '%' : 'N/A'}`);
    console.log(`配当性向: ${financialData.payoutRatio ? (financialData.payoutRatio * 100).toFixed(2) + '%' : 'N/A'}\n`);
    
  } catch (error) {
    console.error('エラー:', error.message);
  }
}

testFinancialData();