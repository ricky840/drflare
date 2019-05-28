/** 
  * @desc Parser for webRequest details from webRequestListener.js
*/

import { WebRequest } from './class/WebRequest';

const FROM_WEB_REQUEST_LISTENER = "webRequestListener";

// types of webRequest
const ON_SEND_HEADERS = "onSendHeaders"; 
const ON_HEADER_RECEIVED = "onHeaderReceived";
const ON_RESPONSE_STARTED = "onResponseStarted";
const ON_COMPLETED = "onCompleted";

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {

		// Only the messages from webREquestListener.js
		if (request.from.match(FROM_WEB_REQUEST_LISTENER)) { 
			if (request.requestType.match(ON_SEND_HEADERS)) {
				// TODO figure out how to export and import WebRequest class.
				// const w = new WebRequest(request.details);
				// console.log(w);
			} else if (request.requestType.match(ON_HEADER_RECEIVED)) {

			} else if (request.requestType.match(ON_RESPONSE_STARTED)) {

			} else if (request.requestType.match(ON_COMPLETED)) {

			}
		}
		
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