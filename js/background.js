// onBeforePageReload
chrome.webNavigation.onBeforeNavigate.addListener(
	function(details) {
    if (details.frameId == 0) {
      // console.log(`webNavigation.onBeforeNavigate Triggered - ${details.url}`);
      chrome.runtime.sendMessage({
        type: 'webNavigation-onBeforeNavigate', 
        tabId: details.tabId, 
        newUrl: details.url
      });
		}
	}
);

// onDOMContentLoaded
chrome.webNavigation.onDOMContentLoaded.addListener(
	function(details) {
    if (details.frameId == 0) {
      // console.log("webNavigation.onDOMContentLoaded Triggered");
      chrome.runtime.sendMessage({
         type: 'webNavigation-onDOMContentLoaded', 
         message: details,
         frameId: details.frameId,
         tabId: details.tabId
      });
		}
	}
);

// onCompleted (onLoadEvent)
chrome.webNavigation.onCompleted.addListener(
	function(details) {
    if (details.frameId == 0) {
      // console.log("webNavigation.onCompleted Triggered");
      chrome.runtime.sendMessage({
         type: 'page-onload-event', 
         message: details, 
         tabId: details.tabId,
         newUrl: details.url,
         frameId: details.frameId
      });
		}
});

// tabs.onUpdated
chrome.tabs.onUpdated.addListener (
	function(tabId, changeInfo, tab) {
		if (changeInfo.status == "loading") {
      // console.log("tabs.onUpdated Triggered");
			chrome.runtime.sendMessage({
         type: 'tab-onUpdated', 
         message: {}, 
         tabId: tabId,
         newUrl: tab.url
      });
		}
});
