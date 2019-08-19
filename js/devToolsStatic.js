// Panel Creation
const PANEL_NAME = "Doctorflare";
const PANEL_LOGO = "img/cloudflare-logo.png";
const PANEL_HTML = "panel.html";

// Current Tab ID
const tabId = chrome.devtools.inspectedWindow.tabId;

// Panel Open Status
var panelReady = false;

// webNavigation.onDOMContentLoaded Event Flag
var onDOMContentLoadedEvent = false;

// For Reset
var bufferNetworkRequests = false;
var networkRequestBuffer = [];
var newUrlOnTab = "";

// For Content Script
var contectScriptInjected = false;

// Image Objects (Paint Targets)
var requestObjectsImages = [];
var paintedObjectsImages = [];

// For Painting Interval
var timer = false;
var interval = null;

// Painting Interval in ms
const REFRESH_RATE = 300;

// Request ID Start Point
const REQUEST_ID_START = 1000;
var requestId = REQUEST_ID_START;
