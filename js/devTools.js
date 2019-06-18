'use strict';

const PANEL_NAME = "Cloudflare Debugger";
const PANEL_LOGO = "img/cloudflare-logo.png";
const PANEL_HTML = "panel.html";

const TABLE_ELEMENTS = ["requestId", "rayId", "url", "cache", "railgun", "polish"];

var paintTargets = [];
let tabId = chrome.devtools.inspectedWindow.tabId;

var table;
var win;

if (tabId) {
  let backgroundPageConnectionPort = chrome.runtime.connect({name: "devtools-page" + "-" + tabId});
  

  chrome.devtools.panels.create(PANEL_NAME, PANEL_LOGO, PANEL_HTML, function(panel) {
    // Panel Created
  });

  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.type.match('web-request-objects') && tabId == message.tabId) { 
      console.log(message.message);
      let webRequests = message.message;
      var paintTargetUrls = [];
      for (var requestId in webRequests) {
        let request = webRequests[requestId];
        if (request.objectType === "image" && request.tabId === tabId) {
          paintTargetUrls.push(request.url);
        } 
      }
      if (paintTargetUrls.length > 0) paintElement(paintTargetUrls, tabId);
    }
  });
}

var paintElement = function(urls, tabId) {
  injectContentScript(tabId).then(function() {
    chrome.tabs.sendMessage(tabId, {type: 'content-script-paint', urls: urls, from: 'devTools.js'});
  });
}


var injectContentScript = function(tabId) {
  return new Promise(function(resolve, reject) {
    chrome.tabs.sendMessage(tabId, {type: 'content-script-status', message: 'alive?', from: 'devTools.js'}, function(response) {
      if (response !== undefined && response.result === true) {
        console.log("ContentScript already exists");
        resolve();
      } else {
        chrome.tabs.insertCSS(tabId, {file: "css/overlay.css"}, function() {
          chrome.tabs.executeScript(tabId, {file: 'lib/jquery-3.1.1.min.js'}, function() {
            chrome.tabs.executeScript(tabId, {file: 'js/contentScript.js'}, function(){
              console.log("ContentScript inserted");
              resolve();
            });
          });
        });
      }
    });
  });
}











