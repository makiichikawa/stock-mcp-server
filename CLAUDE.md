# Claude Code プロジェクト設定

## コミットメッセージ規約
- **すべてのコミットメッセージは日本語で記述すること**
- 英語でのコミットメッセージは禁止
- 簡潔で分かりやすい日本語を使用する

### コミットメッセージ例
```
✅ 良い例:
- "業績予想機能の実装"
- "バグ修正: 株価取得APIのエラーハンドリング"
- "テスト: NVAXの四半期予想データ検証"

❌ 悪い例:
- "Add earnings forecast feature"
- "Fix bug in stock price API"
- "Test NVAX quarterly data"
```

## プロジェクト構造
```
stock-mcp-server/
├── src/                 # メインソースコード
├── dist/                # ビルド済みファイル（gitignore）
├── tests/               # テストファイル（gitignore）
├── debug/               # デバッグファイル（gitignore）
├── node_modules/        # 依存関係（gitignore）
└── CLAUDE.md           # このファイル
```

## 開発ガイドライン

### 1. ファイル整理
- テスト関連ファイル: `tests/` ディレクトリ
- デバッグファイル: `debug/` ディレクトリ  
- 本番コード: `src/` ディレクトリ

### 2. コーディング規約
- TypeScript を使用
- Yahoo Finance API + SEC API の組み合わせ
- エラーハンドリングを必ず実装
- 日本語コメントを推奨

### 3. ビルド・テスト
- ビルドコマンド: `npm run build`
- 開発モード: `npm run dev`
- TypeScriptコンパイルエラーを必ず解決してからコミット

## API エンドポイント
- `get_stock_price` - 株価取得
- `get_financial_data` - 財務データ取得
- `analyze_profitability_turnaround` - 黒字転換分析
- `get_quarterly_earnings_forecast` - 四半期利益予想
- `get_annual_earnings_forecast` - 年次利益予想
- `get_earnings_guidance` - 経営ガイダンス取得

## 注意事項
- SEC API は rate limit (10 requests/second) に注意
- Yahoo Finance API の利用規約を遵守
- 機密情報やAPIキーはコミットしない