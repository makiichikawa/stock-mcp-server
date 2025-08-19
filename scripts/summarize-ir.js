#!/usr/bin/env node

/**
 * IR要約機能 - 手動実行スクリプト
 * 
 * 使用方法:
 *   node scripts/summarize-ir.js <SYMBOL> [LANGUAGE]
 * 
 * 例:
 *   node scripts/summarize-ir.js PGY ja
 *   node scripts/summarize-ir.js 6758 ja
 */

const { IRSummaryService } = require('../dist/services/irSummaryService.js');
const fs = require('fs');
const path = require('path');

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.error('使用方法: node scripts/summarize-ir.js <SYMBOL> [LANGUAGE]');
    console.error('例: node scripts/summarize-ir.js PGY ja');
    process.exit(1);
  }

  const symbol = args[0];
  const language = args[1] || 'ja';

  console.log(`🚀 IR要約開始: ${symbol} (言語: ${language})`);
  console.log('=' .repeat(50));

  try {
    const service = new IRSummaryService();
    const result = await service.generateIRSummary({
      symbol,
      language
    });

    // 結果を見やすく表示
    console.log(`\n📊 要約結果 - ${symbol}`);
    console.log('=' .repeat(30));
    
    console.log(`\n📝 文書タイプ: ${result.documentType}`);
    console.log(`⏱️  処理時間: ${result.processingInfo.processingTime}ms`);
    console.log(`📄 ページ数: ${result.processingInfo.pageCount}ページ`);
    
    console.log(`\n📋 全文要約:`);
    console.log(result.summary.executive);
    
    // 決算短信の場合
    if (result.summary.financial_comparison) {
      console.log(`\n💰 財務比較データ:`);
      
      const fc = result.summary.financial_comparison;
      if (fc.revenue && fc.revenue.current) {
        console.log(`  売上高: 当期 ${fc.revenue.current} (前期比 ${fc.revenue.change_percent}%)`);
      }
      if (fc.operating_income && fc.operating_income.current) {
        console.log(`  営業利益: 当期 ${fc.operating_income.current} (前期比 ${fc.operating_income.change_percent}%)`);
      }
      if (fc.ordinary_income && fc.ordinary_income.current) {
        console.log(`  経常利益: 当期 ${fc.ordinary_income.current} (前期比 ${fc.ordinary_income.change_percent}%)`);
      }
      if (fc.operating_cash_flow && fc.operating_cash_flow.current) {
        console.log(`  営業CF: 当期 ${fc.operating_cash_flow.current} (前期比 ${fc.operating_cash_flow.change_percent}%)`);
      }
      
      console.log(`\n📈 業績予想変更:`);
      const gc = result.summary.guidance_changes;
      if (gc.has_revision) {
        const revisionText = gc.revision_type === 'upward' ? '上方修正' : 
                           gc.revision_type === 'downward' ? '下方修正' : '修正';
        console.log(`  ${revisionText}: ${gc.details || 'あり'}`);
      } else {
        console.log('  修正なし');
      }
    }
    
    // 有価証券報告書の場合
    if (result.summary.business_situation) {
      console.log(`\n🏢 事業状況:`);
      const bs = result.summary.business_situation;
      if (bs.most_profitable_segment) {
        console.log(`  最利益セグメント: ${bs.most_profitable_segment}`);
      }
    }
    
    if (result.summary.balance_sheet) {
      console.log(`\n📊 貸借対照表分析:`);
      const bsheet = result.summary.balance_sheet;
      if (bsheet.equity_ratio) {
        const assessment = bsheet.equity_ratio_assessment === 'excellent' ? '優良' :
                          bsheet.equity_ratio_assessment === 'good' ? '良好' :
                          bsheet.equity_ratio_assessment === 'fair' ? '普通' : '注意';
        console.log(`  純資産比率: ${bsheet.equity_ratio}% (${assessment})`);
      }
    }
    
    if (result.summary.profit_loss) {
      console.log(`\n📈 損益分析:`);
      const pl = result.summary.profit_loss;
      console.log(`  売上向上: ${pl.revenue_improved ? 'あり' : 'なし'} (${pl.revenue_change_percent}%)`);
      console.log(`  利益向上: ${pl.profit_improved ? 'あり' : 'なし'} (${pl.profit_change_percent}%)`);
    }
    
    console.log(`\n🔢 主要指標:`);
    if (result.key_metrics.revenue) {
      console.log(`  売上高: ${result.key_metrics.revenue}`);
    }
    if (result.key_metrics.profit) {
      console.log(`  利益: ${result.key_metrics.profit}`);
    }
    if (result.key_metrics.growth_rate) {
      console.log(`  成長率: ${(result.key_metrics.growth_rate * 100).toFixed(1)}%`);
    }
    
    console.log(`\n⏰ 処理完了: ${new Date(result.timestamp).toLocaleString('ja-JP')}`);
    
    // Markdownレポートを生成
    const markdownReport = generateMarkdownReport(result);
    const reportFileName = `ir-summary-${symbol}-${new Date().toISOString().slice(0, 10)}-${new Date().toTimeString().slice(0, 5).replace(':', '-')}.md`;
    const reportPath = path.join(process.cwd(), 'tests', reportFileName);
    
    // testsディレクトリが存在しない場合は作成
    const testsDir = path.join(process.cwd(), 'tests');
    if (!fs.existsSync(testsDir)) {
      fs.mkdirSync(testsDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, markdownReport, 'utf8');
    console.log(`\n📄 Markdownレポートを生成: ${reportPath}`);
    console.log('\n✅ IR要約が正常に完了しました！');

  } catch (error) {
    console.error('\n❌ エラーが発生しました:');
    console.error(error.message);
    process.exit(1);
  }
}

