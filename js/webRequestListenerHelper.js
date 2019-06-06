/**
  * @desc check if an incoming webRequest is from the current active tab.
  * @param string $requestType - type of webRequest (onSendHeaders and etc.)
	* @return boolean
*/
function isActiveTab(requestDetails) {
	if (requestDetails) {
		if (!selectedTabId) { //null handling case
			chrome.tabs.query({
				active:true,
				currentWindow:true
			},function(tab) {
				if (tab !== undefined && tab.length != 0) {
					selectedTabId = tab[0].id;
				}
			})
		}

		if (requestDetails.tabId == selectedTabId) {
	    	return true;
	    }
	}

	return false;
}

function isInRequests(requests, requestId) {
	let requestIds = Object.keys(requests);
	if (requestIds.length == 1) {
		return requestIds == requestId;
	}

	if (requestIds.includes(requestId)) {
		return true;
	}

	return false;
}

function updateResponse(oldWebRequest, newWebRequest) {
	oldWebRequest.setStatusCode(newWebRequest.statusCode);
	oldWebRequest.setOnHeaderReceivedTimeStamp(newWebRequest.timeStamp);
	oldWebRequest.setResponseHeaders(newWebRequest.responseHeaders);
	oldWebRequest.checkCFFeatures();
	return oldWebRequest;
}

/**
  * @desc print webRequest details for debugging purpose
  * @param string $requestType - type of webRequest (onSendHeaders and etc.)
  * @param object $details - webRequest object
*/
function printRequestLog(requesType, details) {
	console.log(requesType);
	console.log(details);
}

/**
  * @desc send webRequest webRequest object to webRequestParser.js (content_script)
  * @param string $requestType - type of webRequest (onSendHeaders and etc.)
  * @param object $details - webRequest object
*/
function sendMessage(type, message, from) {
	chrome.tabs.sendMessage(
		details.tabId,
		{
			type: this.type,
			message: this.message,
			from: this.from
		}
	)
}

function printRequests() {
	console.log("----REQUESTS----");
	for (let requestId in requests) {
		console.log(`requestId: ${requestId}`);
		console.log(requests[requestId]);
	}
	console.log("----END----");
}

function resetRequests() {
	this.requests = {};
}