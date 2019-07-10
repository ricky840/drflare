// 'use strict';

var tabId = chrome.devtools.inspectedWindow.tabId;

var requestObjects = {};
var requestObjectsImages = [];
var paintedObjectsImages = [];
var paintedImagesURL = [];
var pageOnCompleteEvent = false;
var contectScriptInjected = false;
var contentScriptReadyToDraw = false;
var urls = [];
var timer = false;
var counter = 0;
var interval = null;

if (tabId) {
  let backgroundPageConnectionPort = chrome.runtime.connect({name: "devtools-page" + "-" + tabId});

  chrome.devtools.panels.create(PANEL_NAME, PANEL_LOGO, PANEL_HTML, function(panel) {
    // Panel Created
  });

  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.type.match('web-request-objects') && tabId == message.tabId) {

      if (!contectScriptInjected) {
        injectContentScript(tabId);
        contectScriptInjected = true;
      }

      let request = message.message;

      requestObjects[request.requestId] = request;

      if (request.objectType === "image" && request.statusCode == 200) {
        requestObjectsImages.push(request);
        // Ready for OnCompleteEvent AND ContentDom to complete
        if (pageOnCompleteEvent && contentScriptReadyToDraw) {
          isReadyForTimer();


          // if (!timer && requestObjectsImages.length > 0) {
          //   requestObjectsImages.push(request);
          //   paintedObjectsImages.push(...requestObjectsImages);
          //   paintElement(requestObjectsImages);
          //   requestObjectsImages = [];
          // } 

          

          // if (!timer && requestObjectsImages.length > 0) {
          //   requestObjectsImages.push(request);
          //   paintedObjectsImages.push(...requestObjectsImages);
          //   paintElement(requestObjectsImages);
          //   requestObjectsImages = [];
          // } else {
          //   // paintedObjectsImages.push(request);
          //   // paintElement([request]);
          //   requestObjectsImages.push(request);
          // }

          // if (!timer) {
          //   timer = true;
          //   startInterval();
          // }

          // // Send the initial bulk requestObjectsImages
          // if (requestObjectsImages.length > 0) {
          //   requestObjectsImages.push(request);
          //   paintedObjectsImages.push(...requestObjectsImages);
          //   paintElement(requestObjectsImages);
          //   requestObjectsImages = [];
          // } else {
          //   paintedObjectsImages.push(request);
          //   paintElement([request]);
          // }

          // Send the initial bulk requestObjectsImages
          
        } else {
          // injectContentScript(tabId);
          isContentDOMReady(tabId);
        }
      }
    }
  });
}

// Before the page gets refreshed
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type.match('reload-shortcut') && tabId == message.tabId) {
    console.log(`reload timeStamp: ${Date.now()}`);
    requestObjects = {};
    requestObjectsImages = [];
    paintedObjectsImages = [];
    paintedImagesURL = [];
    pageOnCompleteEvent = false;
    contectScriptInjected = false;
    contentScriptReadyToDraw = false;
    clearInterval(interval);
    timer = false;
    count = 0;
  };
});

// when page onload-event happnes
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type.match('page-onload-event') && tabId == message.tabId) {  

    injectContentScript(tabId);

    // Whenever a page reload framId becomes 0
    if (!pageOnCompleteEvent && (message.frameId == 0)) {
      pageOnCompleteEvent = true;
    }

    if (pageOnCompleteEvent) {
      checkAndSendToContent();
      console.log("onload event!!!!! let's paint --------------------------------------------------------------------------------------------");
    }
  };
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type.match('page-onDOMContentLoaded-event') && tabId == message.tabId) {  

    // console.log("onDOMContentLoaded event!!! --------------------------------------------------------------------------------------------");
  };
});

// when Content DOM is ready
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  // console.log(`${message.type}: ${tabId == message.tabId} : ${tabId} : ${message.tabId}`);
  if (message.type.match('content-ready') && tabId == message.tabId) {
    contentScriptReadyToDraw = true;
    console.log('Received: content-ready');
    checkAndSendToContent();
  }
});


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

var injectContentScript = function(tabId) {
  return new Promise(function(resolve, reject) {
    chrome.tabs.sendMessage(tabId, {type: 'content-script-status', tabId: tabId, message: 'alive?', from: 'devTools.js'}, function(response) {
      if (response !== undefined && response.result === true) {
        console.log("ContentScript already exists");
        resolve();
      } else {
        chrome.tabs.insertCSS(tabId, {file: "css/overlay.css", allFrames: true}, function() {
          // chrome.tabs.insertCSS(tabId, {file: "css/semantic.css", allFrames: true}, function() {
            chrome.tabs.executeScript(tabId, {file: 'lib/jquery-3.1.1.min.js', allFrames: true}, function() {
              // chrome.tabs.executeScript(tabId, {file: 'lib/semantic.min.js', allFrames: true}, function() {
                chrome.tabs.executeScript(tabId, {file: 'js/contentScript.js', allFrames: true}, function() {
                  console.log("ContentScript inserted");
                  resolve();
                });
              });
          //   });
          // });
        });
      }
    });
  });
}

