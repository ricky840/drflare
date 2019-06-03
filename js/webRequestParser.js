/** 
  * @desc Parser for webRequest details from webRequestListener.js
  * @required js/global_static.js
*/

// var requests = {}; // Collections of all requests made

// chrome.runtime.onMessage.addListener(
// 	function(message, sender, sendResponse) {
// 		console.log(message);

// 		// Only the messages from webREquestListener.js
// 		if (message.from.match(FROM_WEB_REQUEST_LISTENER)) {
// 			let responseWebRquest = message.webRequest;

// 			switch(message.requestType) {
// 				case ON_SEND_HEADERS:
// 					let request = new WebRequest(message.webRequest);
// 					requests[request.getRequestId()] = request;
// 					break;
// 				case ON_HEADER_RECEIVED:
// 					if (isInRequests(requests, message.webRequest.requestId)) {
// 						requests[responseWebRquest.requestId] = updateResponse(requests[responseWebRquest.requestId], responseWebRquest);
// 					}
// 					break;
// 				case ON_RESPONSE_STARTED:
// 					if (isInRequests(requests, message.webRequest.requestId)) {
// 						requests[responseWebRquest.requestId].setOnResponseStartedTimeStamp(message.webRequest.timeStamp);
// 					}
// 					break;
// 				case ON_COMPLETED:
// 					if (isInRequests(requests, message.webRequest.requestId)) {

// 						requests[responseWebRquest.requestId].setOnCompletedTimeStamp(message.webRequest.timeStamp);

// 						requests[responseWebRquest.requestId].printRequestHeaders();
// 						requests[responseWebRquest.requestId].printResponseHeaders();
// 					}
// 					break;
// 				default:
// 					// Do nothing
// 			}
// 		} else if (message.from.match(FROM_POPUP_JS)) {
// 			console.log("Received a message from popup.js");
// 		}
// });

// function isInRequests(requests, requestId) {
// 	let requestIds = Object.keys(requests);
// 	if (requestIds.length == 1) {
// 		return requestIds == requestId;
// 	}

// 	if (requestId in requestIds) {
// 		return true;
// 	}

// 	return false;
// }

// function updateResponse(oldWebRequest, newWebRequest) {
// 	oldWebRequest.setStatusCode(newWebRequest.statusCode);
// 	oldWebRequest.setOnHeaderReceivedTimeStamp(newWebRequest.timeStamp);
// 	oldWebRequest.setResponseHeaders(newWebRequest.responseHeaders);

// 	return oldWebRequest;
// }
