var inspectedWindowCount = 0;

chrome.runtime.onConnect.addListener(function(port) {
  if (port.name.startsWith("devtools-page")) {
    inspectedWindowCount++;
    var inspectedWindowTabId = parseInt(port.name.split("-")[2]);
    console.log("DevTool Window Open TabId: " + inspectedWindowTabId);
    addToListener(inspectedWindowTabId, function(refreshTabId) {
      chrome.tabs.reload(refreshTabId, {bypassCache: true});
    });

    port.onDisconnect.addListener(function(port) {
      inspectedWindowCount--;
      console.log("DevTool Window Closed TabId: " + inspectedWindowTabId);
      removeFromListner(inspectedWindowTabId);
      if (inspectedWindowCount == 0) {
        inspectedTabIds = [];
      }
    });
  }
});


// init
var initStorage = function() {
  console.log('init');
  chrome.storage.local.set({'domElements': {}}); 
}

// Fire when ext installed
chrome.runtime.onInstalled.addListener(function() {
  initStorage();
});

// Fires when Chrome starts or when user clicks refresh button in extension page
chrome.runtime.onStartup.addListener(function() {
  initStorage();
});

// Fires when user clicks disable / enable button in extension page
window.onload = function() {
  initStorage(); 
};
