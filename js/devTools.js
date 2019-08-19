var tabId = chrome.devtools.inspectedWindow.tabId;
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
var panelReady = false;
var contentInterval = false;


// Reset Trigger
var bufferNetworkRequests = false;
var networkRequestBuffer = [];
var newUrlOnTab = "";

if (tabId) {
  let backgroundPageConnectionPort = chrome.runtime.connect({name: "devtools-page" + "-" + tabId});

  chrome.devtools.panels.create(PANEL_NAME, PANEL_LOGO, PANEL_HTML, function(panel) {
    panelReady = true;
    panel.onSearch.addListener(function(action, queryString) {
      chrome.runtime.sendMessage({
        type: 'search-panel-string',
        action: action, 
        query: queryString,
        tabId: tabId,
        from: 'devtools.js'
      });
    });
  });

  //Network Tab onRequestFinished
  chrome.devtools.network.onRequestFinished.addListener(function(request) {
    if (bufferNetworkRequests) {
      if (!request.request.url.startsWith('data:')) {
        networkRequestBuffer.push(request);
        console.log(`Buffering request ${request.request.url}`);
      }
    } else if (!bufferNetworkRequests) {

      // send buffered requests first
      if (networkRequestBuffer.length > 0) {
        var requestsFiltered = [];
        var saveFlag = false;

        for (let i=0; i < networkRequestBuffer.length; i++) {
          if (networkRequestBuffer[i].request.url == newUrlOnTab) {
            saveFlag = true;
          }
          if (saveFlag) {
            console.log(`Filtered requests (saving) - ${networkRequestBuffer[i].request.url}`);
            requestsFiltered.push(networkRequestBuffer[i]);
          }
        }

        // Send requests to panel
        if (requestsFiltered.length > 0) {
          for (let i=0; i < requestsFiltered.length; i++) {
            sendRequestToPanel(requestsFiltered[i]);
          }
        }

        // Empty buffer
        networkRequestBuffer = [];
      }

      sendRequestToPanel(request);

    }

  });
}

// onRefresh or onUrlChange
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type.match('webnavigation-before-refresh') && tabId == message.tabId) {
    console.log("Buffering turned on");
    bufferNetworkRequests = true;
    newUrlOnTab = message.newUrl;
    console.log(`Entered URL is - ${message.newUrl}`);
    resetDevTools();
  }
  if (message.type.match('page-onDOMContentLoad-event') && tabId == message.tabId) {
    console.log("Buffering turned off");
    console.log(`Bufferered requests: ${networkRequestBuffer.length}`);
    bufferNetworkRequests = false;
  }
});


// onDOMContentLoaded Event 
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type.match('page-onDOMContentLoad-event') && tabId == message.tabId) {  
		console.log("onDOMContentLoad-event");
    // console.log(message.frameId);
    // console.dir(message.message);
    if (message.frameId === 0) { currentURL = message.message.url; }

    if (!contectScriptInjected) {
      console.log("Injecting ContentScript");
      injectContentScript(tabId, message.frameId).then(function() {
        contectScriptInjected = true;
      });
    }
		pageOnCompleteEvent = true;
    if (!timer) {
      console.log('Timer On');
      timer = true;
      startInterval();
    }
  }
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type.match('found-image') && tabId == message.tabId) {
    chrome.tabs.sendMessage(tabId, {
      type: 'found-image-response',
      message: message.message, 
      tabId: tabId
    });
  }
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type.match('reset-previous-image') && tabId == message.tabId) {
    chrome.tabs.sendMessage(tabId, {
      type: 'remove-grey-scale',
      tabId: tabId
    });
  }
});

function startInterval() {
  interval = setInterval(function() { 
    // console.log('timer');
    if (requestObjectsImages.length > 0) {
      if(contectScriptInjected) {
        chrome.tabs.sendMessage(tabId, {type: 'content-script-dom-status', currentURL: currentURL, tabId: tabId, message: 'alive?', from: 'devTools.js'}, function(response) {
          if (response !== undefined && response.result === true) {
            paintedObjectsImages = requestObjectsImages;
            console.log('send image from devTools');
            chrome.tabs.sendMessage(tabId, {type: 'content-script-paint', requests: paintedObjectsImages, tabId: tabId, from: 'devTools.js'});
            requestObjectsImages = [];
          } else {
            console.log("dom is not ready yet");
          }
        });
      }
    }
  }, REFRESH_RATE);
}

// function injectContentScript(tabId) {
function injectContentScript(tabId, frameId) {
  return new Promise(function(resolve, reject) {
    chrome.tabs.sendMessage(tabId, {type: 'content-script-status', tabId: tabId, frameId: frameId, message: 'alive?', from: 'devTools.js'}, function(response) {
      if (response !== undefined && response.result === true) {
        console.log("ContentScript already exists");
        resolve();
      } else {
        chrome.tabs.insertCSS(tabId, {file: "css/overlay.css", allFrames: true}, function() {
          chrome.tabs.executeScript(tabId, {file: 'lib/jquery-3.1.1.min.js', allFrames: true}, function() {
            chrome.tabs.executeScript(tabId, {file: 'js/contentScript.js', allFrames: true}, function() {
              console.log("ContentScript inserted");
              resolve();
            });
          });
        });
      }
    });
  });
}

function resetDevTools() {
  requestObjects = {};
  requestObjectsImages = [];
  paintedObjectsImages = [];
  pageOnCompleteEvent = false;
  contectScriptInjected = false;
  clearInterval(interval);
  timer = false;
  requestId = REQUEST_ID_START;
  contentInterval = false;
}

function sendRequestToPanel(requestObject) {
  requestId += 1;
  let networkRequest = new NetworkRequest(requestId);
  networkRequest.setDetails(requestObject);

  if (panelReady && !networkRequest.url.startsWith('data:')) {
    chrome.runtime.sendMessage({
      type: 'web-request-objects',
      message: networkRequest, 
      tabId: tabId, 
      from: 'webRequestListener.js'
    });

    if (networkRequest.objectType.includes("image") || 
      networkRequest.statusCode === 301 ||
      networkRequest.statusCode === 302) {
      requestObjectsImages.push(networkRequest);
    }
  }
}
