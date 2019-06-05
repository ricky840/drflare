chrome.devtools.panels.create("Cloudflare Debugger", "img/cloudflare-logo.png", "panel.html",
  function(panel) {
    let tabId = chrome.devtools.inspectedWindow.tabId;
    if (tabId) {
      // Create a connection to the background page
      var backgroundPageConnectionPort = chrome.runtime.connect({name: "devtools-page" + "-" + tabId});

      chrome.tabs.sendMessage(tabId, {type: 'content-script-status', message_type: 'String', message: 'alive?', from: 'devTools.js'}, function(response) {
        if (response !== undefined && response.result === true) {
          // do not insert content-scripts
        } else {
          chrome.tabs.insertCSS(tabId, {file: "css/overlay.css"}, function() {
            chrome.tabs.executeScript(tabId, {file: 'lib/jquery-3.1.1.min.js'}, function() {
              chrome.tabs.executeScript(tabId, {file: 'js/contentScript.js'});
            });
          });
        }
      });
    }
  });
