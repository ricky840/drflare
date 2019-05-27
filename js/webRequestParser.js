/** 
  * @desc Parser for webRequest details from webRequestListener.js
*/

// types of webRequest
const ON_SEND_HEADERS = "onSendHeaders"; 
const ON_HEADER_RECEIVED = "onHeaderReceived";
const ON_RESPONSE_STARTED = "onResponseStarted";
const ON_COMPLETED = "onCompleted";

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		// console.log(request);
		// console.log(sender); 

		// TODO Handle each type of webRequest details
});


// Sample `request` from webRequestListener.js

// details:
// frameId: 0
// initiator: "https://durianlovers.cf"
// method: "GET"
// parentFrameId: -1
// requestHeaders: (2) [{…}, {…}]
// requestId: "104010"
// tabId: 401
// timeStamp: 1558960736875.1309
// type: "other"
// url: "https://durianlovers.cf/random.jpg"
// __proto__: Object
// requestType: "onSendHeaders"