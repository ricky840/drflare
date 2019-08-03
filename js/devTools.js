var tabId = chrome.devtools.inspectedWindow.tabId;
var currentURL = "";
var requestObjects = {};
var requestObjectsImages = [];
var paintedObjectsImages = [];
var pageOnCompleteEvent = false;
var contectScriptInjected = false;
var timer = false;
var interval = null;
var requestId = 0;
const REFRESH_RATE = 300;

var contentInterval = false;

if (tabId) {
  let backgroundPageConnectionPort = chrome.runtime.connect({name: "devtools-page" + "-" + tabId});

  chrome.devtools.panels.create(PANEL_NAME, PANEL_LOGO, PANEL_HTML, function(panel) {
    // Panel Created
  });

  //Network Tab onRequestFinished
  chrome.devtools.network.onRequestFinished.addListener(function(request) {
    requestId += 1;
    let networkRequest = new NetworkRequest(requestId);

    console.dir(request);
    networkRequest.setDetails(request);

    if (!networkRequest.url.startsWith('data:')) {
      chrome.runtime.sendMessage({
        type: 'web-request-objects',
        message: networkRequest, 
        tabId: tabId, 
        from: 'webRequestListener.js'
      });

      requestObjects[networkRequest.requestId] = networkRequest;
      if (networkRequest.objectType.includes("image") && networkRequest.statusCode === 200) {
        requestObjectsImages.push(networkRequest);
      }
    }
  });
}

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

// onRefresh or onUrlChange
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type.match('tab-updated') && tabId == message.tabId) {
    console.log("Tab Updated (Refreshed) Reset All");
    resetDevTools();
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

function startInterval() {
  interval = setInterval(function() { 
    if (requestObjectsImages.length > 0) {
      if(contectScriptInjected) {
        chrome.tabs.sendMessage(tabId, {type: 'content-script-dom-status', currentURL: currentURL, tabId: tabId, message: 'alive?', from: 'devTools.js'}, function(response) {
          if (response !== undefined && response.result === true) {
            paintedObjectsImages = requestObjectsImages;
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
  requestId = 0;
  contentInterval = false;
}
