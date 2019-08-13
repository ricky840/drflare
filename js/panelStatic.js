const WAIT_FOR_ONLOAD_EVENT = 4000; // ms
const LOAD_INDICATOR = "img/indicator.gif";
const ROCKET_LOADER_FILE = "rocket-loader.min.js";
const MIRAGE_FILE = "mirage2.min.js";

// Chart objects (only reset when panel is created)
var createdCharts = {};

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

// CF Cached Bytes Cached
var cfProxiedByteCached = 0;

// CF Un-Cached Bytes Cached
var cfProxiedByteUnCached = 0;

// Non Cloudflare Bytes
var externalBytes = 0;

// CF Cached Bytes Ratio
var cfProxiedByteCachedRatio = 0;

// Total Content Type (ObjecType)
var contentTypes = {};

// Total Content Type Uncached
var unCachedContentTypes = {};

// HTTP Version
var httpVersions = {};

// Routing Count
var routingColo = {};

// TTFB CF Cached
var waitingCfCached = [];

// TTFB CF Uncached
var waitingCfUncached = [];

// TTFB Not Proxied
var waitingNotProxied = [];

// For Number of Connections
var connectionIds = [];

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

// Railgun Number of Applied
var numberOfRailgunApplied = 0;

// Railgun Number of Direct Conncted
var numberOfRailgunDirectConnect = 0;

// Railgun Number of Listener Connected
var numberOfRailgunListenerConnect = 0;

// Railgun Origin Times
var railgunOriginTimes = [];

// Railgun TTFB Times for Listener
var railgunTimeToFirstByteTimesListener = [];

// Railgun TTFB Times for Direct
var railgunTimeToFirstByteTimesDirect = [];

// Rocket Loader
var rocketLoaderApplied = false;

// Image Resizer number of applied
var numberOfImageResizerApplied = 0;

// Image Resizer Processing Time
var imageResizerProcessingTimes = [];

// Mirage
var mirageApplied = false;
