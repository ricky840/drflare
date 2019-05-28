class WebRequest {
	constructor(onSendHeadersWebRequest) {
		this.requestId = onSendHeadersWebRequest.requestId;
		this.method = onSendHeadersWebRequest.method;
		this.url = onSendHeadersWebRequest.url;
		this.requestHeaders = parseHeaders(onSendHeadersWebRequest.requestHeaders);
		this.responseCode;
		this.responseHeaders;

		// Timestamps in Unix time
		this.onSendHeadersTimeStamp = onSendHeadersWebRequest.timeStamp;
		this.onHeaderReceivedTimeStamp;
		this.onResponseStartedTimeStamp; // Do we need this?
		this.onCompletedTimeStamp;
	}

	parseHeaders(webRequest) {
		let headers = {};
	}

	getRequestId() { return this.requestId; }
	getMethod() { return this.method; }
	getUrl() { return this.rul; }
	getRequestHeaders() { return this.requestHeaders; }
	getResponseCode() { return this.responseCode; }
	getResponseHeaders() { return this.responseHeaders; }
	getTTFB() { return "TODO getTTFB"; }
}