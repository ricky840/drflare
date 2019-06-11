var initStorage = function() {
  chrome.storage.local.get("inspectedWindowTabIds", function(result) {
    if(result['inspectedWindowTabIds'] === undefined) {
      chrome.storage.local.set({'inspectedWindowTabIds': []}); 
    } else {
      inspectedTabIds = result['inspectedWindowTabIds'];
    }
  });
}

// Fires when ext installed
chrome.runtime.onInstalled.addListener(function(event) {
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

var inspectedWindowCount = 0;

chrome.runtime.onConnect.addListener(function(port) {
  if (port.name.startsWith("devtools-page")) {
    inspectedWindowCount++;
    var inspectedWindowTabId = parseInt(port.name.split("-")[2]);

    console.log("DevTool Window Open TabId: " + inspectedWindowTabId);

    if(addToListener(inspectedWindowTabId)) {
      port.postMessage({refresh: true});
    }

    chrome.storage.local.get('inspectedWindowTabIds', function(data) {
      var tabIds = data['inspectedWindowTabIds'];
      if (tabIds.indexOf(inspectedWindowTabId) < 0) {
        tabIds.push(inspectedWindowTabId);
        chrome.storage.local.set({'inspectedWindowTabIds': tabIds});
       }
    });

    port.onDisconnect.addListener(function(port) {
      console.log("DevTool Window Closed TabId: " + inspectedWindowTabId);

      removeFromListner(inspectedWindowTabId);

      inspectedWindowCount--;
      if (inspectedWindowCount == 0) {
        chrome.storage.local.set({'inspectedWindowTabIds': []});
      }

      chrome.storage.local.get('inspectedWindowTabIds', function(data) {
        var tabIds = data['inspectedWindowTabIds'];
        if (tabIds.indexOf(inspectedWindowTabId) >= 0) {
          var index = tabIds.indexOf(inspectedWindowTabId);
          tabIds.splice(index, 1);
          chrome.storage.local.set({'inspectedWindowTabIds': tabIds});
        }
      });
    });
  }
});
