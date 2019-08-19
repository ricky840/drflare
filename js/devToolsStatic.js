// Panel Creation
const PANEL_NAME = "Doctorflare";
const PANEL_LOGO = "img/cloudflare-logo.png";
const PANEL_HTML = "panel.html";

// Current Tab ID
var tabId = chrome.devtools.inspectedWindow.tabId;

// Panel Open Status
var panelReady = false;

// For Reset
var bufferNetworkRequests = false;
var networkRequestBuffer = [];
var newUrlOnTab = "";




var currentURL = "";

var requestObjects = {};

var requestObjectsImages = [];
var paintedObjectsImages = [];
var pageOnCompleteEvent = false;
var contectScriptInjected = false;
var timer = false;
var interval = null;

const REQUEST_ID_START = 1000;
var requestId = REQUEST_ID_START;
const REFRESH_RATE = 300;
var contentInterval = false;


