/** 
  * @desc Listener for all webRequest API
  * 			WebRequest's Life Cycle: https://developer.chrome.com/extensions/webRequest
*/

// Global variables for webRequestListener
var selectedTabId;
var readRequests = false;
var requests = {}; // Collections of all requests made

// onSendHeaders: Before the requests are sent to the network.
chrome.webRequest.onSendHeaders.addListener(
	function(details) {
    if (isActiveTab(details)) {
			let request = new WebRequest(details);
			requests[request.getRequestId()] = request;
			// printRequestLog('onSendHeaders', details);
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
		if (isActiveTab(details)) {
			if (isInRequests(requests, details.requestId)) {
				requests[details.requestId] = updateResponse(requests[details.requestId], details);
				// printRequestLog('onHeadersReceived', details);
			}
		}
	},
	{
		urls: ["<all_urls>"]
	},
	["responseHeaders"]
)

// onResponseStarted: Response Listener
chrome.webRequest.onResponseStarted.addListener(
	function(details) {
		if (isActiveTab(details)) {
			if (isInRequests(requests, details.requestId)) {
				requests[details.requestId].setOnResponseStartedTimeStamp(details.timeStamp);
				// printRequestLog('onResponseStarted', details);
			}
		}
	},
	{
		urls: ["<all_urls>"]
	},
	["responseHeaders"]
);

// onCompleted: Response Listener
chrome.webRequest.onCompleted.addListener(
	function(details) {
		if (isActiveTab(details)) {
			if (isInRequests(requests, details.requestId)) {
				requests[details.requestId].setOnCompletedTimeStamp(details.timeStamp);
				// printRequestLog('onCompleted', details);

				// Send message to background.js or contentScript.js
				// sendMessage('web-request-object', requests[details.requestId], 'webRequestListener.js');
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

chrome.runtime.onMessage.addListener(
	function(message, sender, sendResponse) {
		if (message.from.match(FROM_POPUP_JS)) {
			printRequests();
		}
	}
)

// Reset 
chrome.webNavigation.onBeforeNavigate.addListener(
	function(details) {
		// console.log('onBeforeNavigate log:');
		// console.log(details);
		if (isActiveTab(details)) {
			this.resetRequests();
		}
	}
);
