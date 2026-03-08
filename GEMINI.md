# プロジェクト定義: GWS MCP Server

Google Workspace CLIをMCPプロトコル経由で利用するためのクロスプラットフォーム対応サーバーラッパーです。

## 1. アーキテクチャ
- **Node.jsラッパー** (`bin/gws-mcp`) が `gws` バイナリを `child_process.spawn` で起動
- stdoutからJSON-RPCメッセージのみをフィルタし、デバッグログはstderrにリダイレクト
- Mac / Linux / Windows で動作

## 2. 利用可能なサービス
Drive, Gmail, Calendar, Sheets, Docs, Tasks（デフォルト: all）

## 3. コマンド例
```bash
# サービスを指定して起動
node bin/gws-mcp --services drive,gmail,sheets

# 設定テンプレート生成
npm run config:gemini
npm run config:claude
```

## 4. 設定の優先順位
1. コマンドライン引数 (`--services`, `--credentials`)
2. 環境変数 (`GWS_MCP_SERVICES`, `GOOGLE_WORKSPACE_CLI_CREDENTIALS_FILE`)
3. 設定ファイル (`gws-mcp.config.json`)
4. デフォルト値

## 5. エラー対処
- **認証エラー**: `gws auth login` を実行
- **バイナリ未検出**: `npm install -g @googleworkspace/cli` を実行
