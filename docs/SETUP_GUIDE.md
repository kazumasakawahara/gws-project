# gws-mcp-server セットアップガイド

このガイドでは、プログラミングの経験がない方でも最初から最後まで設定できるように、一つひとつの手順を丁寧に説明します。

---

## 目次

1. [はじめに](#1-はじめに)
2. [Node.js のインストール](#2-nodejs-のインストール)
3. [Google Workspace CLI のインストール](#3-google-workspace-cli-のインストール)
4. [Google Cloud プロジェクトの設定（OAuth認証の準備）](#4-google-cloud-プロジェクトの設定oauth認証の準備)
5. [gws-mcp-server のセットアップ](#5-gws-mcp-server-のセットアップ)
6. [Google 認証（ログイン）](#6-google-認証ログイン)
7. [動作確認](#7-動作確認)
8. [AI エージェントとの接続設定](#8-ai-エージェントとの接続設定)
9. [使い方の例](#9-使い方の例)
10. [トラブルシューティング](#10-トラブルシューティング)
11. [よくある質問 (FAQ)](#11-よくある質問-faq)

---

## 1. はじめに

### このツールでできること

gws-mcp-server は、AI アシスタント（Claude Desktop や Gemini CLI など）から Google Workspace の各サービスを操作できるようにするツールです。

具体的には、AI に話しかけるだけで次のようなことができるようになります。

- **Google Drive** -- ファイルの一覧表示、検索、ダウンロード、アップロード
- **Gmail** -- メールの読み取り、検索、送信
- **Google Calendar** -- 予定の確認、作成、変更
- **Google Sheets** -- スプレッドシートの読み書き、作成
- **Google Docs** -- ドキュメントの読み取り、作成
- **Google Tasks** -- タスクの管理

### 必要なもの

| 項目 | 詳細 |
|------|------|
| パソコン | Mac または Windows |
| インターネット接続 | セットアップ中は常に必要です |
| Google アカウント | Gmail アドレスがあれば大丈夫です |
| AI クライアント | Claude Desktop または Gemini CLI（後ほど説明します） |

### 作業時間の目安

初めての方で **30分〜1時間** 程度です。途中で中断しても問題ありません。

---

## 2. Node.js のインストール

Node.js（ノードジェイエス）は、このツールを動かすために必要なソフトウェアです。プログラミング言語 JavaScript をパソコン上で実行するための基盤となるものです。

### Mac の場合

#### 方法 A: 公式サイトからインストール（おすすめ）

1. ブラウザで [https://nodejs.org/](https://nodejs.org/) を開きます。

2. 画面に表示される **「LTS」** と書かれた緑色のボタンをクリックして、インストーラーをダウンロードします。

   > 💡 「LTS」とは Long Term Support（長期サポート版）の略で、安定して動作するバージョンです。必ずこちらを選んでください。

3. ダウンロードされた `.pkg` ファイルをダブルクリックします。

4. インストーラーの指示に従い、「続ける」をクリックしていきます。設定はすべてそのままで大丈夫です。

5. インストールが完了したら、**ターミナル**を開きます。

   > 💡 ターミナルの開き方: `Command` + `Space` キーを同時に押して Spotlight を開き、「ターミナル」と入力して `Enter` を押します。

6. 次のコマンドを入力して `Enter` を押します。

   ```bash
   node -v
   ```

   ✅ `v18.0.0` 以上のバージョン番号が表示されれば成功です（例: `v22.14.0`）。

7. 続けて次のコマンドも確認します。

   ```bash
   npm -v
   ```

   ✅ バージョン番号が表示されれば成功です（例: `10.9.2`）。

#### 方法 B: Homebrew を使ってインストール

Homebrew（ホームブリュー）をすでに使っている方は、こちらの方法が簡単です。

1. ターミナルを開きます。

2. 次のコマンドを入力して `Enter` を押します。

   ```bash
   brew install node
   ```

3. インストールが完了したら、バージョンを確認します。

   ```bash
   node -v
   npm -v
   ```

   ✅ どちらもバージョン番号が表示されれば成功です。

---

### Windows の場合

1. ブラウザで [https://nodejs.org/](https://nodejs.org/) を開きます。

2. **「LTS」** と書かれた緑色のボタンをクリックして、Windows Installer（`.msi` ファイル）をダウンロードします。

3. ダウンロードされた `.msi` ファイルをダブルクリックしてインストーラーを起動します。

4. インストーラーの画面で以下の点に注意してください。

   - ライセンスに同意するチェックボックスにチェックを入れます。
   - インストール先はそのままで大丈夫です。

   > ⚠️ **重要**: 「Add to PATH」（PATH に追加する）のオプションが表示された場合は、必ずチェックを入れてください。これにチェックが入っていないと、コマンドが使えなくなります。

5. 「Install」をクリックしてインストールを完了させます。

6. **コマンドプロンプト**または **PowerShell** を開きます。

   > 💡 開き方: キーボードの `Windows` キーを押して、「cmd」または「PowerShell」と入力し、表示されたアプリをクリックします。

   > ⚠️ インストール直後は、必ず新しいウィンドウでコマンドプロンプトまたは PowerShell を開いてください。インストール前から開いていたウィンドウでは Node.js が認識されないことがあります。

7. 次のコマンドを入力して `Enter` を押します。

   ```
   node -v
   ```

   ✅ `v18.0.0` 以上のバージョン番号が表示されれば成功です。

8. 続けて次のコマンドも確認します。

   ```
   npm -v
   ```

   ✅ バージョン番号が表示されれば成功です。

---

## 3. Google Workspace CLI のインストール

Google Workspace CLI（コマンドラインインターフェース）は、Google のサービスをコマンドで操作するための公式ツールです。gws-mcp-server はこのツールを内部で使用します。

### Mac の場合

1. ターミナルを開きます（すでに開いていればそのまま使えます）。

2. 次のコマンドを入力して `Enter` を押します。

   ```bash
   npm install -g @googleworkspace/cli
   ```

   > 💡 `npm install -g` は「このツールをパソコン全体で使えるようにインストールする」という意味です。

3. インストールが完了するまで数分かかることがあります。エラーメッセージが出ずに終了すれば成功です。

4. 次のコマンドでインストールを確認します。

   ```bash
   gws --version
   ```

   ✅ バージョン番号が表示されれば成功です。

### Windows の場合

1. コマンドプロンプトまたは PowerShell を開きます。

2. 次のコマンドを入力して `Enter` を押します。

   ```
   npm install -g @googleworkspace/cli
   ```

3. インストールが完了するまで数分かかることがあります。

4. 次のコマンドでインストールを確認します。

   ```
   gws --version
   ```

   ✅ バージョン番号が表示されれば成功です。

   > ⚠️ 「gws は認識されていません」というエラーが出た場合は、コマンドプロンプトや PowerShell を一度閉じて、新しく開き直してからもう一度試してください。

---

## 4. Google Cloud プロジェクトの設定（OAuth認証の準備）

この章が最も複雑な部分ですが、画面の操作を一つずつ説明しますので、順番通りに進めてください。

ここでは、Google のサーバーに「このアプリがあなたのデータにアクセスしてもいいですか？」と確認してもらうための設定（OAuth認証）を行います。

### 4-1. Google Cloud Console にアクセスする

1. ブラウザで [https://console.cloud.google.com/](https://console.cloud.google.com/) を開きます。

2. Google アカウントでログインします（普段使っている Gmail のアカウントで大丈夫です）。

3. 初めてアクセスする場合は、利用規約への同意を求められることがあります。内容を確認して同意してください。

### 4-2. 新しいプロジェクトを作成する

Google Cloud Console では「プロジェクト」という単位で設定を管理します。gws-mcp-server 用のプロジェクトを新しく作りましょう。

1. 画面上部のプロジェクト選択ドロップダウン（「My First Project」などと表示されている部分）をクリックします。

2. 表示されたダイアログの右上にある **「新しいプロジェクト」** をクリックします。

3. プロジェクト名を入力します。好きな名前で大丈夫ですが、分かりやすい名前にしましょう。

   例: `gws-mcp-server`

4. 「作成」ボタンをクリックします。

5. プロジェクトの作成が完了するまで数秒待ちます。画面上部の通知で「プロジェクト "gws-mcp-server" が作成されました」と表示されたら成功です。

6. 作成したプロジェクトが選択されていることを確認してください（画面上部のプロジェクト名が、今作成したプロジェクト名になっているか確認）。

### 4-3. API を有効化する

gws-mcp-server が Google の各サービスにアクセスできるように、必要な API（アプリケーション・プログラミング・インターフェース。外部からサービスを操作するための窓口のようなもの）を有効化します。

以下の 6 つの API を有効化する必要があります。

1. 画面左側のナビゲーションメニューから **「APIとサービス」** > **「ライブラリ」** をクリックします。

   > 💡 ナビゲーションメニューが表示されていない場合は、画面左上のハンバーガーメニュー（三本線のアイコン）をクリックして開いてください。

2. 検索ボックスに `Google Drive API` と入力して検索します。

3. 検索結果に表示された **「Google Drive API」** をクリックします。

4. **「有効にする」** ボタンをクリックします。

5. 同じ手順を繰り返して、以下の API もすべて有効化します。

   | 番号 | API 名 | 検索キーワード |
   |------|--------|---------------|
   | 1 | Google Drive API | `Google Drive API` |
   | 2 | Gmail API | `Gmail API` |
   | 3 | Google Sheets API | `Google Sheets API` |
   | 4 | Google Calendar API | `Google Calendar API` |
   | 5 | Google Docs API | `Google Docs API` |
   | 6 | Google Tasks API | `Tasks API` |

   > 💡 使う予定のないサービスがあれば、そのAPIは有効化しなくても大丈夫です。ただし、有効化しなかったサービスは AI から操作できません。

   ✅ 6 つの API をすべて有効化したら、この手順は完了です。

### 4-4. OAuth 同意画面を設定する

OAuth（オーオース）同意画面とは、ユーザーに「このアプリがあなたのデータにアクセスしてもいいですか？」と確認するための画面のことです。

1. 画面左側のナビゲーションメニューから **「APIとサービス」** > **「OAuth 同意画面」** をクリックします。

2. 「User Type」（ユーザーの種類）を選択します。

   - **Google Workspace（会社や学校のアカウント）をお使いの場合**: 「内部」を選択できます。
   - **個人の Gmail アカウントの場合**: **「外部」** を選択してください。

3. **「作成」** をクリックします。

4. アプリ情報を入力します。

   | 項目 | 入力する内容 |
   |------|-------------|
   | アプリ名 | `gws-mcp-server`（好きな名前で大丈夫です） |
   | ユーザー サポートメール | 自分のメールアドレスを選択 |
   | デベロッパーの連絡先情報 | 自分のメールアドレスを入力 |

   > 💡 その他の項目（アプリのロゴ、アプリのホームページなど）は空欄のままで大丈夫です。

5. **「保存して次へ」** をクリックします。

6. 「スコープ」の画面が表示されます。**「スコープを追加または削除」** をクリックします。

7. フィルターで以下のスコープを検索して、チェックを入れます。

   | スコープ | 説明 |
   |---------|------|
   | `https://www.googleapis.com/auth/drive` | Google Drive のファイルへのアクセス |
   | `https://www.googleapis.com/auth/gmail.modify` | Gmail の読み書き |
   | `https://www.googleapis.com/auth/calendar` | Google Calendar の読み書き |
   | `https://www.googleapis.com/auth/spreadsheets` | Google Sheets の読み書き |
   | `https://www.googleapis.com/auth/documents` | Google Docs の読み書き |
   | `https://www.googleapis.com/auth/tasks` | Google Tasks の読み書き |

   > 💡 スコープが多くて見つけにくい場合は、検索ボックスに API 名（例: `drive`）を入力して絞り込んでください。

8. **「更新」** をクリックしてスコープの追加を確定します。

9. **「保存して次へ」** をクリックします。

10. 「テストユーザー」の画面が表示されます。**「+ ADD USERS」**（ユーザーを追加）をクリックします。

11. 自分の Google メールアドレスを入力して **「追加」** をクリックします。

    > ⚠️ **重要**: 「外部」を選択した場合、ここでテストユーザーとして追加したアカウントだけがこのアプリを使えます。自分のメールアドレスを必ず追加してください。

12. **「保存して次へ」** をクリックします。

13. 内容を確認して **「ダッシュボードに戻る」** をクリックします。

### 4-5. OAuth 2.0 認証情報を作成する

1. 画面左側のナビゲーションメニューから **「APIとサービス」** > **「認証情報」** をクリックします。

2. 画面上部の **「+ 認証情報を作成」** をクリックします。

3. ドロップダウンから **「OAuth クライアント ID」** を選択します。

4. 「アプリケーションの種類」で **「デスクトップ アプリ」** を選択します。

5. 名前を入力します（例: `gws-mcp-desktop`）。そのままでも大丈夫です。

6. **「作成」** をクリックします。

7. 「OAuth クライアントを作成しました」というダイアログが表示されます。

8. **「JSON をダウンロード」** をクリックして、認証情報ファイルをダウンロードします。

   > ⚠️ **重要**: このファイルはあなたの Google アカウントへのアクセスに関わる大切なファイルです。他人と共有したり、インターネット上にアップロードしたりしないでください。

9. ダウンロードしたファイルを安全な場所に保存します。

   **Mac の場合:**
   ```bash
   mkdir -p ~/.config/gws
   mv ~/Downloads/client_secret_*.json ~/.config/gws/client_secret.json
   ```

   **Windows の場合:**
   ```
   mkdir %APPDATA%\gws
   move %USERPROFILE%\Downloads\client_secret_*.json %APPDATA%\gws\client_secret.json
   ```

   > 💡 ファイル名は `client_secret_xxxx.json` のような形式でダウンロードされます。`xxxx` の部分はプロジェクトごとに異なります。

✅ ここまで完了すれば、Google Cloud の設定は完了です。

---

## 5. gws-mcp-server のセットアップ

### 方法 A: Git を使ってダウンロードする（おすすめ）

Git（ギット）はソースコードを管理するためのツールです。すでにインストールされていることが多いです。

1. ターミナル（Mac）またはコマンドプロンプト（Windows）を開きます。

2. gws-mcp-server をダウンロードしたい場所に移動します。

   **Mac の場合:**
   ```bash
   cd ~
   ```

   **Windows の場合:**
   ```
   cd %USERPROFILE%
   ```

3. 次のコマンドを入力して `Enter` を押します。

   ```bash
   git clone https://github.com/kazumasakawahara/gws-project.git
   ```

   > 💡 `git` コマンドが見つからないというエラーが出た場合は、「方法 B」を試してください。

4. ダウンロードしたフォルダに移動します。

   ```bash
   cd gws-project
   ```

### 方法 B: ZIP ファイルでダウンロードする

Git がインストールされていない場合は、この方法を使います。

1. ブラウザで gws-mcp-server のリポジトリ（ソースコードの保管場所）のページを開きます。

2. 緑色の **「Code」** ボタンをクリックします。

3. **「Download ZIP」** をクリックしてダウンロードします。

4. ダウンロードされた ZIP ファイルを展開（解凍）します。

5. 展開されたフォルダをターミナルまたはコマンドプロンプトで開きます。

### 実行権限の設定（Mac のみ）

Mac の場合は、実行ファイルに権限を付与する必要があります。

```bash
chmod +x bin/gws-mcp
```

> 💡 Windows の場合はこの手順は不要です。

---

## 6. Google 認証（ログイン）

gws-mcp-server が Google のサービスにアクセスするために、自分の Google アカウントでログインします。

1. ターミナル（Mac）またはコマンドプロンプト（Windows）で次のコマンドを入力します。

   ```bash
   gws auth login
   ```

   > 💡 特定のサービスだけにアクセスを限定したい場合は、次のようにサービスを指定できます。
   > ```bash
   > gws auth login -s drive,gmail,sheets
   > ```

2. コマンドを実行すると、ブラウザが自動的に開きます。

3. Google のログイン画面が表示されるので、使用する Google アカウントでログインします。

4. 「このアプリは Google で確認されていません」という警告が表示される場合があります。

   > 💡 これは自分で作成したアプリのため表示される正常な警告です。以下の手順で進めてください。

   - **「詳細」**（または「Advanced」）をクリックします。
   - **「gws-mcp-server（安全でない）に移動」** をクリックします。

5. 要求されるアクセス権限の一覧が表示されます。内容を確認して **「許可」** をクリックします。

6. 「認証が完了しました」というメッセージが表示されれば成功です。ブラウザの画面は閉じて大丈夫です。

7. ターミナルに戻ると、認証が成功した旨のメッセージが表示されています。

   ✅ 認証情報はパソコンのローカルに保存されます。

   保存先:
   - **Mac**: `~/.config/gws/credentials.enc`（暗号化済み）
   - **Windows**: `%APPDATA%\gws\credentials.enc`（暗号化済み）

   > 💡 最近のバージョンの Google Workspace CLI では、認証情報は `credentials.enc` として暗号化保存されます（暗号化キーは `.encryption_key`）。平文の `credentials.json` は生成されません。

---

## 7. 動作確認

認証が完了したら、gws-mcp-server が正しく動作するか確認しましょう。

1. gws-project フォルダに移動していることを確認します。

   **Mac の場合:**
   ```bash
   cd ~/gws-project
   ```

   **Windows の場合:**
   ```
   cd %USERPROFILE%\gws-project
   ```

2. 次のコマンドを入力して `Enter` を押します。

   **Mac の場合:**
   ```bash
   node bin/gws-mcp --services drive
   ```

   **Windows の場合:**
   ```
   node bin\gws-mcp --services drive
   ```

3. 以下のようなメッセージが表示されれば成功です。

   ```
   [INFO] Starting gws-mcp-server...
   [INFO] Binary: /path/to/gws
   ```

   ✅ エラーメッセージが表示されず、サーバーが起動した状態になれば正常に動作しています。

4. 動作確認が終わったら、`Ctrl` + `C` キーを同時に押してサーバーを停止します。

   > ⚠️ エラーが表示された場合は、[10. トラブルシューティング](#10-トラブルシューティング) を参照してください。

---

## 8. AI エージェントとの接続設定

gws-mcp-server を AI エージェントと接続するための設定を行います。使用する AI エージェントに合わせて、該当するセクションの手順に従ってください。

### Claude Desktop の場合

#### 8-1. 設定ファイルの場所を確認する

Claude Desktop の設定ファイル（`claude_desktop_config.json`）の場所は OS によって異なります。

| OS | ファイルパス |
|----|------------|
| Mac | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Windows | `%APPDATA%\Claude\claude_desktop_config.json` |

#### 8-2. 設定テンプレートを生成する（おすすめ）

gws-project フォルダで次のコマンドを実行すると、正しいパスが入った設定テンプレートが表示されます。

```bash
npm run config:claude
```

表示された JSON の内容をコピーしてください。

#### 8-3. 設定ファイルを編集する

1. 設定ファイルをテキストエディタで開きます。

   **Mac の場合:**
   ```bash
   open ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

   > 💡 ファイルが存在しない場合は、新しく作成してください。
   > ```bash
   > mkdir -p ~/Library/Application\ Support/Claude
   > touch ~/Library/Application\ Support/Claude/claude_desktop_config.json
   > ```

   **Windows の場合:**
   ```
   notepad %APPDATA%\Claude\claude_desktop_config.json
   ```

   > 💡 ファイルが存在しない場合は、「新しいファイルを作成しますか？」と聞かれるので「はい」を選びます。

2. 以下の JSON を設定ファイルに書き込みます。

   > ⚠️ `/path/to/gws-project` の部分は、実際に gws-project を配置したフォルダのパスに置き換えてください。

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

   **Mac でホームフォルダに配置した場合の例:**
   ```json
   {
     "mcpServers": {
       "gws": {
         "command": "node",
         "args": ["/Users/あなたのユーザー名/gws-project/bin/gws-mcp"]
       }
     }
   }
   ```

   **Windows の場合の例:**
   ```json
   {
     "mcpServers": {
       "gws": {
         "command": "node",
         "args": ["C:\\Users\\あなたのユーザー名\\gws-project\\bin\\gws-mcp"]
       }
     }
   }
   ```

   > ⚠️ **すでに他の MCP サーバーが設定されている場合**: `mcpServers` の中に `gws` の設定を追加してください。ファイル全体を上書きしないように注意してください。
   >
   > 追加する場合の例:
   > ```json
   > {
   >   "mcpServers": {
   >     "既存のサーバー名": {
   >       "command": "...",
   >       "args": ["..."]
   >     },
   >     "gws": {
   >       "command": "node",
   >       "args": ["/path/to/gws-project/bin/gws-mcp"]
   >     }
   >   }
   > }
   > ```

3. ファイルを保存します。

#### 8-4. Claude Desktop を再起動する

1. Claude Desktop を完全に終了します。

   - **Mac**: メニューバーの「Claude」 > 「Quit Claude」をクリックします。
   - **Windows**: タスクトレイの Claude アイコンを右クリックして「終了」を選びます。

2. Claude Desktop を再度起動します。

3. 画面下部の入力欄の付近に、MCP サーバーの接続を示すアイコン（ハンマーのマーク）が表示されていれば接続成功です。

   ✅ アイコンをクリックすると、「gws」が接続済みサーバーの一覧に表示されていることを確認できます。

---

### Gemini CLI の場合

#### 8-1. 設定テンプレートを生成する（おすすめ）

gws-project フォルダで次のコマンドを実行すると、正しいパスが入った設定テンプレートが表示されます。

```bash
npm run config:gemini
```

表示された YAML の内容をコピーしてください。

#### 8-2. 設定ファイルを編集する

1. Gemini CLI の設定ファイルを開きます（または新しく作成します）。

   **Mac の場合:**
   ```bash
   mkdir -p ~/.gemini
   open ~/.gemini/settings.json
   ```

   > 💡 ファイルが存在しない場合は、次のコマンドで作成できます。
   > ```bash
   > touch ~/.gemini/settings.json
   > ```

   **Windows の場合:**
   ```
   notepad %USERPROFILE%\.gemini\settings.json
   ```

2. 以下の JSON を設定ファイルに書き込みます。

   > ⚠️ `/path/to/gws-project` の部分は、実際に gws-project を配置したフォルダのパスに置き換えてください。

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

   または、プロジェクトのルートに `config.yaml` として YAML 形式で設定することもできます。

   ```yaml
   mcpServers:
     gws:
       command: "node"
       args: ["/path/to/gws-project/bin/gws-mcp"]
   ```

3. ファイルを保存します。

#### 8-3. 接続を確認する

1. Gemini CLI を起動（または再起動）します。

2. 次のコマンドで MCP サーバーの接続状況を確認します。

   ```
   /mcp
   ```

   ✅ `gws` が接続済みのサーバーとして表示されていれば成功です。

---

## 9. 使い方の例

セットアップが完了したら、AI エージェントに話しかけるだけで Google Workspace を操作できます。以下は質問の例です。

### Google Drive

```
Google Driveのファイル一覧を表示して
```

```
Google Driveで「議事録」という名前のファイルを検索して
```

### Gmail

```
最新のメールを5件読んで
```

```
未読メールの件数を教えて
```

### Google Calendar

```
明日の予定を確認して
```

```
来週の月曜日の14時から15時に「チームミーティング」という予定を作成して
```

### Google Sheets

```
新しいスプレッドシートを「売上管理」という名前で作成して
```

```
「売上管理」のスプレッドシートの内容を読み取って
```

### Google Docs

```
Google Docsで新しいドキュメントを作成して
```

### Google Tasks

```
タスク一覧を表示して
```

```
「報告書の作成」というタスクを追加して
```

> 💡 自然な日本語で話しかけるだけで、AI が適切な操作を判断して実行してくれます。操作の前に AI が確認を求めることもありますので、内容を確認してから承認してください。

---

## 10. トラブルシューティング

問題が発生した場合は、以下の一般的な解決方法を試してください。

### 「gws: command not found」または「gws は認識されていません」と表示される

**原因**: Google Workspace CLI がインストールされていないか、パスが通っていません。

**解決方法:**

1. Google Workspace CLI をインストール（または再インストール）します。
   ```bash
   npm install -g @googleworkspace/cli
   ```

2. **Windows の場合**: コマンドプロンプトまたは PowerShell を一度閉じて、新しく開き直してからもう一度試してください。

3. それでも解決しない場合は、Node.js のインストールからやり直してください。

---

### 「Credentials file not found」（認証ファイルが見つからない）と表示される

**原因**: Google アカウントの認証がまだ完了していません。

**解決方法:**

```bash
gws auth login
```

このコマンドを実行して、[6. Google 認証（ログイン）](#6-google-認証ログイン) の手順に従ってください。

---

### 「Node.js 18+ required」と表示される

**原因**: インストールされている Node.js のバージョンが古すぎます。

**解決方法:**

1. 現在のバージョンを確認します。
   ```bash
   node -v
   ```

2. [https://nodejs.org/](https://nodejs.org/) から最新の LTS 版をダウンロードして、再インストールしてください。

---

### ブラウザで「このアプリはブロックされています」と表示される

**原因**: OAuth 同意画面でテストユーザーに自分のアカウントを追加していません。

**解決方法:**

1. [Google Cloud Console](https://console.cloud.google.com/) を開きます。
2. **「APIとサービス」** > **「OAuth 同意画面」** に移動します。
3. **「テストユーザー」** セクションで、自分の Google メールアドレスが追加されていることを確認します。
4. 追加されていない場合は、**「+ ADD USERS」** をクリックして追加します。

---

### Claude Desktop で MCP サーバーが表示されない

**原因**: 設定ファイルの JSON に誤りがあるか、ファイルの場所が間違っています。

**解決方法:**

1. 設定ファイルのパスが正しいか確認します。

   - **Mac**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

2. JSON の書式が正しいか確認します。特に以下の点に注意してください。
   - カンマ（`,`）の位置が正しいか
   - 括弧（`{}`、`[]`）が正しく閉じているか
   - パスの区切り文字が正しいか（Windows の場合は `\\` を使う）

3. `args` に指定したパスにファイルが実際に存在するか確認します。

   **Mac の場合:**
   ```bash
   ls -la /path/to/gws-project/bin/gws-mcp
   ```

   **Windows の場合:**
   ```
   dir C:\Users\あなたのユーザー名\gws-project\bin\gws-mcp
   ```

4. Claude Desktop を完全に終了してから再起動します。

---

### 「Permission denied」（権限がありません）と表示される（Mac）

**原因**: 実行ファイルに実行権限が付与されていません。

**解決方法:**

```bash
chmod +x ~/gws-project/bin/gws-mcp
```

---

### デバッグモードで詳細を確認する

上記の方法で解決しない場合は、デバッグモードでサーバーを起動すると、詳しいエラー情報を確認できます。

```bash
node bin/gws-mcp --log-level debug --services drive
```

表示されたログの内容を参考に、問題を特定してください。

---

## 11. よくある質問 (FAQ)

### Q. 自分のデータは安全ですか？

**A.** はい、安全です。gws-mcp-server は以下の仕組みで動作しています。

- 認証情報（credentials）はあなたのパソコンのローカルに暗号化された状態で保存されます。
- 第三者のサーバーにデータが送信されることはありません。
- Google の公式 API を通じてデータにアクセスするため、Google のセキュリティ基準が適用されます。
- AI エージェント（Claude や Gemini）とのやり取りは、各サービスのプライバシーポリシーに従います。

---

### Q. Google Workspace アカウント（会社や学校のアカウント）でも使えますか？

**A.** はい、使えます。ただし、組織の管理者が API の使用を制限している場合は使えないことがあります。その場合は、組織の IT 管理者にお問い合わせください。個人の Gmail アカウントであれば、制限なく使用できます。

---

### Q. 特定のサービスだけにアクセスを制限できますか？

**A.** はい、できます。gws-mcp-server を起動する際に `--services` オプションでサービスを指定できます。

```bash
node bin/gws-mcp --services drive,gmail
```

この例では、Google Drive と Gmail にだけアクセスを許可し、Calendar や Sheets などへのアクセスを制限しています。

Claude Desktop や Gemini CLI の設定ファイルでも、環境変数を使って制限できます。

**Claude Desktop の例:**
```json
{
  "mcpServers": {
    "gws": {
      "command": "node",
      "args": ["/path/to/gws-project/bin/gws-mcp"],
      "env": {
        "GWS_MCP_SERVICES": "drive,gmail"
      }
    }
  }
}
```

---

### Q. gws-mcp-server を最新バージョンに更新するにはどうすればいいですか？

**A.** Git でダウンロードした場合は、gws-project フォルダで次のコマンドを実行します。

```bash
cd ~/gws-project
git pull
```

ZIP でダウンロードした場合は、最新版を再度ダウンロードしてフォルダを置き換えてください。

Google Workspace CLI も定期的に更新することをおすすめします。

```bash
npm update -g @googleworkspace/cli
```

---

### Q. 複数の Google アカウントを切り替えて使えますか？

**A.** 認証情報は1つのアカウント分が保存されます。別のアカウントに切り替えたい場合は、再度ログインコマンドを実行してください。

```bash
gws auth login
```

---

### Q. AI がデータを勝手に変更してしまうことはありませんか？

**A.** AI エージェントは、あなたの指示に基づいて操作を行います。重要な操作（ファイルの削除やメールの送信など）を行う前には、AI が確認を求めることが多いです。ただし、念のため大切なデータのバックアップを取っておくことをおすすめします。

---

### Q. エラーが解決できない場合はどうすればいいですか？

**A.** 以下の情報を添えて、プロジェクトの Issue（問題報告）ページで質問してください。

1. 使用している OS（Mac / Windows）とそのバージョン
2. Node.js のバージョン（`node -v` の出力）
3. エラーメッセージの全文
4. デバッグモード（`--log-level debug`）で表示されたログ

---

おつかれさまでした。このガイドに沿ってセットアップが完了すれば、AI アシスタントから Google Workspace のサービスを自由に操作できるようになります。
