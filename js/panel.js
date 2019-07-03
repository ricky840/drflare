// const TABLE_ELEMENTS = ["requestId", "rayId", "url", "cfCached", "railguned", "polished"];
const TABLE_ELEMENTS = ["requestId", "url", "statusCode", "colo", "cfCached", "railguned", "polished", "minified"];
const TABLE_IDS = ["summary_table", "cached_table", "not_cached_table", "external_table"];
var tabId = chrome.devtools.inspectedWindow.tabId;
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
  // var tableBody = document.getElementById("summary_table").getElementsByTagName('tbody')[0];
  // console.log(requests);
  let add = false;
  let tableName = columnValue = '';
  let tableBody = column = row = request = null;

  for (let requestId in requests) {
    request = requests[requestId];
    for (let i = 0; i < TABLE_IDS.length; i++) {
      add = false;
      tableName = TABLE_IDS[i];

      switch(tableName) {
        case "cached_table":
          if (request.cfCached) { add = true; }
          break;

        case "not_cached_table":
          if (request.rayId && !request.cfCached) { add = true; }
          break;

        case "external_table":
          if (!request.rayId) { add = true; }
          break;

        default:
          add = true;
      }

      if (add) {
        tableBody = document.getElementById(TABLE_IDS[i]).getElementsByTagName('tbody')[0];
        row = tableBody.insertRow();
        for (let j = 0; j < TABLE_ELEMENTS.length; j++) {
          column = row.insertCell(j);
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

function updateOverview(request) {
  totalNumberOfRequests += 1;
  totalBytes = parseInt(totalBytes) + parseInt(request.contentLength);

  calculateCacheHitRatio(request);
  calculateOffload(request);
  externalContentRatio(request);
}