function isContentDOMReady(tabId) {
  chrome.tabs.sendMessage(
    tabId, 
    {
      type: 'content-script-dom-status',
      tabId: tabId,
      message: 'alive?',
      from: 'devTools.js'
    }
  );
}

function checkAndSendToContent() {
  // Ready for OnCompleteEvent AND ContentDom to complete
  if (pageOnCompleteEvent && contentScriptReadyToDraw) {
    // Send the initial bulk requestObjectsImages
    isReadyForTimer();
  }
}

function isReadyForTimer() {
  if (!timer) {
    console.log('Timer On');
    timer = true;
    startInterval();
  }
}

function startInterval() {
  interval = setInterval(function() { 
    console.log(`every 1 seconds: count = ${counter + 1}`);
    if (requestObjectsImages.length > 0) {
      paintedObjectsImages = requestObjectsImages;
      requestObjectsImages = [];
      paintElement(paintedObjectsImages);
    }
  }, 1000);
}


// if (tabId) {
//   let backgroundPageConnectionPort = chrome.runtime.connect({name: "devtools-page" + "-" + tabId});

//   chrome.devtools.panels.create(PANEL_NAME, PANEL_LOGO, PANEL_HTML, function(panel) {
//     // Panel Created
//   });

//   chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
//     if (message.type.match('web-request-objects') && tabId == message.tabId) { 
//       let request = message.message;
//       // console.log("Request Object Delivered: "+ request.url + " " + request.objectType);

//       requestObjects[request.requestId] = request;
//       // console.log("Total requests updated: " + Object.keys(requestObjects).length + " " + request.requestId);
//       if (request.objectType === "image" && request.statusCode == 200) {
//         if (pageOnCompleteEvent) {
//           paintedObjectsImages.push(request);
//           paintElement([request]);
//         } else {
//           requestObjectsImages.push(request);
//         }
//       }
//     }
//   });
// }

// // Before the page gets refreshed
// chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
//   if (message.type.match('reload-shortcut') && tabId == message.tabId) {
//     pageOnCompleteEvent = false;
//     paintedObjectsImages = [];
//     paintedImagesURL = [];
//   };
// });

// // when page onload-event happnes
// chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
//   if (message.type.match('page-onload-event') && tabId == message.tabId) {  

//     // if (!pageOnCompleteEvent) {
//     injectContentScript(tabId).then(function() {
//       paintedObjectsImages.push(...requestObjectsImages);
//       console.log("Added image requests");
//       paintElement(requestObjectsImages, function() {
//         console.log("resetting requestObjectsImages");
//         requestObjectsImages = [];
//       });
//     });

//     pageOnCompleteEvent = true;

//     console.log("onload event!!!!! let's paint --------------------------------------------------------------------------------------------");
//   };
// });

// var paintElement = function(requests, callback) {
//   for (var i=0; i < requests.length; i++) {
//     urls.push(requests[i].url);
//   }
//   chrome.tabs.sendMessage(tabId, {type: 'content-script-paint', requests: requests, urls: urls, tabId: tabId, from: 'devTools.js'});
//   urls = [];
//   if (callback) {
//     callback();
//   }
// }

// var injectContentScript = function(tabId) {
//   return new Promise(function(resolve, reject) {
//     chrome.tabs.sendMessage(tabId, {type: 'content-script-status', message: 'alive?', from: 'devTools.js'}, function(response) {
//       if (response !== undefined && response.result === true) {
//         console.log("ContentScript already exists");
//         resolve();
//       } else {
//         chrome.tabs.insertCSS(tabId, {file: "css/overlay.css", allFrames: true}, function() {
//           // chrome.tabs.insertCSS(tabId, {file: "css/semantic.css", allFrames: true}, function() {
//             chrome.tabs.executeScript(tabId, {file: 'lib/jquery-3.1.1.min.js', allFrames: true}, function() {
//               // chrome.tabs.executeScript(tabId, {file: 'lib/semantic.min.js', allFrames: true}, function() {
//                 chrome.tabs.executeScript(tabId, {file: 'js/contentScript.js', allFrames: true}, function() {
//                   console.log("ContentScript inserted");
//                   resolve();
//                 });
//               });
//           //   });
//           // });
//         });
//       }
//     });
//   });
// }