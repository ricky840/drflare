const LOAD_INDICATOR = "img/indicator.gif";
const ROCKET_LOADER_FILE = "rocket-loader.min.js";
const MIRAGE_FILE = "mirage2.min.js";
const WAIT_FOR_ONLOAD_EVENT = 4000;
const CHARTS_UPDATE_INTERVAL = 3000;
const DATATABLE_DEFAULT_NUM_ROWS = 25;
const CHARTS = [
  'js/charts/requestCountBarChart.js',
  'js/charts/byteSavedByCachedRatioChart.js',
  'js/charts/proxiedRequestRatioChart.js',
  'js/charts/routingColoChart.js',
  'js/charts/totalContentTypeChart.js',
  'js/charts/unCachedContentTypeChart.js',
  'js/charts/httpVersionChart.js',
  'js/charts/imgPolishByteSaveChart.js'
];

// Current TabId
const tabId = chrome.devtools.inspectedWindow.tabId;

// All request objects
var allRequestObjects = {};

// Chart objects (only reset when panel is created)
var createdCharts = {};

// Indicator for Onload(OnCompleted) Event
var pageOnCompleteEventForPanel = false;

// Chart update timer
var chartTimer = null;

var totalNumberOfRequests = 0;                      // Total number of requests
var totalNumberOfCfRequests = 0;                    // Total number of Cloudflare proxied requests
var externalNumberOfRequests = 0;                   // Total number of Non-Cloudflare requests (External/3rd party requests)
var cachedNumberOfCfRequests = 0;                   // Total number of Cloudflare cached requests
var unCachedNumberOfCfRequests = 0;                 // Total number of Cloudflare cache MISS requests

var cfProxiedRequestRatio = 0;											// Ratio Cloudflare proxied requests
var cfCachedRequestRatio = 0;                       // Ratio Cloudflare cache HIT requests
var cfUnCachedRequestRatio = 0;                     // Ratio Cloudflare cache MISS requests
var externalRequestRatio = 0;                       // Ratio External requests

var totalBytes = 0;                                 // Total Bytes
var cfProxiedBytes= 0;                              // Cloudflare proxied total bytes
var cfProxiedByteCached = 0;                        // Cloudflare cached total bytes
var cfProxiedByteUnCached = 0;                      // Cloudflare cache MISS bytes
var externalBytes = 0;                              // External requests total bytes
var cfProxiedByteCachedRatio = 0;                   // Ratio Cloudflare cached bytes

var contentTypes = {};                              // Content Types all
var unCachedContentTypes = {};                      // Content Types Cache MISS
var httpVersions = {};                              // HTTP Versions
var routingColo = {};                               // Routing Colos

var waitingCfCached = [];                           // Cloudflare cached TTFB
var waitingCfUncached = [];                         // Cloudflare cache MISS TTFB
var waitingNotProxied = [];                         // External TTFB 

var connectionIds = [];                             // Uniq Connections

var autoMinifyOriginal = [];                        // Auto-Minify original sizes
var autoMinifyOptimized = [];                       // Auto-Minify minified sizes
var autoMinifyNumberOfRequest = 0;                  // Auto-Minify number of requests

var numberOfPolishedImages = 0;                     // Image Polish number of requests
var numberOfPolishedImagesFormatConverted = 0;      // Image Polish number of requests (format converted)
var imagePolishOriginal = [];                       // Image Polish original sizes
var imagePolishOptimized = [];                      // Image Polish optimized sizes

var numberOfRailgunApplied = 0;                     // Railgun number of applied requests
var numberOfRailgunDirectConnect = 0;               // Railgun number of direct connections
var numberOfRailgunListenerConnect = 0;             // Railgun number of listener connections
var railgunOriginTimes = [];                        // Railgun origin times (origin connect delays)
var railgunTimeToFirstByteTimesListener = [];       // Railgun TTFB for listener connection requests
var railgunTimeToFirstByteTimesDirect = [];         // Railgun TTFB for direct connection requests

var numberOfImageResizerApplied = 0;                // Image Resizer number of applied requests
var imageResizerProcessingTimes = [];               // Image Resizer processing times

var mirageApplied = false;                          // Mirage applied
var rocketLoaderApplied = false;                    // RocketLoader applied
