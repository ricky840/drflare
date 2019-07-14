'use strict';

var tabId = chrome.devtools.inspectedWindow.tabId;
var requestObjects = {};
var requestObjectsImages = [];
var paintedObjectsImages = [];
var pageOnCompleteEvent = false;
var contectScriptInjected = false;
var urls = [];
var timer = false;
var interval = null;

var injectContentScript = function(tabId) {
  return new Promise(function(resolve, reject) {
    chrome.tabs.sendMessage(tabId, {type: 'content-script-status', tabId: tabId, message: 'alive?', from: 'devTools.js'}, function(response) {
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

var paintElement = function(requests, callback) {
  for (var i=0; i < requests.length; i++) {
    urls.push(requests[i].url);
  }
  chrome.tabs.sendMessage(tabId, {type: 'content-script-paint', requests: requests, urls: urls, tabId: tabId, from: 'devTools.js'});
  urls = [];
  if (callback) {
    callback();
  }
}

if (tabId) {
  let backgroundPageConnectionPort = chrome.runtime.connect({name: "devtools-page" + "-" + tabId});

  chrome.devtools.panels.create(PANEL_NAME, PANEL_LOGO, PANEL_HTML, function(panel) {
    // Panel Created
  });

  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.type.match('web-request-objects') && tabId == message.tabId) {
      let request = message.message;
      requestObjects[request.requestId] = request;
      if (request.objectType === "image" && request.statusCode === 200) {
        requestObjectsImages.push(request);
      }
    }
  });
}

// onRefresh or onUrlChange
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {

  if (message.type.match('tab-updated') && tabId == message.tabId) {
    console.log("Tab Updated (Refreshed) Reset All");
    requestObjects = {};
    requestObjectsImages = [];
    paintedObjectsImages = [];
    pageOnCompleteEvent = false;
    contectScriptInjected = false;
    clearInterval(interval);
    timer = false;
  }
});

// onDOMContentLoaded Event 
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type.match('page-onDOMContentLoad-event') && tabId == message.tabId) {  
		console.log("onDOMContentLoad-event");
    if (!contectScriptInjected) {
      console.log("Injecting ContentScript");
      injectContentScript(tabId).then(function() {
        contectScriptInjected = true;
      });
    }
		pageOnCompleteEvent = true;
    if (!timer) {
      console.log('Timer On');
      timer = true;
      startInterval();
    }
  };
});

function startInterval() {
  interval = setInterval(function() { 
    if (requestObjectsImages.length > 0) {
      if(contectScriptInjected) {
        chrome.tabs.sendMessage(tabId, {type: 'content-script-dom-status', tabId: tabId, message: 'alive?', from: 'devTools.js'}, function(response) {
          if (response !== undefined && response.result === true) {
            paintedObjectsImages = requestObjectsImages;
            requestObjectsImages = [];
            paintElement(paintedObjectsImages);
          } else {
            console.log("dom is not ready yet");
          }
        });
      }
    }
  }, 100);
}
