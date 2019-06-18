/** 
  * @desc Listener for all webRequest API
  * 			WebRequest's Life Cycle: https://developer.chrome.com/extensions/webRequest
*/

// Global variables for webRequestListener
var selectedTabId = "";
// var devToolEnabled = false;

// Ricky: Temporary
var inspectedTabIds = []; // this needs to be initialized when reloading the app see background.js

function addToListener(newTabId, callback) {
  if (inspectedTabIds.indexOf(newTabId) < 0) {
    inspectedTabIds.push(newTabId);
    callback(newTabId);
    console.log("inspectedTabIds: " + inspectedTabIds);
  } else {
    console.log("already listening");
  }
}

function removeFromListner(closedTabId) {
  if (inspectedTabIds.indexOf(closedTabId) >= 0) {
    inspectedTabIds.splice(inspectedTabIds.indexOf(closedTabId), 1);
    console.log("removed, inspectedTabIds: "+ inspectedTabIds);

    delete requests[closedTabId];
  }
}

// Collections of requests per tabId 
// ex) tabId => {requestId1: webRequest1, requestId2: webRequest2, ...}


// Ricky
function confirmRequestExist(hi) {
  return new Promise(function(resolve, reject) { 
    console.log("confirm");
    console.log(requests);
    console.log(hi);
    console.log("---------------");
    console.log(hi.requestId);
    var test = requests[hi.tabId];
    console.log("---------------");

    if (test[hi.requestId] == undefined) {
      let request = new WebRequest(hi);
      requests[hi.tabId][hi.requestId] = request;
      console.log("Request " + hi.requestId + " does not exist, adding..");
      resolve();
    } else {
      console.log("Request " + hi.requestId + " exists");
      resolve();
    }
  });


}

var requests = {};
var requestsHolder = {};
var requestQueue = {};

// onSendHeaders: Before the requests are sent to the network.
chrome.webRequest.onSendHeaders.addListener(
	function(details) {
		if (inspectedTabIds.indexOf(details.tabId) > -1) {
			let request = new WebRequest(details);
     
			if (!isInRequests(requests, details.tabId)) {
				requests[details.tabId] = {};
			}

			requests[details.tabId][request.getRequestId()] = request;
    }
	},
	{
		urls: ["<all_urls>"]
	},
	["requestHeaders"]
)

// onHeadersReceived: First HTTP response header is received.
chrome.webRequest.onHeadersReceived.addListener(
	function(details) {
		if (inspectedTabIds.indexOf(details.tabId) > -1) {
			if (isInTab(requests[details.tabId], details.requestId)) {
				requests[details.tabId][details.requestId] = updateResponse(requests[details.tabId][details.requestId], details);
			}
		}
	},
	{
		urls: ["<all_urls>"]
	},
	["responseHeaders"]
)

// onResponseStarted: For onResponseStarted timestamp.
chrome.webRequest.onResponseStarted.addListener(
	function(details) {
		if (inspectedTabIds.indexOf(details.tabId) > -1) {
			if (isInTab(requests[details.tabId], details.requestId)) {
				requests[details.tabId][details.requestId].setOnResponseStartedTimeStamp(details.timeStamp);
			}
		}
	},
	{
		urls: ["<all_urls>"]
	},
	["responseHeaders"]
);

// onCompleted: For onComplete timestamp.
chrome.webRequest.onCompleted.addListener(
	function(details) {
    let tabId = details.tabId;
    if (inspectedTabIds.indexOf(tabId) > -1) {
			if (isInTab(requests[details.tabId], details.requestId)) {
        requests[details.tabId][details.requestId].setOnCompletedTimeStamp(details.timeStamp);
			}
		}
	 },
	{
		urls: ["<all_urls>"]
	},
	["responseHeaders"]
)

// onResponseStarted: Response Listener
chrome.tabs.onActivated.addListener(
	function(activeInfo) {
		selectedTabId = activeInfo.tabId;
	}
)

// Ricky: webRequestListener.js and background.js is in the same background.html page
chrome.runtime.onMessage.addListener(
	function(message, sender, sendResponse) {
		if (message.from === FROM_POPUP_JS) {
			printRequests();
		} 
		// else if (message.type === NEW_INSTPECTED_WINDOW_TABID) {
		// 	console.log(`
		// 			Received Tab ID: ${message.message}
		// 			selected Tab ID: ${selectedTabId}
		// 		`);
		// 	devToolEnabled = true;
		// }
	}
)

// Reset 
chrome.webNavigation.onBeforeNavigate.addListener(
	function(details) {
		if (inspectedTabIds.indexOf(details.tabId) > -1) {
			delete requests[details.tabId];
		}
	}
);

// onCompleted
chrome.webNavigation.onDOMContentLoaded.addListener(
	function(details) {

	}
);
//
// onCompleted
// chrome.webNavigation.onDOMContentLoaded.addListener(
// 	function(details) {
// 		// printRequestLog('webNavigation onDOMContentLoaded', details);
// 		// if (isActiveTab(details)) {
// 		// 	if (selectedTabId) {
// 		// 		// Handle browser cache: solution disable broswer cache by default
// 		// 		// console.log(details);
// 		// 		delete requests[selectedTabId];
// 		// 	}
// 		// }
// 	}
// );

// onCompleted
chrome.webNavigation.onCompleted.addListener(
	function(details) {
		if (inspectedTabIds.indexOf(details.tabId) > -1) {
			chrome.runtime.sendMessage({
         type: 'web-request-objects', 
         message: requests[details.tabId], 
         tabId: details.tabId, 
         from: 'webRequestListener.js'
      }, function(){
        delete requests[details.tabId];
      });
		}
	}
);
