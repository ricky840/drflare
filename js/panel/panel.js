// webNavigation-onBeforeNavigate Event. Prepare for refresh/reload page
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type.match('webNavigation-onBeforeNavigate') && tabId == message.tabId) {
    pageOnCompleteEventForPanel = false;  // webNavigation.onCompleted event flag
    requestTable.resetTables();           // Empty tables
    cdnCgi.update();                      // Cdn-cgi
    resetData.statData();                 // Reset statistics variables
    updateStatHtml.updateStats();         // Reset statistics values in panel html
    resetData.chartData();                // Reset charts data values
    resetData.circularLabels();           // Reset labels in the menu
    startFakeOnloadEventCounter();        // Start timer for fake onLoad event
    allRequestObjects = {};               // Reset all request objects DB
    loadingIndicators.show();             // Show loading indicator for charts
    requestTable.loaderShow();            // Show loading indicator for tables
    clearInterval(chartTimer);            // Clear chart update interval
  }
});

// Network Request Event Listener
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type.match('web-request-objects') && tabId == message.tabId) { 
    let request = message.message;

    // Loading indicator for tables
    requestTable.loaderHide();

    // Save request
    allRequestObjects[request.requestId] = request;

    // Update statistic (variables only)
    updateStatVariable.update(request);

    // Table update 
    requestTable.addTableRow(request);
   
    // When fake onCompleted event triggers, update statistic htmls
    if(pageOnCompleteEventForPanel) {
      updateStatHtml.updateStats();
    }
  } 
});

// WebNavigation OnLoad Event Listner (onCompleted)
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type.match('page-onload-event') && tabId == message.tabId) {

    // Hide loading indicators for charts
    if (!pageOnCompleteEventForPanel) loadingIndicators.hide();

    // Update statistics html
    updateStatHtml.updateStats();

    // Update charts
    updateStatHtml.updateCharts();

    // Mark OnComplete event
    pageOnCompleteEventForPanel = true;

    // Start Chart Interval
    startChartInterval(); 
  }
});

// Search Query Listner (control + F)
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

function startFakeOnloadEventCounter() {
  setTimeout(function() { 
    // Fire if the onload event was not arrived in X seconds
    if (!pageOnCompleteEventForPanel) {
      loadingIndicators.hide();
      updateStatHtml.updateStats();
      updateStatHtml.updateCharts();
      pageOnCompleteEventForPanel = true;
    } 
  }, WAIT_FOR_ONLOAD_EVENT);
}

function startChartInterval() {
  chartTimer = setInterval(function() { 
    updateStatHtml.updateCharts();
  }, CHARTS_UPDATE_INTERVAL);
}

// Create Charts, we should include charts as fast as we can
includeCharts(CHARTS);

$(document).ready(function() {
  // Update Version Info
  var manifest = chrome.runtime.getManifest();
  $("#extVersion").html("v" + manifest.version);

  // Enable Menu only when the document is ready
  $(".menu .item.disabled").removeClass("disabled");

  // Cdn-cgi update button
  $("#cdncgi-update-button").click(function() {
    cdnCgi.update();
  });
 
  // Init Tables
  requestTable.initTables(DATATABLE_DEFAULT_NUM_ROWS);

  // Hidden rows
  $("tbody").on('click', 'td', function() {
    let tableTag = $(this).closest('table');
    let tr = $(this).closest('tr');
    requestTable.showHiddenRow($(tableTag).attr('id'), tr);
  });

  // For table pagination color 
  $(".dataTables_paginate .pagination.menu").addClass("inverted");
});
