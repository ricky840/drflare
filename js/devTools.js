
var tabId = chrome.devtools.inspectedWindow.tabId;
var requestObjects = {};
var requestObjectsImages = [];
var paintedObjectsImages = [];
var pageOnCompleteEvent = false;
var contectScriptInjected = false;
var urls = [];
var timer = false;
var interval = null;
var requestId = 0;

var injectContentScript = function(tabId) {
  return new Promise(function(resolve, reject) {
    chrome.tabs.sendMessage(tabId, {type: 'content-script-status', tabId: tabId, message: 'alive?', from: 'devTools.js'}, function(response) {
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

var paintElement = function(requests, callback) {
  for (var i=0; i < requests.length; i++) {
    urls.push(requests[i].url);
  }
  chrome.tabs.sendMessage(tabId, {type: 'content-script-paint', requests: requests, urls: urls, tabId: tabId, from: 'devTools.js'});
  urls = [];
  if (callback) {
    callback();
  }
}

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
}

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
    if (!contectScriptInjected) {
      console.log("Injecting ContentScript");
      injectContentScript(tabId).then(function() {

         const inspectString = "inspect(handleRequest(document.querySelectorAll('*:not(.cfdebugger-image-match) > img')))";
         chrome.devtools.inspectedWindow.eval(inspectString, { useContentScriptContext: true });

        contectScriptInjected = true;
      });
    }
		pageOnCompleteEvent = true;
    if (!timer) {
      console.log('Timer On');
      timer = true;
      startInterval();
    }



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

        const inspectString = "inspect(img)";
    chrome.devtools.inspectedWindow.eval(inspectString, function(result){
      console.log(result);
    });
    var version = "1.3";
    chrome.debugger.attach({tabId: tabId}, version, function() {
      chrome.debugger.sendCommand({tabId: tabId}, 'DOM.getDocument', function(result) {
        var rootNodeId = result.root.nodeId;
        console.log(rootNodeId);
        chrome.debugger.sendCommand({tabId: tabId}, 'DOM.querySelectorAll', {nodeId: rootNodeId, selector: "img"}, function(result) {
          console.log(result);
          var arr_node_ids = result.nodeIds;
          console.log(arr_node_ids[0]);
          chrome.debugger.sendCommand({tabId: tabId}, 'DOM.highlightNode', {highlightConfig: highlightConfig, nodeId: arr_node_ids[1]}, function(result) {
            console.log(result);
          });
        });
      });
    });

  }
});


function startInterval() {
  interval = setInterval(function() { 
    if (requestObjectsImages.length > 0) {
      if(contectScriptInjected) {
        chrome.tabs.sendMessage(tabId, {type: 'content-script-dom-status', tabId: tabId, message: 'alive?', from: 'devTools.js'}, function(response) {
          if (response !== undefined && response.result === true) {
            paintedObjectsImages = requestObjectsImages;
            requestObjectsImages = [];
            paintElement(paintedObjectsImages);
          } else {
            console.log("dom is not ready yet");
          }
        });
      }
    }
  }, 300);
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
}
