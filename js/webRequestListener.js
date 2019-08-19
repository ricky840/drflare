



// Collections of requests per tabId 
// ex) tabId => {requestId1: webRequest1, requestId2: webRequest2, ...}
// var requestsHolder = {}; // var requestQueue = {};
// var requests = {};

// onSendHeaders: Before the requests are sent to the network.
// chrome.webRequest.onSendHeaders.addListener(
// 	function(details) {
// 		if (listen && (inspectedTabIds.indexOf(details.tabId) > -1)) {
// 			let request = new WebRequest(details);
//      
// 			if (!isInRequests(requests, details.tabId)) {
// 				requests[details.tabId] = {};
// 			}
//
// 			requests[details.tabId][request.getRequestId()] = request;
// 			console.log(request);
//     }
// 	},
// 	{
// 		urls: ["<all_urls>"]
// 	},
// 	["requestHeaders"]
// )

// onHeadersReceived: First HTTP response header is received.
// chrome.webRequest.onHeadersReceived.addListener(
// 	function(details) {
// 		if (inspectedTabIds.indexOf(details.tabId) > -1) {
// 			if (isInTab(requests[details.tabId], details.requestId)) {
// 				requests[details.tabId][details.requestId].setOnHeaderReceivedTimeStamp(details.timeStamp);
// 				// requests[details.tabId][details.requestId] = updateResponse(requests[details.tabId][details.requestId], details);
// 			}
// 		}
// 	},
// 	{
// 		urls: ["<all_urls>"]
// 	},
// 	["responseHeaders"]
// )


// var ALL_SITES = { urls: ['<all_urls>'] }

// Mozilla doesn't use tlsInfo in extraInfoSpec 
// var extraInfoSpec = ['blocking']; 

// onResponseStarted: For onResponseStarted timestamp.
// chrome.webRequest.onResponseStarted.addListener(
// 	function(details) {
// 		if (inspectedTabIds.indexOf(details.tabId) > -1) {
// 			if (isInTab(requests[details.tabId], details.requestId)) {
// 				requests[details.tabId][details.requestId].setOnResponseStartedTimeStamp(details.timeStamp);
// 			}
// 		}
// 	},
// 	{
// 		urls: ["<all_urls>"]
// 	},
// 	["responseHeaders"]
// );

// onCompleted Request: For onComplete timestamp.
// chrome.webRequest.onCompleted.addListener(
// 	function(details) {
//     let tabId = details.tabId;
//     if (inspectedTabIds.indexOf(tabId) > -1) {
// 			if (isInTab(requests[details.tabId], details.requestId)) {
// 				// console.log(requests[details.tabId][details.requestId]);
//         requests[details.tabId][details.requestId].setOnCompletedTimeStamp(details.timeStamp);
//         requests[details.tabId][details.requestId] = updateResponse(requests[details.tabId][details.requestId], details);
//         // sendRequestObject(requests[details.tabId][details.requestId]);
// 			}
// 		}
// 	 },
// 	{
// 		urls: ["<all_urls>"]
// 	},
// 	["responseHeaders"]
// )




// function addToListener(newTabId, callback) {
// }
//
// function removeFromListner(closedTabId) {
// }
//
// // Panel is ready to receive WebRequests
// chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
//   if (message.type.match('panel-ready')) {  
//     chrome.runtime.sendMessage({
//       type: 'web-requests-array',
//       message: requests[message.tabId], 
//       tabId: message.tabId,
//       from: 'devTools.js'
//     });
//   };
// });

// Testing customized Keyboard shortcut
// chrome.commands.onCommand.addListener(function(command) {
//   if (command.match('toggle-feature-foo')) {
//   	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//   		let currentTab = tabs[0];
//   		// console.log(currentTab);
//   		// reloadPage(currentTab.id);
//   		if (currentTab) {
//   			if (inspectedTabIds.indexOf(currentTab.id) > -1) {
// 	      	reloadPage(currentTab.id);
// 	      }
//   		}
//     });
//   }
// });

// function reloadPage(tabId) {
// 	listen = false;
// 	// console.log('-----Lets reset-----');
// 	chrome.runtime.sendMessage({
// 		type: "reload-shortcut",
// 		tabId: tabId
// 	});
//
// 	requests[tabId] = {};
//
// 	sleep(1000);
//
// 	chrome.tabs.reload(tabId, {bypassCache: true});
// 	listen = true;
// 	// console.log('-----Start Listening again!-----');
// }


// function sleep(milliseconds) {
//   var start = new Date().getTime();
//   for (var i = 0; i < 1e7; i++) {
//     if ((new Date().getTime() - start) > milliseconds){
//       break;
//     }
//   }
// }
// function sendRequestObject(requestObj) {
//   chrome.runtime.sendMessage({
//     type: 'web-request-objects',
//     message: requestObj, 
//     tabId: requestObj.tabId, 
//     from: 'webRequestListener.js'
//   });
// }
