const FROM_WEB_REQUEST_LISTENER = "webRequestListener.js";
const FROM_POPUP_JS = "popup.js";

// types of webRequest
const ON_SEND_HEADERS = "onSendHeaders"; 
const ON_HEADER_RECEIVED = "onHeaderReceived";
const ON_RESPONSE_STARTED = "onResponseStarted";
const ON_COMPLETED = "onCompleted";

// types of headers
const CF_CACHE_STATUS_HEADER = "cf-cache-status";
const CF_POLISH_HEADER = "cf-polished";
const CF_BGJ_HEADER = "cf-bgj"; // used for polish
const CF_RAILGUN_HEADER = "cf-railgun";
const CF_IMAGE_RESIZING_HEADER = "cf-resized";
const CF_RAY_HEADER = "cf-ray";
const CACHE_CONTROL_HEADER = "cache-control";
const CONTENT_TYPE_HEADER = "content-type";

const CACHE_STATUS_HIT = "hit";