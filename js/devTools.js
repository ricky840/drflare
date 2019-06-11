chrome.devtools.panels.create("Cloudflare Debugger", "img/cloudflare-logo.png", "panel.html",
  function(panel) {
    let tabId = chrome.devtools.inspectedWindow.tabId;
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
              });
            });
          });
        }
      });
    }
  });

var paintElement = function() {

}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type !== 'web-request-object') return;
  console.log(message.message);
});












