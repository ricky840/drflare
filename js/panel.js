'use strict';

const TABLE_ELEMENTS = ["requestId", "url", "statusCode", "colo", "cfCached", "railguned", "polished", "minified"];
const TABLE_IDS = ["summary_table", "cached_table", "not_cached_table", "external_table"];

var tabId = chrome.devtools.inspectedWindow.tabId;

var readyForIndividualWebRequest = false;
var readyToPaint = false;
var totalBytes = 0;
var cachedBytes = 0;
var totalNumberOfRequests = 0;
var externalNumberOfRequests = 0;
var cachedNumberOfRequests = 0;

var requestObjectsImages = [];

window.addEventListener('DOMContentLoaded', (event) => {
  // console.log('DOM fully loaded and parsed');
  readyForIndividualWebRequest = true;
  sendPanelReadyMesssage();
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type.match('web-request-objects') && tabId == message.tabId && readyForIndividualWebRequest) { 
    let request = message.message;
    // console.log("DebugBackground Each Object Delivered: " + request);
    // console.log(request);
    addTableRow({request});

    
    // if (request.objectType === "image") {
    //   if (readyToPaint) {
    //     paintElement([request]);
    //   }
    // }

  } else if (message.type.match('web-requests-array') && tabId == message.tabId) {
    let requests = message.message;
    addTableRow(requests);
    // console.log("DebugBackground REQUESTS Array Object Delivered: " + requests);


    // if (readyToPaint) {
    //   paintElement(requestObjectsImages);
    // }
    
    
  } else if (message.type.match('reload-shortcut') && tabId == message.tabId) {
    resetTables();
    resetOverviewValues();
  } else if (message.type.match('page-onload-event') && tabId == message.tabId) {
    console.log('Ready to Paint from devTools.js');
    readyToPaint = true;
  }
});

function addTableRow(requests) {
  let shouldWeAdd = false;
  let tableName, columnValue, tableBody, column, titleRow, contentRow, request;

  for (let requestId in requests) {
    request = requests[requestId];
    // filterImageReqeust(request);
    for (let i = 0; i < TABLE_IDS.length; i++) {
      shouldWeAdd = false;
      tableName = TABLE_IDS[i];

      shouldWeAdd = checkTable(tableName, request);
      
      if (shouldWeAdd) {
        if (document.getElementById(tableName) != null) {
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
    }

    updateOverview(requests[requestId]);
  }
}

function resetTables() {
  for (let i = 0; i < TABLE_IDS.length; i++) {
    if (document.getElementById(TABLE_IDS[i])) {
      let oldTableBody = document.getElementById(TABLE_IDS[i]).getElementsByTagName('tbody')[0];
      let newTableBody = document.createElement('tbody');
      oldTableBody.parentNode.replaceChild(newTableBody, oldTableBody)
    }
  }
}

function resetOverviewValues() {
  totalBytes = 0;
  cachedBytes = 0;
  totalNumberOfRequests = 0;
  externalNumberOfRequests = 0;
  cachedNumberOfRequests = 0;
  requestObjectsImages = [];
}

function sendPanelReadyMesssage() {
  chrome.runtime.sendMessage({
    type: 'panel-ready',
    message: 'Panel-Ready', 
    tabId: tabId,
    from: 'debugBackground.js'
  });
}

function filterImageReqeust(request) {
  if (request.objectType === "image") {
    requestObjectsImages.push(request);
  }
}

function checkTable(tableName, request) {
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

    case "summary_table":
      ans = true;
  }

  return ans;
}

function updateOverview(request) {
  if (request === null) return false;

  totalNumberOfRequests += 1;
  totalBytes = parseInt(totalBytes) + parseInt(request.contentLength);

  if (readyForIndividualWebRequest) {
    calculateCacheHitRate(request);
    calculateOffload(request);
    externalContentRatio(request);
  }
}

function toPrintResponseHeaders(responseHeaders) {
  let headersInString = "";
  for (let header in responseHeaders) {
    headersInString += `${header}: ${responseHeaders[header]} <br>`;
  }

  return headersInString;
}

function calculateCacheHitRate(request) {
  if (request.cfCached) {
    cachedNumberOfRequests += 1;
  }
  
  if (document.getElementById("cache")) {
    document.getElementById("cache").innerHTML = `${cachedNumberOfRequests} / ${totalNumberOfRequests}`;
  }
}

function calculateOffload(request) {
  if (request.cfCached) {
    cachedBytes = parseFloat(cachedBytes) + parseFloat(request.contentLength);
  }

  let percent =  (parseFloat(cachedBytes) / parseFloat(totalBytes) * 100).toFixed(2);
  let wording = `${percent}% - ${cachedBytes} / ${totalBytes} Bytes`;
  if ((totalBytes / (1024 * 1024)) > 2) {
    wording = `${percent}% - ${parseFloat(cachedBytes / (1024 * 1024)).toFixed(2)} / ${parseFloat(totalBytes / (1024 * 1024)).toFixed(2)} MB`;
  } else if ((totalBytes / (1024)) > 2) {
    wording = `${percent}% - ${parseFloat(cachedBytes / (1024)).toFixed(2)} / ${parseFloat(totalBytes / (1024)).toFixed(2)} KB`;
  }

  if (document.getElementById("offload")) {
    document.getElementById("offload").innerHTML = wording;
  }
}
  

function externalContentRatio(request) {
  if (!request.rayId) {
    externalNumberOfRequests += 1;
  }
  if (document.getElementById("external")) {
    document.getElementById("external").innerHTML = `${externalNumberOfRequests} / ${totalNumberOfRequests}`;
  }
}