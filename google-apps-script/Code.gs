/**
 * Google Apps Script — приём данных анкеты «Словарный запас»
 *
 * ИНСТРУКЦИЯ:
 * 1. Создайте Google Таблицу: https://sheets.google.com
 * 2. Расширения → Apps Script
 * 3. Вставьте этот код, сохраните
 * 4. Развертывание → Новое развертывание → Веб-приложение
 *    - Выполнять как: Я
 *    - Доступ: Все (Anyone)
 * 5. Скопируйте URL и вставьте в script.js
 */ 

var HEADERS = [
  '№ ответа',
  'Дата и время',
  '2. Возраст',
  '3. Пол',
  '4. Имя',
  '5. Отношение к русскому языку',
  '6. Оценка словарного запаса',
  '7. Частота настольных игр',
  '8. Опыт языковых игр',
  '9. Интерес к изучению через игры',
  '10. Что нравится на уроках',
  '10. Другое (уточнение)',
  '11. Понравился ли урок с игрой',
  '12. Интерес к новым словам после игры',
  '13. Запоминание слов благодаря игре',
  '14. Понимание правил игры',
  '15. Любимые моменты игры',
  '16. Что изменить в игре',
  '17. Идеи для изучения слов',
  '17. Описание идеи',
  '18. Комментарии',
  '19. Антоним к «радостный»',
  '20. Слова на тему «климат»',
  '21. Пропущенное слово',
  '22. Значение «усердие»',
  '23. Пословица — выбор слова'
];

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      var headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#0e1420');
      headerRange.setFontColor('#4f8ff7');
      headerRange.setWrap(true);
      headerRange.setVerticalAlignment('middle');
      sheet.setFrozenRows(1);
      sheet.setColumnWidth(1, 80);
      sheet.setColumnWidth(2, 140);
      for (var i = 3; i <= HEADERS.length; i++) {
        sheet.setColumnWidth(i, 180);
      }
    }

    var responseNumber = sheet.getLastRow();
    data['№ ответа'] = responseNumber;

    var row = [];
    for (var i = 0; i < HEADERS.length; i++) {
      row.push(data[HEADERS[i]] !== undefined ? data[HEADERS[i]] : '');
    }

    sheet.appendRow(row);

    var lastRow = sheet.getLastRow();
    var rowRange = sheet.getRange(lastRow, 1, 1, HEADERS.length);
    rowRange.setBackground(lastRow % 2 === 0 ? '#f8f8f8' : '#ffffff');

    try {
      if (typeof generateFullDashboard === 'function') {
        generateFullDashboard(true);
      }
    } catch (e) {
      console.log('Auto-update error: ' + e.message);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', row: responseNumber }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput('Скрипт анкеты работает! Используйте POST для отправки данных.')
    .setMimeType(ContentService.MimeType.TEXT);
}
