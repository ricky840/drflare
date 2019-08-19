// When Page Refreshed
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type.match('webnavigation-before-refresh') && tabId == message.tabId) {

    requestTable.resetTables();

    cdnCgi.update();

    resetData.statData();
    updateStatHtml.updateStats();
    resetData.chartData();
    resetData.circularLabels();

    loadingIndicators.show();
    startFakeOnloadEventCounter();
    pageOnCompleteEventForPanel = false;

    // all requests
    allRequestObjects = {};

    // Loading indicator for tables
    requestTable.loaderShow();

    clearInterval(intervalChart);
  }
});

// Network Request Event Listner
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type.match('web-request-objects') && tabId == message.tabId) { 
    let request = message.message;

    // Loading indicator for tables
    requestTable.loaderHide();
    
    allRequestObjects[request.requestId] = request;

    updateStatVariable.update(request);

    // Table update 
    requestTable.addTableRow(request);
    
    if(pageOnCompleteEventForPanel) {
      updateStatHtml.updateStats();
      // updateStatHtml.updateCharts();
    }
  } 
});


var intervalChart = null;

// WebNavigation OnLoad Event Listner
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type.match('page-onload-event') && tabId == message.tabId) {
    if (!pageOnCompleteEventForPanel) loadingIndicators.hide();
    updateStatHtml.updateStats();
    updateStatHtml.updateCharts();
    pageOnCompleteEventForPanel = true;

    // Start Chart Interval
    startChartInterval(); 
  }
});


function startChartInterval() {
  intervalChart = setInterval(function() { 
    updateStatHtml.updateCharts();
  }, 3000);
}



// Search Query Listner
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type.match('search-panel-string') && tabId == message.tabId) {
    if(message.query != undefined) {
      $("td.highlight").removeClass("highlight");
      $(`tr[reqid] > td:contains(${message.query})`).addClass("highlight");
    } else {
      $("td.highlight").removeClass("highlight");
    }
  }
});

const CHARTS = [
  'requestCountBarChart.js',
  'byteSavedByCachedRatioChart.js',
  'proxiedRequestRatioChart.js',
  'routingColoChart.js',
  'totalContentTypeChart.js',
  'unCachedContentTypeChart.js',
  'httpVersionChart.js',
  'imgPolishByteSaveChart.js'
];

// Create Charts
includeCharts(CHARTS);

// Enable Menu only when the document is ready
$(document).ready(function() {
  $(".menu .item.disabled").removeClass("disabled");

  // cdncgi update button
  $("#cdncgi-update-button").click(function() {
    cdnCgi.update();
  });
  
  requestTable.initTables(25);
  $(".dataTables_paginate .pagination.menu").addClass("inverted");

  $("tbody").on('click', 'td', function() {
    let tableTag = $(this).closest('table');
    let tr = $(this).closest('tr');
    requestTable.showHiddenRow($(tableTag).attr('id'), tr);
  });
});

function startFakeOnloadEventCounter() {
  setTimeout(function() { 
    // Fire if the onload event was not arrived in 4 seconds
    if (!pageOnCompleteEventForPanel) {
      loadingIndicators.hide();
      updateStatHtml.updateStats();
      updateStatHtml.updateCharts();
      pageOnCompleteEventForPanel = true;
    } 
  }, WAIT_FOR_ONLOAD_EVENT);
}

function includeCharts(files) {
  let chartBaseUrl = 'js/charts/';
  for(let i=0; i < files.length; i++) {
    let script = document.createElement("script");
    script.type = 'text/javascript';
    script.src = chartBaseUrl + files[i];
    document.body.appendChild(script);
  }
}
