# プロジェクト定義: GWS MCP Server

Google Workspace CLIをMCPプロトコル経由で利用するためのクロスプラットフォーム対応サーバーラッパーです。

## 1. アーキテクチャ
- **Node.jsラッパー** (`bin/gws-mcp`) が `gws` バイナリを `child_process.spawn` で起動
- stdoutからJSON-RPCメッセージのみをフィルタし、デバッグログはstderrにリダイレクト
- Mac / Linux / Windows で動作

## 2. 利用可能なサービス
Gmail, Calendar, Drive, Docs, Sheets, Slides, Tasks, Keep, Chat, Meet, Forms（デフォルト: all）

## 3. プロジェクト構造
```
gws-project/
├── bin/, src/              # MCP サーバー本体
├── gas/                    # Google Apps Script プロジェクト群
│   ├── mail-assistant/     #   GWS-Mail-Assistant v2.0（clasp 連携）
│   └── calendar-sync/      #   カレンダー同期スクリプト
├── spreadsheet-configs/    # スプレッドシート設定 JSON
├── docker/, test/, config/ # Docker / テスト / 設定テンプレート
├── docs/                   # セットアップガイド等
└── legacy/                 # 旧シェルスクリプト
```

## 4. コマンド例
```bash
# サービスを指定して起動
node bin/gws-mcp --services drive,gmail,sheets

# 設定テンプレート生成
npm run config:gemini
npm run config:claude

# GAS デプロイ（clasp）
cd gas/mail-assistant && npx @google/clasp push --force
```

## 5. 認証
- `gws auth login` で暗号化された認証情報が `~/.config/gws/credentials.enc` に保存される
- MCP サーバー設定で `GOOGLE_WORKSPACE_CLI_CREDENTIALS_FILE` を省略すると、gws バイナリが暗号化認証を自動解決
- `gws auth login` 後は Claude Desktop の再起動が必要

## 6. 設定の優先順位
1. コマンドライン引数 (`--services`, `--credentials`)
2. 環境変数 (`GWS_MCP_SERVICES`, `GOOGLE_WORKSPACE_CLI_CREDENTIALS_FILE`)
3. 設定ファイル (`gws-mcp.config.json`)
4. デフォルト値

## 7. エラー対処
- **認証エラー**: `gws auth login` を実行 → Claude Desktop 再起動
- **バイナリ未検出**: `npm install -g @googleworkspace/cli` を実行
- **GAS エラー**: Apps Script エディタの実行ログを確認、または `clasp tail-logs`
