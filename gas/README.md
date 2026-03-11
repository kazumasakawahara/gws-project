# GAS プロジェクト

Google Apps Script プロジェクトを管理するディレクトリ。

## ディレクトリ構成

### mail-assistant/
**GWS-Mail-Assistant v2.0** — メールからスケジュール情報を自動抽出してカレンダーに登録する GAS。

- `Code.gs` — メインスクリプト（clasp push 対象）
- `appsscript.json` — プロジェクト設定
- `.clasp.json` — clasp 連携設定（scriptId）
- `archive/` — バックアップ・デプロイ用JSON

**デプロイ方法:**
```bash
cd gas/mail-assistant
npx @google/clasp push --force
```

### calendar-sync/
**カレンダー同期スクリプト** — 複数カレンダーの予定をスプレッドシート（活動の足跡）に同期。

- `sync_script.gs` — メインスクリプト
