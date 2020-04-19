// onBeforePageReload
chrome.webNavigation.onBeforeNavigate.addListener(function(details) {
  if (details.frameId == 0) {
    // console.log(`webNavigation.onBeforeNavigate Triggered - ${details.url}`);
    chrome.runtime.sendMessage({
      type: "webNavigation-onBeforeNavigate",
      tabId: details.tabId,
      newUrl: details.url
    });
  }
});

// onDOMContentLoaded
chrome.webNavigation.onDOMContentLoaded.addListener(function(details) {
  if (details.frameId == 0) {
    // console.log("webNavigation.onDOMContentLoaded Triggered");
    chrome.runtime.sendMessage({
      type: "webNavigation-onDOMContentLoaded",
      message: details,
      frameId: details.frameId,
      tabId: details.tabId
    });
  }
});

// onCompleted (onLoadEvent)
chrome.webNavigation.onCompleted.addListener(function(details) {
  if (details.frameId == 0) {
    // console.log("webNavigation.onCompleted Triggered");
    chrome.runtime.sendMessage({
      type: "page-onload-event",
      message: details,
      tabId: details.tabId,
      newUrl: details.url,
      frameId: details.frameId
    });
  }
});

// tabs.onUpdated
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status == "loading") {
    // console.log("tabs.onUpdated Triggered");
    chrome.runtime.sendMessage({
      type: "tab-onUpdated",
      message: {},
      tabId: tabId,
      newUrl: tab.url
    });
  }
});

var initStorage = function() {
  console.log("Initializing Storage");
  chrome.storage.local.get("options", function(result) {
    if (result["options"] === undefined) {
      let options = {
        disablePaintAndPopupOption: false,
        disableURLFilterOption: false
      };
      chrome.storage.local.set({ options: options });
    }
  });
};

// Fire when ext installed
chrome.runtime.onInstalled.addListener(function(event) {
  initStorage();
  if (event.reason === "install") {
    chrome.storage.local.set(
      { freshInstalled: true, extUpdated: false },
      function() {
        console.log("Extension Installed");
      }
    );
  }
  if (event.reason === "update") {
    chrome.storage.local.set(
      { extUpdated: true, freshInstalled: false },
      function() {
        console.log("Extension Updated");
      }
    );
  }
});

// Fires when Chrome starts or when user clicks refresh button in extension page
chrome.runtime.onStartup.addListener(function() {
  initStorage();
});

// Fires when user clicks disable / enable button in extension page
window.onload = function() {
  initStorage();
};
