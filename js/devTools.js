'use strict';

const PANEL_NAME = "Cloudflare Debugger";
const PANEL_LOGO = "img/cloudflare-logo.png";
const PANEL_HTML = "panel.html";

let tabId = chrome.devtools.inspectedWindow.tabId;

var requestObjects = {};
var requestObjectsImages = [];
var pageOnCompleteEvent = false;

if (tabId) {
  let backgroundPageConnectionPort = chrome.runtime.connect({name: "devtools-page" + "-" + tabId});

  chrome.devtools.panels.create(PANEL_NAME, PANEL_LOGO, PANEL_HTML, function(panel) {
    // Panel Created
  });

  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.type.match('web-request-objects') && tabId == message.tabId) { 
      let request = message.message;
      console.log("Request Object Delivered: "+ request.url + " " + request.objectType);

      requestObjects[request.requestId] = request;
      console.log("Total requests updated: " + Object.keys(requestObjects).length + " " + request.requestId);

      if (request.objectType === "image") {
        if (pageOnCompleteEvent) {
          injectContentScript(tabId).then(function() {
            paintElement([request]);
          }); 
        } else {
          requestObjectsImages.push(request);
        }
      }
    }
  });
}

// Before the page gets refreshed
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type.match('webnavigation-before-refresh') && tabId == message.tabId) {  
    console.log("request object reset: " + Object.keys(requestObjects).length + "-----------------------------------------------------------------------------------------111111111111");
    requestObjects = {}; requestObjectsImages = [];
    pageOnCompleteEvent = false;
    console.log("request object reset: " + Object.keys(requestObjects).length + "-----------------------------------------------------------------------------------------22222222222");
  };
});

// when page onload-event happnes
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type.match('page-onload-event') && tabId == message.tabId) {  

    pageOnCompleteEvent = true;

    console.log("onload event!!!!! let's paint --------------------------------------------------------------------------------------------");

    injectContentScript(tabId).then(function() {
      paintElement(requestObjectsImages, function() {
        console.log("resetting requestObjectsImages");
        requestObjectsImages = [];
      });
    });

  };
});

var paintElement = function(requests, callback) {
  var urls = [];
  for (var i=0; i < requests.length; i++) {
    urls.push(requests[i].url);
  }
  chrome.tabs.sendMessage(tabId, {type: 'content-script-paint', urls: urls, from: 'devTools.js'});
  if (callback) {
    callback();
  }
}

var injectContentScript = function(tabId) {
  return new Promise(function(resolve, reject) {
    chrome.tabs.sendMessage(tabId, {type: 'content-script-status', message: 'alive?', from: 'devTools.js'}, function(response) {
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