function generateMarkdownReport(result) {
  const timestamp = new Date(result.timestamp);
  const formattedTimestamp = `${timestamp.getFullYear()}/${timestamp.getMonth() + 1}/${timestamp.getDate()} ${timestamp.getHours()}:${timestamp.getMinutes().toString().padStart(2, '0')}:${timestamp.getSeconds().toString().padStart(2, '0')}`;
  
  let markdown = `# IR要約レポート - ${result.symbol}

## 📊 基本情報
- **銘柄コード**: ${result.symbol}
- **文書タイプ**: ${result.documentType}
- **処理時間**: ${result.processingInfo.processingTime}ms
- **ページ数**: ${result.processingInfo.pageCount}ページ
- **抽出方法**: ${result.processingInfo.extractionMethod}
- **生成日時**: ${formattedTimestamp}

---

## 📋 全文要約
${result.summary.executive}

---`;

  // 決算短信の場合
  if (result.summary.financial_comparison) {
    markdown += `
## 💰 財務比較データ（当期 vs 前期）
`;
    const fc = result.summary.financial_comparison;
    
    if (fc.revenue && fc.revenue.current) {
      markdown += `
### 売上高
- **当期**: ${fc.revenue.current}百万ドル
- **前期**: ${fc.revenue.previous}百万ドル  
- **前期比**: ${fc.revenue.change_percent > 0 ? '+' : ''}${fc.revenue.change_percent}%
`;
    }
    
    if (fc.operating_income && fc.operating_income.current) {
      markdown += `
### 営業利益
- **当期**: ${fc.operating_income.current}百万ドル
- **前期**: ${fc.operating_income.previous}百万ドル
- **前期比**: ${fc.operating_income.change_percent > 0 ? '+' : ''}${fc.operating_income.change_percent}%
`;
    }
    
    if (fc.ordinary_income && fc.ordinary_income.current) {
      const currentValue = fc.ordinary_income.current;
      const previousValue = fc.ordinary_income.previous;
      const changePercent = fc.ordinary_income.change_percent;
      
      markdown += `
### 経常利益
- **当期**: ${currentValue}百万ドル
- **前期**: ${previousValue < 0 ? `${previousValue}百万ドル（損失）` : `${previousValue}百万ドル`}
- **前期比**: ${changePercent}%${previousValue < 0 && currentValue > 0 ? '（損失から利益に転換）' : ''}
`;
    }
    
    if (fc.operating_cash_flow && fc.operating_cash_flow.current) {
      markdown += `
### 営業活動によるキャッシュフロー
- **当期**: ${fc.operating_cash_flow.current}百万ドル
- **前期**: ${fc.operating_cash_flow.previous}百万ドル
- **前期比**: ${fc.operating_cash_flow.change_percent > 0 ? '+' : ''}${fc.operating_cash_flow.change_percent}%
`;
    }
    
    markdown += `
---

## 📈 通期業績予想の変化`;
    
    const gc = result.summary.guidance_changes;
    if (gc.has_revision) {
      const revisionText = gc.revision_type === 'upward' ? '上方修正' : 
                         gc.revision_type === 'downward' ? '下方修正' : '修正';
      markdown += `
- **${revisionText}**: ${gc.details || 'あり'}`;
    } else {
      markdown += `
- **修正なし**: 通期業績予想に変更はありませんでした`;
    }
  }

  // 有価証券報告書の場合
  if (result.summary.business_situation) {
    markdown += `

---

## 🏢 事業状況`;
    const bs = result.summary.business_situation;
    if (bs.most_profitable_segment) {
      markdown += `
- **最利益セグメント**: ${bs.most_profitable_segment}`;
    }
  }
  
  if (result.summary.balance_sheet) {
    markdown += `

---

## 📊 貸借対照表分析`;
    const bsheet = result.summary.balance_sheet;
    if (bsheet.equity_ratio) {
      const assessment = bsheet.equity_ratio_assessment === 'excellent' ? '優良' :
                        bsheet.equity_ratio_assessment === 'good' ? '良好' :
                        bsheet.equity_ratio_assessment === 'fair' ? '普通' : '注意';
      markdown += `
- **純資産比率**: ${bsheet.equity_ratio}% (${assessment})`;
    }
  }
  
  if (result.summary.profit_loss) {
    markdown += `

---

## 📈 損益分析`;
    const pl = result.summary.profit_loss;
    markdown += `
- **売上向上**: ${pl.revenue_improved ? 'あり' : 'なし'} (${pl.revenue_change_percent || 'N/A'}%)
- **利益向上**: ${pl.profit_improved ? 'あり' : 'なし'} (${pl.profit_change_percent || 'N/A'}%)`;
  }
  
  markdown += `

---

## 🔢 主要指標`;
  
  if (result.key_metrics.revenue) {
    markdown += `
- **売上高**: ${result.key_metrics.revenue}`;
  }
  if (result.key_metrics.profit) {
    markdown += `
- **利益**: ${result.key_metrics.profit}`;
  }
  if (result.key_metrics.growth_rate) {
    markdown += `
- **成長率**: ${(result.key_metrics.growth_rate * 100).toFixed(1)}%`;
  }
  
  markdown += `

---

## 📋 技術情報
- **PDFタイプ**: ${result.processingInfo.pdfType}
- **抽出方法**: ${result.processingInfo.extractionMethod}
- **処理時間**: ${result.processingInfo.processingTime}ms
- **ページ数**: ${result.processingInfo.pageCount}ページ

---

## 📝 生データ
\`\`\`json
${JSON.stringify(result, null, 2)}
\`\`\`
`;

  return markdown;
}

if (require.main === module) {
  main();
}