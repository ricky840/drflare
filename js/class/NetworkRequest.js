// types of headers
const CF_CACHE_STATUS_HEADER = "cf-cache-status";
const CF_POLISH_HEADER = "cf-polished";
const CF_BGJ_HEADER = "cf-bgj"; // used for polish
const CF_RAILGUN_HEADER = "cf-railgun";
const CF_IMAGE_RESIZING_HEADER = "cf-resized";
const CF_RAY_HEADER = "cf-ray";
const CACHE_CONTROL_HEADER = "cache-control";
const CONTENT_TYPE_HEADER = "content-type";
const CONTENT_LENGTH_HEADER = "content-length";

const CACHE_STATUS_HIT = "hit";
const CACHE_REVALIDATE = "revalidate";
const CACHE_STALE = "revalidate";

const CACHE_STATUSES = [CACHE_STATUS_HIT, CACHE_REVALIDATE, CACHE_STALE];

class NetworkRequest {
  constructor(requestId) {
    this.requestId = requestId;
    this.method = "";
    this.url = "";
    this.objectType = "";
    this.requestHeaders;
    this.responseHeaders;
    this.statusCode = "";
    this.contentLength = 0;
    this.serverIPAddress = "";

    // connect, dns, receive, send ssl, wait, etc.
    this.timings = "";

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

  setDetails(networkRequest) {
    this.parseRequest(networkRequest.request);
    this.parseResponse(networkRequest.response);
    this.checkCFFeatures();
  }

  parseRequest(networkRequestObject) {
    if (networkRequestObject) {
      this.method = networkRequestObject.method;
      this.url = networkRequestObject.url;
      this.requestHeaders = this.parseHeaders(networkRequestObject.headers);
    }
  }

  parseResponse(networkResponseObject) {
    if (networkResponseObject) {
      this.statusCode = networkResponseObject.status;
      this.objectType = networkResponseObject.content.mimeType;
      this.contentLength = networkResponseObject.content.size;
      this.serverIPAddress = networkResponseObject.serverIPAddress;
      this.responseHeaders = this.parseHeaders(networkResponseObject.headers);
    }
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
