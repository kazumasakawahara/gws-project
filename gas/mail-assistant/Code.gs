/**
 * =========================================================
 * GWS-Mail-Assistant v2.0 — 改善版
 * =========================================================
 *
 * 【修正内容 (v1.x からの変更点)】
 * 1. メール取得数を制限（1回の実行で最大5件）
 * 2. Gemini API に response_mime_type: "application/json" を指定
 *    → 「JSON形式での出力」等のメタテキスト返却を防止
 * 3. HTTP 429 (クォータ超過) に対する指数バックオフリトライ
 * 4. JSON パース失敗時のフォールバック処理
 * 5. 処理済みメールにラベルを付与して重複処理を防止
 * 6. 実行ログをスプレッドシートに記録
 *
 * 【セットアップ】
 * 1. このスクリプトを Apps Script エディタに貼り付け
 * 2. CONFIG セクションの GEMINI_API_KEY を設定
 *    （スクリプトプロパティ推奨）
 * 3. setup() 関数を1回実行（ラベル作成 + トリガー設定）
 * =========================================================
 */

// ========== 設定 ==========
const CONFIG = {
  // Gemini API
  GEMINI_MODEL: 'gemini-2.0-flash',
  GEMINI_API_KEY: PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY') || '',

  // メール処理
  MAX_EMAILS_PER_RUN: 5,           // 1回の実行で処理するメール数上限
  EMAIL_QUERY: 'is:unread -label:GWS-Processed -category:promotions -category:social -category:updates -category:forums',
  PROCESSED_LABEL: 'GWS-Processed', // 処理済みラベル

  // リトライ設定
  MAX_RETRIES: 3,
  BASE_DELAY_MS: 2000,             // 初回リトライ待機: 2秒

  // カレンダー
  CALENDAR_ID: 'primary',

  // ログ（任意: スプレッドシートID を設定するとログ記録）
  LOG_SPREADSHEET_ID: '',
  LOG_SHEET_NAME: 'GWS-Mail-Log',
};


// ========== メインエントリポイント ==========

/**
 * 時間ベーストリガーから呼ばれるメイン関数
 */
function autoScheduleFromEmail() {
  const startTime = new Date();
  log_('===== autoScheduleFromEmail 開始 =====');

  try {
    // 1. API キー確認
    if (!CONFIG.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY が未設定です。スクリプトプロパティに設定してください。');
    }

    // 2. 処理済みラベルを取得 or 作成
    const label = getOrCreateLabel_(CONFIG.PROCESSED_LABEL);

    // 3. 未処理メールを取得（件数制限あり）
    const threads = GmailApp.search(CONFIG.EMAIL_QUERY, 0, CONFIG.MAX_EMAILS_PER_RUN);
    log_(`未処理メール: ${threads.length} 件取得`);

    if (threads.length === 0) {
      log_('処理対象のメールはありません。終了します。');
      return;
    }

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    // 4. 各スレッドを処理
    for (const thread of threads) {
      const messages = thread.getMessages();
      const latestMessage = messages[messages.length - 1];
      const subject = latestMessage.getSubject();
      const from = latestMessage.getFrom();
      const body = latestMessage.getPlainBody();
      const date = latestMessage.getDate();

      log_(`処理中: [${subject}] from: ${from}`);

      try {
        // 5. Gemini で解析
        const analysis = analyzeEmailWithGemini_(subject, from, body, date);

        if (!analysis || !analysis.hasSchedule) {
          log_(`  → スケジュール情報なし。スキップ`);
          skipCount++;
        } else {
          // 6. カレンダーに登録
          createCalendarEvent_(analysis);
          log_(`  → カレンダー登録成功: ${analysis.title}`);
          successCount++;
        }

        // 7. 処理済みラベルを付与
        thread.addLabel(label);

      } catch (e) {
        errorCount++;
        log_(`  → エラー: ${e.message}`);
        // エラーでも処理済みラベルは付けて無限リトライを防止
        try { thread.addLabel(label); } catch (_) {}
      }
    }

    const elapsed = ((new Date() - startTime) / 1000).toFixed(1);
    log_(`===== 完了 (${elapsed}秒) | 成功:${successCount} スキップ:${skipCount} エラー:${errorCount} =====`);

  } catch (e) {
    log_(`致命的エラー: ${e.message}\n${e.stack}`);
  }
}


// ========== Gemini API ==========

/**
 * Gemini API でメールを解析し、スケジュール情報を抽出する
 */
