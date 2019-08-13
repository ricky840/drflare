// types of headers
const CF_CACHE_STATUS_HEADER = "cf-cache-status";
const CF_POLISH_HEADER = "cf-polished";
const CF_BGJ_HEADER = "cf-bgj"; // used for minification / image polish / mirage? no..
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
    this.cfCacheStatus = "";
    this.httpVersion = "";
    this.connectionId = "";

    // Timings
    this.timingBlocked = 0;
    this.timingConnect = 0;
    this.timingDns = 0;
    this.timingReceive = 0;
    this.timingSend = 0;
    this.timingSsl = 0;
    this.timingWait = 0;
    this.timingTotal = 0;

    // CF features
    this.cfCached = false;
    this.cached = false; // Might be used for broswer cache
    this.bgjed = false;
    this.railguned = false;
    this.polished = false;
    this.imageResized = false;
    this.imagePolished = false;
    this.minified = false;
    this.rayId = "";
    this.colo = "";

    // Image Polish
    this.origSize = 0; // origSize is shared with minify and polish
    this.imagePolishOrigFmt = "";
    this.imagePolishStatus = "";
    this.imagePolishQuality = "";

    // Railgun
    this.railgunOptimized = false;
    this.railgunDirectConnected = false;
    this.railgunOptimizedRequestId = "";
    this.railgunOptimizedComRatio = 0;
    this.railgunOptimizedFetchLatency = 0;
    this.railgunOptimizedStatus = 0;
    this.railgunOptimizedListenerVersion = 0;

    // Image Resizer
    this.imageResizerInternalStatus = "";
    this.imageResizerTotalTime = 0;
    this.imageResizerProcessTime = 0;
    this.imageResizerVersion = "";
  }

  setDetails(networkRequest) {
    this.serverIPAddress = networkRequest.serverIPAddress;
    this.connectionId = networkRequest.connection;
    this.parseRequest(networkRequest.request);
    this.parseResponse(networkRequest.response);
    this.setTimings(networkRequest);
    this.checkCFFeatures();
    if (this.polished) this.parseCfPolishedHeader(this.responseHeaders[CF_POLISH_HEADER]);
    if (this.railguned) this.parseCfRailgunHeader(this.responseHeaders[CF_RAILGUN_HEADER]);
    if (this.imageResized) this.parseCfImageResizerHeader(this.responseHeaders[CF_IMAGE_RESIZING_HEADER]);
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
      // this.statusCode = networkResponseObject.status;
      this.statusCode = (networkResponseObject.status != 0) ? networkResponseObject.status : networkResponseObject._error;
      this.objectType = networkResponseObject.content.mimeType;
      this.contentLength = networkResponseObject.content.size;
      this.httpVersion = networkResponseObject.httpVersion.toLowerCase();
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

  parseCfPolishedHeader(headerValue) {
    // Cf-Polished: origSize=74088, status=webp_bigger, origFmt=jpeg
    let items = headerValue.split(",");
    for (let i=0; i < items.length; i++) {
      let item = items[i].trim();
      if (item.match('origSize=')) {
        this.origSize = parseInt(item.split("=")[1]); 
      } else if (item.match('origFmt=')) {
        this.imagePolishOrigFmt = item.split("=")[1];
      } else if (item.match('status=')) {
        this.imagePolishStatus = item.split("=")[1];
      }
    }
  }

  parseCfRailgunHeader(headerValue) {
    // Cf-Railgun: direct (starting new WAN connection)
    // Cf-Railgun: 70b3263f64 99.99 0.002952 0030 57da
    if (headerValue.match('direct')) {
      this.railgunDirectConnected = true;
    } else {
      this.railgunOptimized = true;
      let items = headerValue.trim().split(" ");
      if (items.length == 5) {
        this.railgunOptimizedRequestId = items[0].trim();
        this.railgunOptimizedComRatio = items[1].trim();
        this.railgunOptimizedFetchLatency = parseFloat(items[2].trim());
        this.railgunOptimizedStatus = items[3].trim();
        this.railgunOptimizedListenerVersion = items[4].trim();
      }
    }
  }

  parseCfImageResizerHeader(headerValue) {
    // cf-resized: internal=ok/MISS n=592 t=0.732 v=2019.7.4
    // cf-resized: err=9408
    let items = headerValue.trim().split(" ");
    if (items.length == 4) {
      this.imageResizerInternalStatus = items[0].split("=")[1];
      this.imageResizerTotalTime = parseFloat(items[1].split("=")[1]);
      this.imageResizerProcessTime = parseFloat(items[2].split("=")[1]);
      this.imageResizerVersion = items[3].split("=")[1];
    }
  }

  setTimings(networkRequest) {
    this.timingBlocked = networkRequest.timings.blocked;
    this.timingConnect = networkRequest.timings.connect;
    this.timingDns = networkRequest.timings.dns;
    this.timingReceive = networkRequest.timings.receive;
    this.timingSend = networkRequest.timings.send;
    this.timingSsl = networkRequest.timings.ssl;
    this.timingWait = networkRequest.timings.wait;
    this.timingTotal = networkRequest.time;
  }

  checkCFFeatures() {
    for (let header in this.responseHeaders) {
      let headerValue = (this.responseHeaders[header].trim()).toLowerCase();
      switch(header) {
        case CF_CACHE_STATUS_HEADER:
          this.cfCacheStatus = headerValue;
          if (CACHE_STATUSES.indexOf(headerValue) > -1) {
            this.cfCached = true;
          }
          break;
        case CF_POLISH_HEADER:
          this.polished = true;
          break;
        case CF_BGJ_HEADER:
          this.bgjed = true;
          if (headerValue == "minify") {
            this.minified = true;
          } else if (headerValue.match('imgq:')) {
            this.imagePolishQuality = headerValue;
            this.imagePolished = true;
          }
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
          this.contentLength = parseInt(this.responseHeaders[header]);
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
