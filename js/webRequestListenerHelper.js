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


function isInRequests(requests, tabId) {
	for (let id in requests) {
		if (id == tabId) return true;
	}

	return false;
}

function isInTab(tab, requestId) {
	for (let id in tab) {
		if (id == requestId) return true;
	}

	return false;
}

function updateResponse(oldWebRequest, newWebRequest) {
	oldWebRequest.setStatusCode(newWebRequest.statusCode);
	// oldWebRequest.setOnHeaderReceivedTimeStamp(newWebRequest.timeStamp);
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
		message.tabId,
		{
			type: this.type,
			message: this.message,
			from: this.from
		}
	)
}

function printRequests() {
	console.log("----ALL REQUESTS----");
	for (let tabId in requests) {
		console.log(`request Length: ${Object.keys(requests[tabId]).length}`);
		console.log("--Tab Start--")
		for (let requestId in requests[tabId]) {
			console.log(`requestId: ${requestId}`);
			console.log(requests[tabId][requestId]);
		}
		console.log("--Tab End--")
	}
	console.log("----END----");
}
