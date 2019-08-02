// When Page Refreshed
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type.match('tab-updated') && tabId == message.tabId) {
    resetTables();
    resetStats();
    pageOnCompleteEventForPanel = false;
  }
});

// Network Request Event Listner
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  console.dir(message);
  if (message.type.match('web-request-objects') && tabId == message.tabId) { 
    let request = message.message;


    updateStatValue(request);
    addTableRow({request});
  } 
});

// WebNavigation OnLoad Event Listner
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type.match('page-onload-event') && tabId == message.tabId) {
		console.log("onDOMContentLoad-event-panel");
    pageOnCompleteEventForPanel = true;
  }
});


const TABLE_IDS = [
  "cached-table",
  "summary-table"
]

function resetTables() {
  for (let i=0; i < TABLE_IDS.length; i++) {
    if (document.getElementById(TABLE_IDS[i])) {
      let oldTableBody = document.getElementById(TABLE_IDS[i]).tBodies[0];
      let newTableBody = document.createElement('tbody');
      oldTableBody.parentNode.replaceChild(newTableBody, oldTableBody);
    }
  }
}

function resetStats() {
  totalNumberOfRequests = 0;
  totalNumberOfCfRequests = 0;
  cachedNumberOfCfRequests = 0;
  unCachedNumberOfCfRequests = 0;
  externalNumberOfRequests = 0;

  totalBytes = 0;
  cfProxiedBytes = 0;
  cfProxiedByteCached = 0;

  contentTypes = {}; 
  routingColo = {};
}

function updateStatValue(request) {
  // Number of requests
  totalNumberOfRequests += 1;
  (request.rayId !== "") ? totalNumberOfCfRequests += 1 : externalNumberOfRequests += 1;
  if (request.cfCached) cachedNumberOfCfRequests += 1;
  if (!request.cfCached && request.rayId !== "") unCachedNumberOfCfRequests += 1;
  cfProxiedRequestRatio = ((totalNumberOfCfRequests/totalNumberOfRequests) * 100).toFixed();
  cfCachedRequestRatio = (totalNumberOfCfRequests !== 0) ? ((cachedNumberOfCfRequests/totalNumberOfCfRequests) * 100).toFixed() : 0;
  // cfUnCachedRequestRatio = (totalNumberOfCfRequests !== 0) ? ((unCachedNumberOfCfRequests/totalNumberOfCfRequests) * 100).toFixed() : 0;
  // externalRequestRatio = ((externalNumberOfRequests/totalNumberOfRequests) * 100).toFixed();

  // Size of requests
  totalBytes = totalBytes + parseInt(request.contentLength);
  if (request.rayId !== "") cfProxiedBytes = cfProxiedBytes + parseInt(request.contentLength); 
  if (request.cfCached) cfProxiedByteCached = cfProxiedByteCached + parseInt(request.contentLength);
  cfProxiedByteCachedRatio =  ((cfProxiedByteCached/totalBytes) * 100).toFixed();

  // Content Type Count
  (contentTypes[request.objectType] == undefined) ? contentTypes[request.objectType] = 1 : contentTypes[request.objectType] = contentTypes[request.objectType] + 1;

  // Routing Count
  if(request.colo) {
    (routingColo[request.colo] == undefined) ? routingColo[request.colo] = 1 : routingColo[request.colo] = routingColo[request.colo] + 1;
  }

  drawStats();
}

function drawStats() {
  $("#overview-cf-proxied-ratio").html(cfProxiedRequestRatio);
  $("#overview-cf-cache-hit-ratio").html(cfCachedRequestRatio);
  $("#overview-cf-cache-miss-ratio").html(cfUnCachedRequestRatio);
  $("#overview-external-request-ratio").html(externalRequestRatio);
  $("#overview-total-bytes").html(sizeWording(totalBytes));
  $("#overview-cf-proxied-bytes").html(sizeWording(cfProxiedBytes));
  $("#overview-cf-cached-bytes-ratio").html(cfProxiedByteCachedRatio);
}



