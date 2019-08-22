"use strict";

function startInterval() {
  interval = setInterval(function() { 
    if (requestObjectsImages.length > 0) {
      if(contectScriptInjected) {
        let heartBeatMsg = {
          type: 'content-script-dom-status', 
          currentURL: currentURL, 
          tabId: tabId, 
          message: 'alive?', 
          from: 'devTools.js'
        };
        chrome.tabs.sendMessage(tabId, heartBeatMsg, function(response) {
          if (response !== undefined && response.result === true) {
            paintedObjectsImages = requestObjectsImages;
            chrome.tabs.sendMessage(tabId, {
              type: 'content-script-paint', 
              requests: paintedObjectsImages, 
              tabId: tabId, 
              from: 'devTools.js'
            });
            requestObjectsImages = [];
          } else {
            console.log("ContentScript did not respond");
          }
        });
      }
    }
  }, REFRESH_RATE);
}

function injectContentScript(tabId, frameId) {
  return new Promise(function(resolve, reject) {
    let heartBeatMsg = {
      type: 'content-script-status', 
      tabId: tabId, 
      frameId: frameId, 
      message: 'alive?', 
      from: 'devTools.js'
    };
    chrome.tabs.sendMessage(tabId, heartBeatMsg, function(response) {
      if (response !== undefined && response.result === true) {
        console.log("ContentScript already exists");
        resolve();
      } else {
        chrome.tabs.insertCSS(tabId, {file: "css/overlay.css", allFrames: true}, function() {
          chrome.tabs.executeScript(tabId, {file: 'lib/jquery-3.1.1.min.js', allFrames: true}, function() {
            chrome.tabs.executeScript(tabId, {file: 'js/contentScript.js', allFrames: true}, function() {
              console.log("ContentScript inserted");
              resolve();
            });
          });
        });
      }
    });
  });
}

function sendRequestToPanel(requestObject) {
  requestId += 1;
  let networkRequest = new NetworkRequest(requestId);
  networkRequest.setDetails(requestObject);

  if (panelReady && !networkRequest.url.startsWith('data:')) {
    chrome.runtime.sendMessage({
      type: 'web-request-objects',
      message: networkRequest, 
      tabId: tabId, 
      from: 'webRequestListener.js'
    });

    if (networkRequest.objectType.includes("image") || 
      networkRequest.statusCode === 301 ||
      networkRequest.statusCode === 302) {
      requestObjectsImages.push(networkRequest);
    }
  }
}

function resetDevTools() {
  clearInterval(interval);
  requestObjectsImages = [];
  paintedObjectsImages = [];
  contectScriptInjected = false;
  timer = false;
  requestId = REQUEST_ID_START;
}

function dateTimeInUnix(dateTime) {
  return new Date(dateTime).getTime();
}

function compareStartedDateTime(a, b) {
  if (dateTimeInUnix(a.startedDateTime) < dateTimeInUnix(b.startedDateTime)) return -1;
  if (dateTimeInUnix(a.startedDateTime) > dateTimeInUnix(b.startedDateTime)) return 1;
  return 0;
}

if (tabId) {
  chrome.devtools.panels.create(PANEL_NAME, PANEL_LOGO, PANEL_HTML, function(panel) {
    panelReady = true;
    panel.onSearch.addListener(function(action, queryString) {
      chrome.runtime.sendMessage({
        type: 'search-panel-string',
        action: action, 
        query: queryString,
        tabId: tabId
      });
    });
  });

  //Network Panel onRequestFinished
  chrome.devtools.network.onRequestFinished.addListener(function(request) {
    if (bufferNetworkRequests && !request.request.url.startsWith('data:')) {
      networkRequestBuffer.push(request);
    } else if (!bufferNetworkRequests) {
      // Send Buffered Requests First
      if (networkRequestBuffer.length > 0) {
        let requestsFiltered = [];
        let saveFlag = false;
        // Sort by startedTime before filtering
        networkRequestBuffer.sort(compareStartedDateTime);
        for (let i=0; i < networkRequestBuffer.length; i++) {
          if (networkRequestBuffer[i].request.url == newUrlOnTab) {
            saveFlag = true;
          }
          if (saveFlag) {
            requestsFiltered.push(networkRequestBuffer[i]);
          }
        }
        if (requestsFiltered.length > 0) {
          for (let i=0; i < requestsFiltered.length; i++) {
            sendRequestToPanel(requestsFiltered[i]);
          }
        }
        networkRequestBuffer = [];
      }
      sendRequestToPanel(request);
    }
  });

  // On webNavigation-onBeforeNavigate
  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.type.match('webNavigation-onBeforeNavigate') && tabId == message.tabId) {
      console.log("Buffering Requests");
      bufferNetworkRequests = true;
      newUrlOnTab = message.newUrl;
      resetDevTools();
    }
  });

  // webNavigation.onDOMContentLoaded
  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.type.match('webNavigation-onDOMContentLoaded') && tabId == message.tabId) {  

      // Stop Buffering Request
      console.log("Buffering Stopped");
      bufferNetworkRequests = false;
    }
  });

  // webNavigation.onCompleted
  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.type.match('page-onload-event') && tabId == message.tabId) {
      if (message.frameId == 0) {
        currentURL = message.newUrl;
        if (!contectScriptInjected) {
          console.log("Injecting ContentScript");
          injectContentScript(tabId, message.frameId).then(function() {
            contectScriptInjected = true;
          });
        }
        if (!timer) {
          console.log('Timer On');
          timer = true;
          startInterval();
        }
      }
    }
  });

  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.type.match('found-image') && tabId == message.tabId) {
      chrome.tabs.sendMessage(tabId, {
        type: 'found-image-response',
        message: message.message, 
        tabId: tabId
      });
    }
  });

  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.type.match('reset-previous-image') && tabId == message.tabId) {
      chrome.tabs.sendMessage(tabId, {
        type: 'remove-grey-scale',
        tabId: tabId
      });
    }
  });
}
