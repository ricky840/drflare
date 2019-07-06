// const TABLE_ELEMENTS = ["requestId", "rayId", "url", "cfCached", "railguned", "polished"];
const TABLE_ELEMENTS = ["requestId", "url", "statusCode", "colo", "cfCached", "railguned", "polished", "minified"];
const TABLE_IDS = ["summary_table", "cached_table", "not_cached_table", "external_table"];

// var tabId = chrome.devtools.inspectedWindow.tabId;

var readyForIndividualWebRequest = false;
var totalBytes = 0;
var cachedBytes = 0;
var totalNumberOfRequests = 0;
var externalNumberOfRequests = 0;
var cachedNumberOfRequests = 0;

window.addEventListener('DOMContentLoaded', (event) => {
  // console.log('DOM fully loaded and parsed');
  readyForIndividualWebRequest = true;
  sendPanelReadyMesssage();
});

// chrome.devtools.network.onRequestFinished.addListener(function request) {
//   console.log(request);
// }

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {

  if (message.type.match('web-request-objects') && tabId == message.tabId && readyForIndividualWebRequest) { 
    let request = message.message;
    addRow({request});

  } else if (message.type.match('web-requests-array') && tabId == message.tabId) {
    readyForIndividualWebRequest = true;
    let requests = message.message;
    // console.log("DebugBackground REQUESTS Array Object Delivered: " + requests);
    // console.log(requests);
    addRow(requests);
  } else if (message.type.match('reload-shortcut') && tabId == message.tabId) {
    // console.log('Panel received to refresh again');
    resetTables();
    resetOverviewValues();
    // sendPanelReadyMesssage();
  } 
});

function addRow(requests) {
  let shouldWeAdd = false;
  let tableName = columnValue = '';
  let tableBody = column = titleRow = contentRow = request = null;

  for (let requestId in requests) {
    request = requests[requestId];
    for (let i = 0; i < TABLE_IDS.length; i++) {
      shouldWeAdd = false;
      tableName = TABLE_IDS[i];

      shouldWeAdd = checkTable(tableName);

      if (shouldWeAdd) {
        tableBody = document.getElementById(tableName).getElementsByTagName('tbody')[0];
        titleRow = tableBody.insertRow();
        titleRow.className = "ui title";
        for (let j = 0; j < TABLE_ELEMENTS.length; j++) {
          column = titleRow.insertCell(j);
          columnValue = '';
          if (typeof request[TABLE_ELEMENTS[j]] === "boolean") {
            if (request[TABLE_ELEMENTS[j]]) {
              columnValue = '<i class="large green checkmark icon"></i>';
            } else {
              columnValue = '<i class="large red checkmark icon"></i>';
            }

          } else {
            columnValue = `${request[TABLE_ELEMENTS[j]]}`;
          }

          column.innerHTML = columnValue;
        }
        contentRow = tableBody.insertRow();
        contentRow.className = "ui content";
        column = contentRow.insertCell(0);
        column.colSpan = `${TABLE_ELEMENTS.length}`;
        column.innerHTML = toPrintResponseHeaders(request.responseHeaders);
      }
    }

    updateOverview(requests[requestId]);
  }
}

function resetTables() {
  for (let i = 0; i < TABLE_IDS.length; i++) {
    let oldTableBody = document.getElementById(TABLE_IDS[i]).getElementsByTagName('tbody')[0];
    let newTableBody = document.createElement('tbody');
    oldTableBody.parentNode.replaceChild(newTableBody, oldTableBody)
  }
}

function resetOverviewValues() {
  totalBytes = 0;
  cachedBytes = 0;
  totalNumberOfRequests = 0;
  externalNumberOfRequests = 0;
  cachedNumberOfRequests = 0;
}

function sendPanelReadyMesssage() {
  chrome.runtime.sendMessage({
    type: 'panel-ready',
    message: 'Panel-Ready', 
    tabId: tabId,
    from: 'debugBackground.js'
  });
}

function checkTable(tableName) {
  let ans = false;
  switch(tableName) {
    case "cached_table":
      if (request.cfCached) { ans = true; }
      break;

    case "not_cached_table":
      if (request.rayId && !request.cfCached) { ans = true; }
      break;

    case "external_table":
      if (!request.rayId) { ans = true; }
      break;

    default:
      ans = true;
  }

  return ans;
}

function updateOverview(request) {
  totalNumberOfRequests += 1;
  totalBytes = parseInt(totalBytes) + parseInt(request.contentLength);

  calculateCacheHitRatio(request);
  calculateOffload(request);
  externalContentRatio(request);
}
