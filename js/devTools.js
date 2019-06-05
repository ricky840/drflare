chrome.devtools.panels.create("Cloudflare Debugger", "img/cloudflare-logo.png", "panel.html",
  function(panel) {
    let tabId = chrome.devtools.inspectedWindow.tabId;

    chrome.runtime.sendMessage({
      type: 'String',
      message: 'tabIds updated',
      from: 'devTools.js'
    });

    chrome.tabs.insertCSS(tabId, {file: "css/overlay.css"}, function() {
      chrome.tabs.executeScript(tabId, {file: 'lib/jquery-3.1.1.min.js'}, function() {
        chrome.tabs.executeScript(tabId, {file: 'js/contentScript.js'});
      });
    });
  });
