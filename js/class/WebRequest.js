var WebRequest = class {
	constructor(onSendHeadersWebRequest) {
		this.requestId = onSendHeadersWebRequest.requestId;
		this.tabId = onSendHeadersWebRequest.tabId;
		this.method = onSendHeadersWebRequest.method;
		this.url = onSendHeadersWebRequest.url;
    this.objectType = onSendHeadersWebRequest.type;
		this.requestHeaders = this.parseHeaders(onSendHeadersWebRequest.requestHeaders);
		this.statusCode;
		this.responseHeaders;
		this.contentLength = 0;

		// Timestamps in Unix time
		this.onSendHeadersTimeStamp = onSendHeadersWebRequest.timeStamp;
		this.onHeaderReceivedTimeStamp;
		this.onResponseStartedTimeStamp; // Do we need this?
		this.onCompletedTimeStamp;

		// CF features
		this.cfCached = false;
		this.cached = false; // Might be used for broswer cache
		this.bgjed = false;
		this.railguned = false;
		this.polished = false;
		this.imageResized = false;
		this.minified = false;
		this.rayId = "";
		this.colo = "";
	}

	parseHeaders(webRequestHeaders) {
		let headers = {};
		let nonParsedHeaders = Object.values(webRequestHeaders);

		for (let header in nonParsedHeaders) {
			header = nonParsedHeaders[header];
			headers[header['name'].toLowerCase()] = header['value'];
		}

		return headers;
	}

	checkCFFeatures() {
		for (let header in this.responseHeaders) {
			switch(header) {
				case CF_CACHE_STATUS_HEADER:
					if (CACHE_STATUSES.indexOf(this.responseHeaders[header].toLowerCase()) > -1) {
						this.cfCached = true;
					}
					break;
				case CF_POLISH_HEADER:
					this.polished = true;
					break;
				case CF_BGJ_HEADER:
					this.bgjed = true;
					break;
				case CF_RAILGUN_HEADER:
					this.railguned = true;
					break;
				case CF_IMAGE_RESIZING_HEADER:
					this.imageResized = true;
					break;
				case CF_RAY_HEADER:
					let rayIds = this.responseHeaders[header].split("-");
					this.rayId = rayIds[0];
					this.colo = rayIds[1];
					break;
				case CACHE_CONTROL_HEADER:
					// TODO
					break;
				case CONTENT_TYPE_HEADER:
					// TODO
					break;
				case CONTENT_LENGTH_HEADER:
					// TODO
					this.contentLength = this.responseHeaders[header];
					break;
				default:
					// Do nothing
			}
		}
	}

	// Getters
	getRequestId() { return this.requestId; }
	getMethod() { return this.method; }
	getURL() { return this.rul; }
	getRequestHeaders() { return this.requestHeaders; }
	getStatusCode() { return this.statusCode; }
	getResponseHeaders() { return this.responseHeaders; }
	getTabId() { return this.tabId; }
	getTTFB() { return "TODO getTTFB"; }
	getRayId() { return this.rayId; }
	getColo() { return this.colo; }
	getContentLength() { return this.contentLength; }

	// Setters
	setStatusCode(statusCode) { this.statusCode = statusCode; }
	setOnHeaderReceivedTimeStamp(time) { this.onHeaderReceivedTimeStamp = time; }
	setOnResponseStartedTimeStamp(time) { this.onResponseStartedTimeStamp = time; }
	setOnCompletedTimeStamp(time) { this.onCompletedTimeStamp = time; }
	setResponseHeaders(responseHeaders) {
		this.responseHeaders = this.parseHeaders(responseHeaders);
	}

	// Is each feature enabled
	isCfCached() { return this.cfCached; }
	isCached() { return this.cached; }
	isRailguned() { return this.railguned; }
	isPolished() { return this.polished; }
	isImageResized() { return this.imageResized; }

	printRequestHeaders() {
		console.log('RequestHeaders');
		for (let header in this.requestHeaders) {
			console.log(`${header}: ${this.requestHeaders[header]}`);
		}
	}

	printResponseHeaders() {
		console.log('ResponseHeaders');
		for (let header in this.responseHeaders) {
			console.log(`${header}: ${this.responseHeaders[header]}`);
		}
	}
}
