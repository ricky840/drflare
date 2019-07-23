var tabId = chrome.devtools.inspectedWindow.tabId;
var currentURL = "";
var requestObjects = {};
var requestObjectsImages = [];
var paintedObjectsImages = [];
var pageOnCompleteEvent = false;
var contectScriptInjected = false;
var timer = false;
var interval = null;
var requestId = 0;
const REFRESH_RATE = 300;

var contentInterval = false;
// Test
// const inspectString = "inspect(handleRequest(document.querySelectorAll('*:not(.cfdebugger-image-match) > img')))";
// chrome.devtools.inspectedWindow.eval(inspectString, { useContentScriptContext: true });

const version = "1.3";
const HIGHLIGHT_COLOR = {
  r: 155,
  g: 11,
  b: 239,
  a: 0.7
};

highlightConfig = {
  contentColor: HIGHLIGHT_COLOR,
  showInfo: true,
  showStyles: true
}

// chrome.debugger.attach({tabId: tabId}, version, function() {
//   chrome.debugger.sendCommand({tabId: tabId}, 'DOM.getDocument', function(result) {
//     var rootNodeId = result.root.nodeId;
//     console.log(rootNodeId);
//     chrome.debugger.sendCommand({tabId: tabId}, 'DOM.querySelectorAll', {nodeId: rootNodeId, selector: "img"}, function(result) {
//       console.log(result);
//       var arr_node_ids = result.nodeIds;
//       console.log(arr_node_ids[0]);
//       chrome.debugger.sendCommand({tabId: tabId}, 'DOM.highlightNode', {highlightConfig: highlightConfig, nodeId: arr_node_ids[1]}, function(result) {
//         console.log(result);
//       });
//     });
//   });
// });


if (tabId) {
  let backgroundPageConnectionPort = chrome.runtime.connect({name: "devtools-page" + "-" + tabId});

  chrome.devtools.panels.create(PANEL_NAME, PANEL_LOGO, PANEL_HTML, function(panel) {
    // Panel Created
  });

  //Network Tab onRequestFinished
  chrome.devtools.network.onRequestFinished.addListener(function(request) {
    requestId += 1;
    let networkRequest = new NetworkRequest(requestId);
    networkRequest.setDetails(request);

    if (!networkRequest.url.startsWith('data:')) {
      chrome.runtime.sendMessage({
        type: 'web-request-objects',
        message: networkRequest, 
        tabId: tabId, 
        from: 'webRequestListener.js'
      });

      requestObjects[networkRequest.requestId] = networkRequest;
      // console.log(`${networkRequest.objectType} : ${networkRequest.objectType.includes("image")} && ${networkRequest.statusCode == 200}`);
      if (networkRequest.objectType.includes("image") && networkRequest.statusCode === 200) {
        requestObjectsImages.push(networkRequest);
      }
    }
  });

  chrome.devtools.network.onNavigated.addListener(function(url) {
    chrome.runtime.sendMessage({
      type: 'reload-shortcut',
			tabId: tabId
		});
  });

  // chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  //   if (message.type.match('web-request-objects') && tabId == message.tabId) {
  //     let request = message.message;
  //     requestObjects[request.requestId] = request;
  //     if (request.objectType === "image" && request.statusCode === 200) {
  //       requestObjectsImages.push(request);
  //     }
  //   }
  // });
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type.match('found-image') && tabId == message.tabId) {
    // sendResponse({result: 'response'});

    // console.log('foundimage message sent');
    chrome.tabs.sendMessage(tabId, {
      type: 'found-image-response',
      message: message.message,
      url: message.url, 
      tabId: tabId
    });
  }
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type.match('content-interval') && tabId == message.tabId) {
    if (!contentInterval) { 
      sendResponse({result: contentInterval});
      contentInterval = true; 
    } else {
      sendResponse({result: contentInterval});
    }
  }
});

// onRefresh or onUrlChange
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type.match('tab-updated') && tabId == message.tabId) {
    console.log("Tab Updated (Refreshed) Reset All");
    resetDevTools();
  }
});

// onDOMContentLoaded Event 
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type.match('page-onDOMContentLoad-event') && tabId == message.tabId) {  
		console.log("onDOMContentLoad-event");
    // console.log(message.frameId);
    // console.dir(message.message);
    if (message.frameId === 0) { currentURL = message.message.url; }

    if (!contectScriptInjected) {
      console.log("Injecting ContentScript");
      injectContentScript(tabId, message.frameId).then(function() {
        contectScriptInjected = true;
      });
    }
		pageOnCompleteEvent = true;
    if (!timer) {
      console.log('Timer On');
      timer = true;
      startInterval();
    }
  }
});

function startInterval() {
  interval = setInterval(function() { 
    if (requestObjectsImages.length > 0) {
      if(contectScriptInjected) {
        chrome.tabs.sendMessage(tabId, {type: 'content-script-dom-status', currentURL: currentURL, tabId: tabId, message: 'alive?', from: 'devTools.js'}, function(response) {
          if (response !== undefined && response.result === true) {
            paintedObjectsImages = requestObjectsImages;
            chrome.tabs.sendMessage(tabId, {type: 'content-script-paint', requests: paintedObjectsImages, tabId: tabId, from: 'devTools.js'});
            requestObjectsImages = [];
          } else {
            console.log("dom is not ready yet");
          }
        });
      }
    }
  }, REFRESH_RATE);
}

// function injectContentScript(tabId) {
function injectContentScript(tabId, frameId) {
  return new Promise(function(resolve, reject) {
    chrome.tabs.sendMessage(tabId, {type: 'content-script-status', tabId: tabId, frameId: frameId, message: 'alive?', from: 'devTools.js'}, function(response) {
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

function resetDevTools() {
  requestObjects = {};
  requestObjectsImages = [];
  paintedObjectsImages = [];
  pageOnCompleteEvent = false;
  contectScriptInjected = false;
  clearInterval(interval);
  timer = false;
  requestId = 0;
  contentInterval = false;
}
