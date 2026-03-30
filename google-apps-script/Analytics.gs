/**
 * Аналитика Анкеты «Словарный запас» (v1.0)
 * Создаёт дашборд с графиками по каждому вопросу.
 *
 * ИНСТРУКЦИЯ:
 * 1. Добавьте этот файл как Analytics.gs в Apps Script
 * 2. Обновите страницу таблицы
 * 3. Нажмите «📊 Аналитика» → «Создать полный отчет»
 */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Аналитика')
    .addItem('Создать полный отчет', 'generateFullDashboard')
    .addToUi();
}

function generateFullDashboard(isSilent) {
  isSilent = isSilent === true;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dataSheet = ss.getSheets()[0];
  var dashName = 'Полный Отчет';
  var dash = ss.getSheetByName(dashName) || ss.insertSheet(dashName, 1);

  dash.clear();
  dash.getCharts().forEach(function(c) { dash.removeChart(c); });

  var data = dataSheet.getDataRange().getValues();
  if (data.length <= 1) {
    if (!isSilent) SpreadsheetApp.getUi().alert('Данных пока нет!');
    return;
  }

  var headers = data[0];
  var rows = data.slice(1);

  var CHART_WIDTH = 450;
  var CHART_HEIGHT = 300;
  var GRID_COLS = 2;
  var chartCount = 0;
  var dashRow = 7;

  // Title
  dash.getRange('A1:E1').merge()
    .setValue('ОТЧЕТ — СЛОВАРНЫЙ ЗАПАС И ИГРОВЫЕ МЕТОДЫ')
    .setFontSize(16).setFontWeight('bold').setFontColor('#4f8ff7').setBackground('#0e1420')
    .setHorizontalAlignment('center').setVerticalAlignment('middle');
  dash.setRowHeight(1, 50);

  dash.getRange('A3:B3').setValues([['Показатель', 'Значение']]).setFontWeight('bold').setBackground('#efefef');
  dash.getRange('A4:B4').setValues([['Всего респондентов', rows.length]]);

  function addChart(title, statsData, type) {
    if (statsData.length === 0) return;
    var startRow = dashRow;
    var statsCol = 27;
    dash.getRange(startRow, statsCol, statsData.length, 2).setValues(statsData);
    var range = dash.getRange(startRow, statsCol, statsData.length, 2);

    var builder = dash.newChart();
    if (type === 'PIE') {
      builder.asPieChart().setOption('pieHole', 0.4);
    } else {
      builder.asColumnChart().setOption('legend', {position: 'none'});
    }

    var gridX = (chartCount % GRID_COLS) * 8 + 1;
    var gridY = Math.floor(chartCount / GRID_COLS) * 16 + 8;

    var chart = builder
      .addRange(range)
      .setOption('title', title)
      .setOption('colors', ['#4f8ff7', '#f0b429', '#34d399', '#8b5cf6', '#ef4444'])
      .setPosition(gridY, gridX, 0, 0)
      .setOption('width', CHART_WIDTH)
      .setOption('height', CHART_HEIGHT)
      .build();

    dash.insertChart(chart);
    dashRow += statsData.length + 1;
    chartCount++;
  }

  headers.forEach(function(header, idx) {
    if (idx < 2 || header.includes('Имя') || header.includes('Любимые моменты')
        || header.includes('Что изменить') || header.includes('Описание идеи')
        || header.includes('Комментарии') || header.includes('Антоним')
        || header.includes('Слова на тему') || header.includes('Пропущенное слово')
        || header.includes('Значение') || header.includes('Другое')) return;

    var counts = {};
    var isCheckbox = header.includes('Что нравится на уроках');

    if (isCheckbox) {
      rows.forEach(function(r) {
        var val = r[idx];
        if (val) {
          val.toString().split(';').forEach(function(item) {
            var clean = item.trim();
            if (clean) counts[clean] = (counts[clean] || 0) + 1;
          });
        }
      });
    } else {
      rows.forEach(function(r) {
        var val = r[idx];
        if (val !== undefined && val !== '') counts[val] = (counts[val] || 0) + 1;
      });
    }

    var stats = Object.keys(counts).map(function(k) { return [k, counts[k]]; });
    stats.sort(function(a, b) { return b[1] - a[1]; });

    if (stats.length > 0) {
      var chartType = (stats.length > 5 || isCheckbox) ? 'BAR' : 'PIE';
      addChart(header, stats, chartType);
    }
  });

  dash.hideColumns(27, 2);
  dash.autoResizeColumns(1, 5);

  if (!isSilent) {
    SpreadsheetApp.getUi().alert('🚀 Отчет готов! Графиков: ' + chartCount + '\nСмотрите лист «Полный Отчет».');
  }
}
