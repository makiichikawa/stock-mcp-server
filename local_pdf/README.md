# Local PDF Directory

このディレクトリは、IR資料のPDFファイルをローカルに保存してテスト・分析に使用するためのものです。

## 📂 使用方法

### 1. PDFファイルの配置
企業のIR資料PDFファイルをこのディレクトリに配置してください。

### 2. ファイル命名規則（推奨）
```
{企業コード}_{資料種別}_{期間}.pdf

例:
- 6758_quarterly_25q1.pdf     (ソニー 2025年3月期第1四半期)
- 7203_annual_2024.pdf        (トヨタ 2024年度年次報告書)
- 9984_presentation_25q2.pdf  (ソフトバンクグループ)
```

### 3. MCP経由での処理
```javascript
// MCPエンドポイント: extract_local_pdf
{
  "symbol": "6758",
  "filePath": "/Users/ichikawamaki/stock-mcp-server/local_pdf/6758_quarterly_25q1.pdf",
  "documentType": "quarterly_report",
  "country": "JP"
}
```

## 🔧 対応ファイル形式
- PDF (.pdf) - メイン対応
- 将来的にWord (.docx)、Excel (.xlsx)も対応予定

## 📋 注意事項
- ファイルサイズ制限: 50MB以下
- 著作権に注意してください
- 機密情報を含むファイルは適切に管理してください

## 🎯 テスト用サンプル
ソニーのIR資料を手動でダウンロードして配置すると、テストが実行できます。