function addTableRow(requests) {
  var tableBody = document.getElementById("summary-table").tBodies[0];
  var cachedTableBody = document.getElementById("cached-table").tBodies[0];

  for (var requestId in requests) { 
    let request = requests[requestId];

    // Cached Table
    if(request.cfCached) {
      let row = cachedTableBody.insertRow(); 
      for (let i=0; i < CACHED_TABLE_COLUMNS.length; i++)  {
        let cell = row.insertCell(i)
        cell.innerHTML = request[CACHED_TABLE_COLUMNS[i]];
      }
    }

    // Summary Table Stats
    $("#summary-stat-total-num-req").html(totalNumberOfRequests);
    $("#summary-stat-total-num-cf-req").html(totalNumberOfCfRequests);
    $("#summary-stat-total-num-cf-cached").html(cachedNumberOfCfRequests);
    $("#summary-stat-total-num-3rd-party-req").html(externalNumberOfRequests);
    let row = tableBody.insertRow(); 
    for (let i=0; i < SUMMARY_TABLE_COLUMNS.length; i++)  {
      let cell = row.insertCell(i)
      cell.innerHTML = request[SUMMARY_TABLE_COLUMNS[i]];
    }
  }
}



//
//
// 'use strict';
//
// const TABLE_ELEMENTS = ["requestId", "url", "statusCode", "colo", "cfCached", "railguned", "polished", "minified"];
// const TABLE_IDS = ["summary_table", "cached_table", "not_cached_table", "external_table"];
//
// var tabId = chrome.devtools.inspectedWindow.tabId;
//
// var readyForIndividualWebRequest = false;
// var readyToPaint = false;
// var totalBytes = 0;
// var cachedBytes = 0;
// var totalNumberOfRequests = 0;
// var externalNumberOfRequests = 0;
// var cachedNumberOfRequests = 0;
// var cachableNumberOfRequests = 0;
//
// var requestObjectsImages = [];
//
// window.addEventListener('DOMContentLoaded', (event) => {
//   // console.log('DOM fully loaded and parsed');
//   readyForIndividualWebRequest = true;
//   sendPanelReadyMesssage();
// });
//
// chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
//   if (message.type.match('web-request-objects') && tabId == message.tabId && readyForIndividualWebRequest) { 
//     let request = message.message;
//     addTableRow({request});
//
//   // } else if (message.type.match('web-requests-array') && tabId == message.tabId) {
//   //   let requests = message.message;
//   //   console.log("fc222222222");
//   //   addTableRow(requests);
//
//   } else if (message.type.match('reload-shortcut') && tabId == message.tabId) {
//     resetTables();
//     resetOverviewValues();
//   } else if (message.type.match('page-onload-event') && tabId == message.tabId) {
//     // console.log('Ready to Paint from devTools.js');
//     readyToPaint = true;
//   }
// });
//
// function addTableRow(requests) {
//   let shouldWeAdd = false;
//   let tableName, columnValue, tableBody, column, titleRow, contentRow, request;
//
//   for (var requestId in requests) {
//     request = requests[requestId];
//     // filterImageReqeust(request);
//     for (let i = 0; i < TABLE_IDS.length; i++) {
//       shouldWeAdd = false;
//       tableName = TABLE_IDS[i];
//
//       shouldWeAdd = checkTable(tableName, request);
//
//       if (shouldWeAdd) {
//         if (document.getElementById(tableName) != null) {
//           tableBody = document.getElementById(tableName).getElementsByTagName('tbody')[0];
//           titleRow = tableBody.insertRow();
//           titleRow.className = "ui title cfdebugger-test-hover";
//           titleRow.setAttribute("request-id", request.requestId)
//           for (let j = 0; j < TABLE_ELEMENTS.length; j++) {
//             column = titleRow.insertCell(j);
//             columnValue = '';
//             if (typeof request[TABLE_ELEMENTS[j]] === "boolean") {
//               if (request[TABLE_ELEMENTS[j]]) {
//                 columnValue = '<i class="large green checkmark icon"></i>';
//               } else {
//                 columnValue = '<i class="large red checkmark icon"></i>';
//               }
//
//             } else {
//               columnValue = `${request[TABLE_ELEMENTS[j]]}`;
//             }
//
//             column.innerHTML = columnValue;
//           }
//           contentRow = tableBody.insertRow();
//           contentRow.className = "ui content";
//           column = contentRow.insertCell(0);
//           column.colSpan = `${TABLE_ELEMENTS.length}`;
//           column.innerHTML = toPrintResponseHeaders(request.responseHeaders);
//         }
//       }
//     }
//
//     updateOverview(requests[requestId]);
//   }
// }
//
// $(document).on({
//     mouseenter: function () {
//       var request_id = $(this).attr("request-id");
//       chrome.tabs.sendMessage(tabId, {type: 'show-tooltip', requestId: request_id, from: 'panel.js'});
//     },
//     mouseleave: function () {
//       var request_id = $(this).attr("request-id");
//       chrome.tabs.sendMessage(tabId, {type: 'hide-tooltip', requestId: request_id, from: 'panel.js'});
//     }
// }, ".cfdebugger-test-hover");
//
// function resetTables() {
//   for (let i = 0; i < TABLE_IDS.length; i++) {
//     if (document.getElementById(TABLE_IDS[i])) {
//       let oldTableBody = document.getElementById(TABLE_IDS[i]).getElementsByTagName('tbody')[0];
//       let newTableBody = document.createElement('tbody');
//       oldTableBody.parentNode.replaceChild(newTableBody, oldTableBody)
//     }
//   }
// }
//
// function resetOverviewValues() {
//   totalBytes = 0;
//   cachedBytes = 0;
//   totalNumberOfRequests = 0;
//   externalNumberOfRequests = 0;
//   cachedNumberOfRequests = 0;
//   cachableNumberOfRequests = 0;
//   requestObjectsImages = [];
// }
//
// function sendPanelReadyMesssage() {
//   chrome.runtime.sendMessage({
//     type: 'panel-ready',
//     message: 'Panel-Ready', 
//     tabId: tabId,
//     from: 'debugBackground.js'
//   });
// }
//
// function filterImageReqeust(request) {
//   if (request.objectType === "image") {
//     requestObjectsImages.push(request);
//   }
// }
//
// function checkTable(tableName, request) {
//   let ans = false;
//   switch(tableName) {
//     case "cached_table":
//       if (request.cfCached) { ans = true; }
//       break;
//
//     case "not_cached_table":
//       if (request.rayId && !request.cfCached) { ans = true; }
//       break;
//
//     case "external_table":
//       if (!request.rayId) { ans = true; }
//       break;
//
//     case "summary_table":
//       ans = true;
//   }
//
//   return ans;
// }
//
// function updateOverview(request) {
//   if (request === null) return false;
//
//   totalNumberOfRequests += 1;
//   totalBytes = parseInt(totalBytes) + parseInt(request.contentLength);
//
//   if (readyForIndividualWebRequest) {
//     calculateCacheHitRate(request);
//     calculateCachableHitRate(request);
//     calculateOffload(request);
//     externalContentRatio(request);
//   }
// }
//
// function toPrintResponseHeaders(responseHeaders) {
//   let headersInString = "";
//   for (let header in responseHeaders) {
//     headersInString += `${header}: ${responseHeaders[header]} <br>`;
//   }
//
//   return headersInString;
// }
//
// function calculateCacheHitRate(request) {
//   if (request.cfCached) {
//     cachedNumberOfRequests += 1;
//   }
//
//   if (document.getElementById("cache")) {
//     document.getElementById("cache").innerHTML = `${cachedNumberOfRequests} / ${totalNumberOfRequests}`;
//   }
// }
//
// function calculateCachableHitRate(request) {
//   if (!request.cfCached && request.rayId) {
//     cachableNumberOfRequests += 1;
//   }
//
//   if (document.getElementById("cacheable")) {
//     document.getElementById("cacheable").innerHTML = `${cachableNumberOfRequests} / ${totalNumberOfRequests}`;
//   }
// }
//
// function calculateOffload(request) {
//   if (request.cfCached) {
//     cachedBytes = parseFloat(cachedBytes) + parseFloat(request.contentLength);
//   }
//
//   let percent =  (parseFloat(cachedBytes) / parseFloat(totalBytes) * 100).toFixed(2);
//   let wording = `${percent}% - ${cachedBytes} / ${totalBytes} Bytes`;
//   if ((totalBytes / (1024 * 1024)) > 2) {
//     wording = `${percent}% - ${parseFloat(cachedBytes / (1024 * 1024)).toFixed(2)} / ${parseFloat(totalBytes / (1024 * 1024)).toFixed(2)} MB`;
//   } else if ((totalBytes / (1024)) > 2) {
//     wording = `${percent}% - ${parseFloat(cachedBytes / (1024)).toFixed(2)} / ${parseFloat(totalBytes / (1024)).toFixed(2)} KB`;
//   }
//
//   if (document.getElementById("offload")) {
//     document.getElementById("offload").innerHTML = wording;
//   }
// }
//
//
// function externalContentRatio(request) {
//   if (!request.rayId) {
//     externalNumberOfRequests += 1;
//   }
//   if (document.getElementById("external")) {
//     document.getElementById("external").innerHTML = `${externalNumberOfRequests} / ${totalNumberOfRequests}`;
//   }
// }
