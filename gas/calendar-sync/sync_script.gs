const SPREADSHEET_ID = '1J54df6PpCOzYlTFkmw6OctgkFn02CYZzNOvuR9Taq9I';
const TARGET_CALENDARS = [
  { id: 'kazumasa.kawahara@lawnest.net', type: '日常・交流' },
  { id: 'c_97443fe3e6cd829b37f66abbeb6f7f0b3b9ca6332683302c2cf83beec075aafe@group.calendar.google.com', type: '活動・支援' },
  { id: 'c_011bcbc6fffa8cb2dbfef109f0a8f3f7be58840f1b8addee08f4965ac8ba89c8@group.calendar.google.com', type: '出先・旅' },
  { id: 'c_38700a05a5ab282a32a25581b7950cd65e289d0f4f87763807885543c7dcf1f4@group.calendar.google.com', type: '対話・談話' }
];

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('📅 アーカイブ同期')
    .addItem('最新の活動を読み込む', 'syncCalendarsToSheet')
    .addToUi();
}

function syncCalendarsToSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('活動の足跡');
  const data = sheet.getDataRange().getValues();
  const existingEventIds = data.map(row => row[0]);
  const now = new Date();
  const startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  const endDate = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

  TARGET_CALENDARS.forEach(calConfig => {
    const calendar = CalendarApp.getCalendarById(calConfig.id);
    if (!calendar) return;
    const events = calendar.getEvents(startDate, endDate);
    events.forEach(event => {
      const eventId = event.getId();
      const rowIndex = existingEventIds.indexOf(eventId);
      if (rowIndex === -1) {
        const rowData = [
          eventId,
          "",
          event.getStartTime(),
          event.getTitle(),
          "",
          "",
          ""
        ];
        sheet.appendRow(rowData);
        existingEventIds.push(eventId);
      } else {
        const existingRow = rowIndex + 1;
        sheet.getRange(existingRow, 3).setValue(event.getStartTime());
        sheet.getRange(existingRow, 4).setValue(event.getTitle());
      }
    });
  });
  SpreadsheetApp.getUi().alert('アーカイブの更新が完了しました。');
}
