# gws-mcp-server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Google Workspace CLI を MCP (Model Context Protocol) サーバーとして公開するクロスプラットフォーム対応ラッパー。

Claude Desktop、Gemini CLI などの AI エージェントから Google Workspace (Drive, Gmail, Calendar, Sheets, Docs, Tasks, Keep, Chat, Meet, Forms) を操作できます。

---

### **[>>> 初めての方はこちら：ゼロからの導入ガイド (日本語) <<<](docs/SETUP_GUIDE.md)**

---

## セットアップ

### 前提条件

- Node.js 18+
- `@googleworkspace/cli` がインストール済み

```bash
npm install -g @googleworkspace/cli
gws auth login
```

### macOS / Linux

```bash
git clone https://github.com/kazumasakawahara/gws-project.git
cd gws-project
chmod +x bin/gws-mcp

# 動作確認
node bin/gws-mcp --services drive
```

### Windows

```powershell
git clone https://github.com/kazumasakawahara/gws-project.git
cd gws-project

# 動作確認
node bin\gws-mcp --services drive
```

## MCP クライアント設定

### Claude Desktop

`~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) または `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "gws": {
      "command": "node",
      "args": [
        "/path/to/gws-project/bin/gws-mcp",
        "--services",
        "gmail,calendar,drive,docs,sheets,slides,tasks,keep,chat,meet,forms"
      ]
    }
  }
}
```

> **注意**: `env` で `GOOGLE_WORKSPACE_CLI_CREDENTIALS_FILE` を指定すると、gws バイナリの暗号化認証情報の自動解決が無効になります。通常は `env` を省略してください。

### Gemini CLI

`~/.gemini/settings.json`:

```json
{
  "mcpServers": {
    "gws": {
      "command": "node",
      "args": ["/path/to/gws-project/bin/gws-mcp"]
    }
  }
}
```

### 設定テンプレート生成

```bash
npm run config:gemini   # Gemini CLI 用
npm run config:claude   # Claude Desktop 用
```

## オプション

| フラグ | 環境変数 | デフォルト | 説明 |
|--------|----------|-----------|------|
| `--services`, `-s` | `GWS_MCP_SERVICES` | `all` | 公開するサービス (例: `drive,gmail`) |
| `--credentials` | `GOOGLE_WORKSPACE_CLI_CREDENTIALS_FILE` | 省略推奨 | 認証ファイルパス（省略時は gws バイナリが暗号化認証を自動解決） |
| `--log-level` | `GWS_MCP_LOG_LEVEL` | `info` | ログレベル (`error`, `warn`, `info`, `debug`) |

## 認証情報について

`gws auth login` を実行すると、認証情報は暗号化されてローカルに保存されます。

```
~/.config/gws/
├── credentials.enc      # 暗号化済み認証情報
├── .encryption_key      # 暗号化キー
├── token_cache.json     # トークンキャッシュ（暗号化済み）
└── client_secret.json   # OAuthクライアント設定
```

gws-mcp-server は `--credentials` を省略すると、gws バイナリが自動的にこれらの暗号化ファイルを解決します。`GOOGLE_WORKSPACE_CLI_CREDENTIALS_FILE` 環境変数を明示的に設定すると、指定されたパスの平文ファイルを参照しようとするため、暗号化認証との不整合が起きることがあります。

## プロジェクト構造

```
gws-project/
├── bin/gws-mcp              # エントリポイント
├── src/
│   ├── gws-mcp-server.js    # MCP ブリッジ (spawn + stdout フィルタ)
│   ├── binary-resolver.js   # gws バイナリ自動検出
│   ├── config.js            # 設定管理
│   ├── config-template.js   # 設定テンプレート生成
│   └── logger.js            # stderr ロガー
├── gas/                     # Google Apps Script プロジェクト群
│   ├── mail-assistant/      #   GWS-Mail-Assistant v2.0（clasp 連携）
│   └── calendar-sync/       #   カレンダー同期スクリプト
├── spreadsheet-configs/     # スプレッドシート設定 JSON
├── docker/                  # Docker 版 (オプション)
├── test/                    # テスト
├── config/                  # 設定テンプレート
├── docs/                    # ドキュメント
└── legacy/                  # 旧シェルスクリプト (参照用)
```

## GAS プロジェクト

`gas/` ディレクトリには Google Apps Script プロジェクトを格納しています。詳細は [gas/README.md](gas/README.md) を参照してください。

| プロジェクト | 説明 |
|---|---|
| [mail-assistant](gas/mail-assistant/) | メールから Gemini API でスケジュール情報を抽出し、カレンダーに自動登録 |
| [calendar-sync](gas/calendar-sync/) | 複数カレンダーの予定をスプレッドシートに同期 |

### GAS のデプロイ（clasp）

```bash
# 初回のみ: clasp ログイン
npx @google/clasp login

# mail-assistant をデプロイ
cd gas/mail-assistant
npx @google/clasp push --force
```

## テスト

```bash
npm test
```

## トラブルシューティング

### gws binary not found

```bash
npm install -g @googleworkspace/cli
```

### 認証エラー

```bash
gws auth login
```

> **注意**: `gws auth login` 後は Claude Desktop を完全に終了・再起動してください。MCP サーバーは Claude Desktop 起動時に読み込まれるため、再起動しないと新しい認証情報が反映されません。

### デバッグ

```bash
node bin/gws-mcp --log-level debug --services drive
```

## ライセンス

MIT
