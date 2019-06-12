const PANEL_NAME = "Cloudflare Debugger";
const PANEL_LOGO = "img/cloudflare-logo.png";
const PANEL_HTML = "panel.html";

var paintTargets = [];

let tabId = chrome.devtools.inspectedWindow.tabId;

if (tabId) {
  // Create a connection to the background page
  var backgroundPageConnectionPort = chrome.runtime.connect({name: "devtools-page" + "-" + tabId});
  backgroundPageConnectionPort.onMessage.addListener(function(message) {
    if (message.refresh) {
      console.log("listener is on " + message.tabUrl + " refreshing the page: " + tabId);
      let tabUrl = message.tabUrl;

      chrome.webNavigation.onCompleted.addListener(function(details) {
        if (details.tabId == tabId) {
          console.log("Refreshed completed, lets paint");
          injectContentScript(tabId);
        }
      }, { url: [{urlEquals: tabUrl}] });

      // chrome.devtools.inspectedWindow.reload({ignoreCache: true});
    }
  });
}

chrome.devtools.panels.create(PANEL_NAME, PANEL_LOGO, PANEL_HTML, function(panel) {
  //
});

var paintElement = function(tabId) {
  chrome.tabs.sendMessage(tabId, {type: 'content-script-paint', message: 'hello', from: 'devTools.js'}, function(response) {
    // console.log(response);
  });
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type.match('web-request-object')) { console.log(message.message); }

   // let url = message.message.url;
   // let objType = message.message.type;
  // if (objType == "image") {
  //   paintElement(tabId);
  // }
   // console.log(type + " " + url);
});




function injectContentScript(tabId) {
  chrome.tabs.sendMessage(tabId, {type: 'content-script-status', message_type: 'String', message: 'alive?', from: 'devTools.js'}, function(response) {
    if (response !== undefined && response.result === true) {
      console.log("contentScript already exists");
      paintElement(tabId);
    } else {
      chrome.tabs.insertCSS(tabId, {file: "css/overlay.css"}, function() {
        chrome.tabs.executeScript(tabId, {file: 'lib/jquery-3.1.1.min.js'}, function() {
          chrome.tabs.executeScript(tabId, {file: 'js/contentScript.js'}, function(){
            console.log("contentScript inserted");
            paintElement(tabId);
          });
        });
      });
    }
  });
}
