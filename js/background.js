var inspectedWindowCount = 0;
var inspectedTabIds = [];

chrome.runtime.onConnect.addListener(function(port) {
  if (port.name.startsWith("devtools-page")) {
    inspectedWindowCount++;
    var inspectedWindowTabId = parseInt(port.name.split("-")[2]);
    console.log("DevTool Window Open TabId: " + inspectedWindowTabId);

    if (inspectedTabIds.indexOf(inspectedWindowTabId) < 0) {
      inspectedTabIds.push(inspectedWindowTabId);
    }

    port.onDisconnect.addListener(function(port) {
      inspectedWindowCount--;
      console.log("DevTool Window Closed TabId: " + inspectedWindowTabId);

      if (inspectedTabIds.indexOf(inspectedWindowTabId) >= 0) {
        inspectedTabIds.splice(inspectedTabIds.indexOf(inspectedWindowTabId), 1);
        console.log("removed, inspectedTabIds: "+ inspectedWindowTabId);
      }

      if (inspectedWindowCount == 0) {
        inspectedTabIds = [];
      }
    });
  }
});

// onBeforePageReload
chrome.webNavigation.onBeforeNavigate.addListener(
	function(details) {
    if (details.frameId == 0) {
      if (inspectedTabIds.indexOf(details.tabId) > -1) {
        console.log(`webNavigation.onBeforeNavigate Triggered - ${details.url}`);
        chrome.runtime.sendMessage({
          type: 'webnavigation-before-refresh', 
          tabId: details.tabId, 
          newUrl: details.url,
          from: 'webRequestListener.js'
        });
      }
		}
	}
);

// onCommitted
chrome.webNavigation.onCommitted.addListener(
	function(details) {
    if (details.frameId == 0) {
      if (inspectedTabIds.indexOf(details.tabId) > -1) {
        console.log("webNavigation.onCommitted Triggered");
        chrome.runtime.sendMessage({
          type: 'webnavigation-onCommitted', 
          tabId: details.tabId, 
          from: 'webRequestListener.js'
        });
      }
		}
	}
);

// onDOMContentLoaded Event
chrome.webNavigation.onDOMContentLoaded.addListener(
	function(details) {
    if (details.frameId == 0) {
      if (inspectedTabIds.indexOf(details.tabId) > -1) {
        console.log("webNavigation.onDOMContentLoaded Triggered");
        chrome.runtime.sendMessage({
           type: 'page-onDOMContentLoad-event', 
           message: details,
           frameId: details.frameId,
           tabId: details.tabId, 
           from: 'webRequestListener.js'
        });
      }
		}
	}
);

// onCompleted Page (onLoadEvent)
chrome.webNavigation.onCompleted.addListener(
	function(details) {
    if (details.frameId == 0) {
      if (inspectedTabIds.indexOf(details.tabId) > -1) {
        console.log("webNavigation.onCompleted Triggered");
        chrome.runtime.sendMessage({
           type: 'page-onload-event', 
           message: details, 
           tabId: details.tabId,
           frameId: details.frameId,
           from: 'webRequestListener.js'
        });
      }
		}
});

chrome.tabs.onUpdated.addListener (
	function(tabId, changeInfo, tab) {
		if ((inspectedTabIds.indexOf(tabId) > -1) && changeInfo.status == "loading") {
      console.log("tabs.onUpdated Triggered");
			chrome.runtime.sendMessage({
         type: 'tab-onUpdated', 
         message: {}, 
         tabId: tabId,
         newUrl: tab.url,
         from: 'webRequestListener.js'
      });
		}
});