function analyzeEmailWithGemini_(subject, from, body, date) {
  // メール本文を切り詰め（トークン節約 & クォータ対策）
  const truncatedBody = body.substring(0, 1500);

  const prompt = `以下のメールからスケジュール（予定）情報を抽出してください。
予定が含まれていない場合は hasSchedule: false を返してください。

メール情報:
- 件名: ${subject}
- 差出人: ${from}
- 受信日: ${date.toISOString()}
- 本文:
${truncatedBody}

以下のJSON形式で返してください（それ以外のテキストは一切不要）:
{
  "hasSchedule": true/false,
  "title": "予定タイトル",
  "description": "予定の説明",
  "startDate": "YYYY-MM-DD",
  "startTime": "HH:MM",
  "endTime": "HH:MM",
  "isAllDay": true/false,
  "location": "場所（あれば）"
}`;

  const payload = {
    contents: [{
      role: 'user',
      parts: [{ text: prompt }]
    }],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json',  // ★ v2.0 修正: JSON形式を強制
      responseSchema: {
        type: 'OBJECT',
        properties: {
          hasSchedule:  { type: 'BOOLEAN' },
          title:        { type: 'STRING' },
          description:  { type: 'STRING' },
          startDate:    { type: 'STRING' },
          startTime:    { type: 'STRING' },
          endTime:      { type: 'STRING' },
          isAllDay:     { type: 'BOOLEAN' },
          location:     { type: 'STRING' }
        },
        required: ['hasSchedule']
      }
    }
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.GEMINI_MODEL}:generateContent?key=${CONFIG.GEMINI_API_KEY}`;

  // リトライ付きでAPIコール
  const responseText = callGeminiWithRetry_(url, payload);

  // JSON パース（フォールバック付き）
  return parseGeminiResponse_(responseText);
}

/**
 * 指数バックオフ付きリトライでGemini APIを呼び出す
 */
function callGeminiWithRetry_(url, payload) {
  let lastError = null;

  for (let attempt = 0; attempt <= CONFIG.MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      const delay = CONFIG.BASE_DELAY_MS * Math.pow(2, attempt - 1);
      log_(`  → リトライ ${attempt}/${CONFIG.MAX_RETRIES} (${delay}ms 待機)`);
      Utilities.sleep(delay);
    }

    try {
      const response = UrlFetchApp.fetch(url, {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      });

      const statusCode = response.getResponseCode();

      if (statusCode === 200) {
        const json = JSON.parse(response.getContentText());
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
          throw new Error('Gemini応答にテキストが含まれていません');
        }
        return text;
      }

      if (statusCode === 429) {
        // ★ v2.0 修正: 429 はリトライ対象
        lastError = new Error(`HTTP 429: クォータ超過 (attempt ${attempt + 1})`);
        log_(`  → HTTP 429: クォータ超過。リトライします...`);
        continue;
      }

      if (statusCode >= 500) {
        lastError = new Error(`HTTP ${statusCode}: サーバーエラー`);
        log_(`  → HTTP ${statusCode}: サーバーエラー。リトライします...`);
        continue;
      }

      // その他のエラー（400等）はリトライしない
      throw new Error(`HTTP ${statusCode}: ${response.getContentText().substring(0, 200)}`);

    } catch (e) {
      if (e.message.startsWith('HTTP 4') && !e.message.startsWith('HTTP 429')) {
        throw e; // 429以外の4xxはリトライしない
      }
      lastError = e;
    }
  }

  throw lastError || new Error('Gemini API 呼び出しが全リトライで失敗しました');
}

/**
 * Gemini のレスポンスを安全にパースする
 * ★ v2.0 修正: 不正なJSONへのフォールバック
 */
function parseGeminiResponse_(text) {
  // まず直接パースを試みる
  try {
    return JSON.parse(text);
  } catch (_) {
    // パース失敗
  }

  // ```json ... ``` ブロックを抽出して再試行
  const jsonBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonBlock) {
    try {
      return JSON.parse(jsonBlock[1].trim());
    } catch (_) {}
  }

  // { ... } を抽出して再試行
  const braceMatch = text.match(/\{[\s\S]*\}/);
  if (braceMatch) {
    try {
      return JSON.parse(braceMatch[0]);
    } catch (_) {}
  }

  // すべて失敗 → スキップ扱い
  log_(`  → JSON パース失敗。レスポンス先頭: "${text.substring(0, 100)}"`);
  return { hasSchedule: false };
}


// ========== カレンダー ==========

/**
 * 解析結果からカレンダーイベントを作成
 */
function createCalendarEvent_(analysis) {
  const calendar = CalendarApp.getCalendarById(CONFIG.CALENDAR_ID);
  if (!calendar) {
    throw new Error(`カレンダーが見つかりません: ${CONFIG.CALENDAR_ID}`);
  }

  const title = analysis.title || '（メールからの予定）';
  const description = analysis.description || '';
  const location = analysis.location || '';

  if (analysis.isAllDay || !analysis.startTime) {
    // 終日イベント
    const eventDate = parseDate_(analysis.startDate);
    if (!eventDate) {
      throw new Error(`日付パース失敗: ${analysis.startDate}`);
    }
    calendar.createAllDayEvent(title, eventDate, {
      description: description,
      location: location
    });
  } else {
    // 時間指定イベント
    const startDateTime = parseDatetime_(analysis.startDate, analysis.startTime);
    const endDateTime = analysis.endTime
      ? parseDatetime_(analysis.startDate, analysis.endTime)
      : new Date(startDateTime.getTime() + 60 * 60 * 1000); // デフォルト1時間

    if (!startDateTime) {
      throw new Error(`日時パース失敗: ${analysis.startDate} ${analysis.startTime}`);
    }

    calendar.createEvent(title, startDateTime, endDateTime, {
      description: description,
      location: location
    });
  }
}


// ========== ユーティリティ ==========

/**
 * "YYYY-MM-DD" → Date
 */
function parseDate_(dateStr) {
  if (!dateStr) return null;
  const parts = dateStr.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!parts) return null;
  return new Date(parseInt(parts[1]), parseInt(parts[2]) - 1, parseInt(parts[3]));
}

/**
 * "YYYY-MM-DD" + "HH:MM" → Date
 */
function parseDatetime_(dateStr, timeStr) {
  const d = parseDate_(dateStr);
  if (!d || !timeStr) return d;
  const timeParts = timeStr.match(/(\d{1,2}):(\d{2})/);
  if (!timeParts) return d;
  d.setHours(parseInt(timeParts[1]), parseInt(timeParts[2]), 0, 0);
  return d;
}

/**
 * ラベルを取得、なければ作成
 */
function getOrCreateLabel_(labelName) {
  let label = GmailApp.getUserLabelByName(labelName);
  if (!label) {
    label = GmailApp.createLabel(labelName);
    log_(`ラベル "${labelName}" を作成しました`);
  }
  return label;
}

/**
 * ログ出力（コンソール + スプレッドシート）
 */
function log_(message) {
  const timestamp = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy-MM-dd HH:mm:ss');
  const logLine = `[${timestamp}] ${message}`;
  console.log(logLine);

  // スプレッドシートログ（設定されている場合）
  if (CONFIG.LOG_SPREADSHEET_ID) {
    try {
      const ss = SpreadsheetApp.openById(CONFIG.LOG_SPREADSHEET_ID);
      let sheet = ss.getSheetByName(CONFIG.LOG_SHEET_NAME);
      if (!sheet) {
        sheet = ss.insertSheet(CONFIG.LOG_SHEET_NAME);
        sheet.appendRow(['Timestamp', 'Message']);
      }
      sheet.appendRow([timestamp, message]);
    } catch (_) {
      // ログ記録失敗は無視
    }
  }
}


// ========== セットアップ ==========

/**
 * 初回セットアップ: ラベル作成 + 時間トリガー設定
 * ★ 手動で1回実行してください
 */
function setup() {
  // 1. 処理済みラベルを作成
  getOrCreateLabel_(CONFIG.PROCESSED_LABEL);

  // 2. 既存トリガーを削除
  const triggers = ScriptApp.getProjectTriggers();
  for (const trigger of triggers) {
    if (trigger.getHandlerFunction() === 'autoScheduleFromEmail') {
      ScriptApp.deleteTrigger(trigger);
    }
  }

  // 3. 新しいトリガーを作成（毎日 7:00-8:00 に実行）
  ScriptApp.newTrigger('autoScheduleFromEmail')
    .timeBased()
    .everyDays(1)
    .atHour(7)
    .create();

  // 4. API キー確認
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!apiKey) {
    log_('警告: GEMINI_API_KEY が未設定です。プロジェクト設定 → スクリプトプロパティで設定してください。');
    return;
  }

  log_('セットアップ完了: ラベル作成 + トリガー設定（毎日 7:00-8:00）');
}

/**
 * テスト実行: 1件だけ処理して動作確認
 */
function testRun() {
  const originalMax = CONFIG.MAX_EMAILS_PER_RUN;
  CONFIG.MAX_EMAILS_PER_RUN = 1;
  try {
    autoScheduleFromEmail();
  } finally {
    CONFIG.MAX_EMAILS_PER_RUN = originalMax;
  }
}

