/**
 * Constant and global variables for devTools.js file
 */

// Panel Creation
const PANEL_NAME = "Dr.FLARE";
const PANEL_LOGO = "img/cloudflare-logo.png";
const PANEL_HTML = "panel.html";

// Current Tab ID
const tabId = chrome.devtools.inspectedWindow.tabId;

// Special popup image request header
const POPUP_IMAGE_REQUEST_HEADER = "dr-flare-popup";

// Panel Open Status
var panelReady = false;

// Popup window Option
var optionDisablePaintingAndPopupCache = false;
var optionDisableURLFilter = false;

// webNavigation.onDOMContentLoaded Event Flag
var onDOMContentLoadedEvent = false;

// For Reset
var bufferNetworkRequests = false;
var networkRequestBuffer = [];
var newUrlOnTab = "";
var currentURL = "";

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

// Hovered image URL
var hoveredImageURL = "";
var hoveredImageRedirectURL = "";

// Customized Key command names in manifest.json
const COPY_POPUP_URL = "toggle-copy-popup-url";

const DISABLE_PAINT_AND_POPUP_OPTION_MESSAGE = "disablePaintAndPopupOption-message";
const DISABLE_URL_FILTER_OPTION_MESSAGE = "disableURLFilterOption-message";