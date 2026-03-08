# gws-mcp-server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Google Workspace CLI を MCP (Model Context Protocol) サーバーとして公開するクロスプラットフォーム対応ラッパー。

Claude Desktop、Gemini CLI などの AI エージェントから Google Workspace (Drive, Gmail, Calendar, Sheets, Docs, Tasks) を操作できます。

> **初めての方へ**: プログラミング経験がなくても大丈夫です。[セットアップガイド (日本語)](docs/SETUP_GUIDE.md) に沿って進めてください。

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
      "args": ["/path/to/gws-project/bin/gws-mcp"]
    }
  }
}
```

### Gemini CLI

`config.yaml`:

```yaml
mcpServers:
  gws:
    command: "node"
    args: ["/path/to/gws-project/bin/gws-mcp"]
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
| `--credentials` | `GOOGLE_WORKSPACE_CLI_CREDENTIALS_FILE` | OS既定パス | 認証ファイルパス |
| `--log-level` | `GWS_MCP_LOG_LEVEL` | `info` | ログレベル (`error`, `warn`, `info`, `debug`) |

## 設定ファイル

`gws-mcp.config.json` をプロジェクトルートまたは `~/.config/gws-mcp/config.json` に配置:

```json
{
  "services": "drive,gmail,calendar,sheets,docs,tasks",
  "logLevel": "info"
}
```

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
├── docker/                  # Docker 版 (オプション)
├── test/                    # テスト
├── config/                  # 設定テンプレート
└── legacy/                  # 旧シェルスクリプト (参照用)
```

## テスト

```bash
npm test
```

## トラブルシューティング

### gws binary not found

```bash
npm install -g @googleworkspace/cli
# または
export GWS_BINARY_PATH=/path/to/gws
```

### 認証エラー

```bash
gws auth login
# サービスを限定する場合:
gws auth login -s drive,gmail,sheets
```

### デバッグ

```bash
node bin/gws-mcp --log-level debug --services drive
```
