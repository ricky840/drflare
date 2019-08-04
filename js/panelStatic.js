const WAIT_FOR_ONLOAD_EVENT = 4000; // ms
const LOAD_INDICATOR = "img/indicator.gif";

// Event Flags ------------------------------------------------------------
//
// Indicator for Onload Event (Navigation page, not panel or devltool)
var pageOnCompleteEventForPanel = false;

// Current TabId
var tabId = chrome.devtools.inspectedWindow.tabId;

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

// Total Content Type Uncached
var unCachedContentTypes = {};

// Routing Count
var routingColo = {};

// TTFB CF Cached
var waitingCfCached = [];

// TTFB CF Uncached
var waitingCfUncached = [];

// TTFB Not Proxied
var waitingNotProxied = [];

// Auto Minify Original Size
var autoMinifyOriginal = [];

// Auto Minify Minified Size
var autoMinifyOptimized = [];

// Auto Minify Number of Requests
var autoMinifyNumberOfRequest = 0;

// Image Polish Number of Requests
var numberOfPolishedImages = 0;

// Image Polish Number of Requests (format converted)
var numberOfPolishedImagesFormatConverted = 0;

// Image Polish Original Size
var imagePolishOriginal = [];

// Image Polish Optimized Size
var imagePolishOptimized = [];








// Tables
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

