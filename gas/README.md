# GAS プロジェクト

Google Apps Script プロジェクトを管理するディレクトリ。各プロジェクトは clasp で Apps Script エディタと同期できます。

## 前提条件

```bash
# 初回のみ: clasp ログイン（ブラウザで Google アカウント認証）
npx @google/clasp login

# Apps Script API を有効化（初回のみ）
# https://script.google.com/home/usersettings で API をオンにする
```

## ディレクトリ構成

### mail-assistant/
**GWS-Mail-Assistant v2.0** — Gemini API でメールからスケジュール情報を自動抽出し、Google Calendar に登録する GAS。

- `Code.gs` — メインスクリプト（clasp push 対象）
- `appsscript.json` — プロジェクト設定（タイムゾーン、OAuth スコープ等）
- `.clasp.json` — clasp 連携設定（scriptId）
- `.claspignore` — push 除外設定
- `archive/` — バックアップ・デプロイ用 JSON（git 管理外）

**主な機能:**
- 1回の実行で最大5件のメールを処理（クォータ対策）
- Gemini API に `responseMimeType: "application/json"` + `responseSchema` で構造化出力を強制
- HTTP 429 に対する指数バックオフリトライ（最大3回）
- JSON パース失敗時の3段階フォールバック
- `GWS-Processed` ラベルで処理済みメールを管理（重複防止）
- トリガー: 毎日 7:00-8:00 JST

**セットアップ:**
1. `GEMINI_API_KEY` をスクリプトプロパティに設定
2. Apps Script エディタで `setup()` を実行
3. `testRun()` で動作確認

**デプロイ:**
```bash
cd gas/mail-assistant
npx @google/clasp push --force
```

### calendar-sync/
**カレンダー同期スクリプト** — 複数カレンダー（日常・交流、活動・支援、出先・旅、対話・談話）の予定をスプレッドシート「活動の足跡」に同期。

- `sync_script.gs` — メインスクリプト
- スプレッドシート上のカスタムメニュー「📅 アーカイブ同期」から手動実行

## 新しい GAS プロジェクトの追加方法

```bash
# 1. ディレクトリを作成
mkdir gas/新しいプロジェクト名

# 2. 既存の Apps Script プロジェクトを clone
cd gas/新しいプロジェクト名
npx @google/clasp clone-script スクリプトID

# または新規作成
npx @google/clasp create-script --title "プロジェクト名"
```
