// When Page Refreshed
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type.match('tab-updated') && tabId == message.tabId) {

    // update CDN-CGI
    cdnCgi.update();

    requestTable.resetTables();
    resetData.statData();
    updateStatHtml.updateStats();
    resetData.chartData();
    resetData.circularLabels();

    loadingIndicators.show();
    startFakeOnloadEventCounter();
    pageOnCompleteEventForPanel = false;
  }
});

// Network Request Event Listner
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type.match('web-request-objects') && tabId == message.tabId) { 
    let request = message.message;

    updateStatVariable.update(request);
    requestTable.addTableRow({request});
    
    if(pageOnCompleteEventForPanel) {
      updateStatHtml.updateStats();
      updateStatHtml.updateCharts();
    }
  } 
});

// WebNavigation OnLoad Event Listner
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type.match('page-onload-event') && tabId == message.tabId) {
    if (!pageOnCompleteEventForPanel) loadingIndicators.hide();
    updateStatHtml.updateStats();
    updateStatHtml.updateCharts();
    pageOnCompleteEventForPanel = true;
  }
});

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
