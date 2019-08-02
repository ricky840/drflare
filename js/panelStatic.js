// Current TabId
var tabId = chrome.devtools.inspectedWindow.tabId;

// Indicator for Onload Event (Navigation page, not panel or devltool)
var pageOnCompleteEventForPanel = false;

// Total Number of Requests
var totalNumberOfRequests = 0;

// Total Number of CF Proxied Requests
var totalNumberOfCfRequests = 0;

// Total Number of None CF Proxied Requests (3rd party requests)
var externalNumberOfRequests = 0;

// Total Number of CF Cached Requests
var cachedNumberOfCfRequests = 0;

// Total Number of UnCached CF CF Requests
var unCachedNumberOfCfRequests = 0;

// % of CF Proxied Requests
var cfProxiedRequestRatio = 0;

// % of CF Cache HIT Requests
var cfCachedRequestRatio = 0;

// % of CF Uncache HIT(MISS) Requests
var cfUnCachedRequestRatio = 0;

// % of None Cloudflare Proxied Request
var externalRequestRatio = 0; 

// Total Bytes
var totalBytes = 0;

// CF Proxied Bytes
var cfProxiedBytes= 0;

// CF Cached Bytes
var cfProxiedByteCached = 0;

// Total Content Type (ObjecType)
var contentTypes = {};

// Routing Count
var routingColo = {};

// var cachableNumberOfRequests = 0;





const CACHED_TABLE_COLUMNS = [
  "requestId", 
  "url", 
  "statusCode", 
  "rayId", 
  "colo", 
  "cfCached"
];

const SUMMARY_TABLE_COLUMNS = [
  "requestId", 
  "url", 
  "statusCode", 
  "rayId", 
  "colo", 
  "cfCached", 
  "polished", 
  "imageResized", 
  "railguned", 
  "minified"
];

