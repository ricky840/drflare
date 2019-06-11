let tabId = chrome.devtools.inspectedWindow.tabId;

const PANEL_NAME = "Cloudflare Debugger";
const PANEL_LOGO = "img/cloudflare-logo.png";
const PANEL_HTML = "panel.html";

chrome.devtools.panels.create(PANEL_NAME, PANEL_LOGO, PANEL_HTML,
  function(panel) {
    if (tabId) {
      // Create a connection to the background page
      var backgroundPageConnectionPort = chrome.runtime.connect({name: "devtools-page" + "-" + tabId});
      backgroundPageConnectionPort.onMessage.addListener(function(message) {
        if (message.refresh) {
          console.log("listener is on, refreshing the page: " + tabId);
          chrome.devtools.inspectedWindow.reload({ignoreCache: true});
        }
      });

      chrome.tabs.sendMessage(tabId, {type: 'content-script-status', message_type: 'String', message: 'alive?', from: 'devTools.js'}, function(response) {
        if (response !== undefined && response.result === true) {
          console.log("contentScript already exists");
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
  });

var paintElement = function(tabId) {
  chrome.tabs.sendMessage(tabId, {type: 'content-script-paint', message: 'hello', from: 'devTools.js'}, function(response) {
    // console.log(response);
  });
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type !== 'web-request-object') return;
   // let url = message.message.url;
   // let objType = message.message.type;
   // console.log(type + " " + url);
});



chrome.storage.local.get('inspectedWindowTabIds', function(data) {
  var tabIds = data['inspectedWindowTabIds'];
  console.log("fdafas");
});









