# Local PDF Directory

このディレクトリは、IR資料のPDFファイルをローカルに保存してテスト・分析に使用するためのものです。

## 📁 ディレクトリ構造（推奨）

```
local_pdf/
├── US/                           # 米国企業
│   ├── PGY/                      # 銘柄コード別フォルダ
│   │   ├── 2025Q2_earnings.pdf
│   │   ├── 2025Q1_earnings.pdf
│   │   └── 2024_annual.pdf
│   ├── AAPL/
│   │   ├── 2025Q2_earnings.pdf
│   │   └── 2024_10K.pdf
│   └── NVAX/
│       └── 2025Q1_earnings.pdf
├── JP/                           # 日本企業
│   ├── 6758/                     # ソニー
│   │   ├── 2025Q1_earnings.pdf
│   │   └── 2024_annual.pdf
│   └── 7203/                     # トヨタ
│       └── 2025Q1_earnings.pdf
└── README.md                     # このファイル
```

## 📋 ファイル名規約

### 基本フォーマット
```
{年}{期間}_{文書タイプ}.pdf
```

### 文書タイプ
- `earnings` - 決算説明資料
- `annual` - 年次報告書
- `quarterly` - 四半期報告書  
- `10K` - 米国10-K報告書
- `10Q` - 米国10-Q報告書
- `presentation` - IR説明資料

### 期間表記
- `Q1`, `Q2`, `Q3`, `Q4` - 四半期
- `H1`, `H2` - 半期
- 年次報告書は期間なし

### ファイル名例
```
2025Q2_earnings.pdf     # 2025年第2四半期決算資料
2024_annual.pdf         # 2024年年次報告書
2025Q1_10Q.pdf         # 2025年Q1の10-Q報告書
2025H1_presentation.pdf # 2025年上半期説明資料
```

## 📂 使用方法

### 1. PDFファイルの配置
1. 企業の国（US/JP）を判定
2. 銘柄コード（PGY、6758等）でディレクトリ作成
3. 規約に従ったファイル名でPDF配置

### 2. IR要約機能での自動検索
`summarize_ir_information` エンドポイント使用時、以下の順序で自動検索：
1. `local_pdf/{国}/{銘柄コード}/` ディレクトリ内のPDFファイル
2. 事前定義されたリモートURL（テストケース）

### 3. 手動でのPDF処理
```javascript
// MCPエンドポイント: extract_local_pdf
{
  "symbol": "PGY",
  "filePath": "/Users/ichikawamaki/stock-mcp-server/local_pdf/US/PGY/2025Q2_earnings.pdf",
  "documentType": "earnings_presentation",
  "country": "US"
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