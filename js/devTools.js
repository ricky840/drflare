chrome.devtools.panels.create("Cloudflare Debugger", "img/cloudflare-logo.png", "panel.html",
  function(panel) {
    
    var tab_id = chrome.devtools.inspectedWindow.tabId;
    console.log(tab_id);
    
    // tabIds.push(chrome.devtools.inspectedWindow.tabId);
    // console.log('tabIds updated: ' + tabIds);

    chrome.runtime.sendMessage({
      type: 'String',
      message: 'tabIds updated',
      from: 'devTools.js'
    });

      // chrome.devtools.inspectedWindow.reload();
    chrome.tabs.insertCSS(tab_id, {file: "css/overlay.css"}, function() {
      chrome.tabs.executeScript(tab_id, {file: 'lib/jquery-3.1.1.min.js'}, function() {
        chrome.tabs.executeScript(tab_id, {file: 'js/contentScript.js'});
      });
    });

});
