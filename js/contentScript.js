var imageRequests = {};

// Check if ContentJS is injected
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type !== 'content-script-status') return;

  tabId = message.tabId;
  sendResponse({result: true});
  return true;
});

// Check if the page is dom-ready
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type !== 'content-script-dom-status') return;
  tabId = message.tabId;

  if(document.readyState === "interactive" || document.readyState === "complete") {
    sendResponse({result: true});
  }
  sendResponse({result: false});
  return true;
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type !== 'content-script-paint') return;
  if (message.requests.length < 1) return;

  let add = false;
  for (let i = 0; i < message.requests.length; i++) {
    add = true;
    if (message.requests[i].requestId in imageRequests) {
      add = false;
    }
    if (add) { imageRequests[message.requests[i].requestId] = message.requests[i]; }
  }

  paintTargetElements = [];

  // Get all Image objects
  htmlElementsImg = $("*:not(.cfdebugger-image-match) > img");
  htmlElementsImg.each(function(index, value) {
    paintTargetElements.push($(this));
  });

  // Get all Figure objects
  htmlElementsFigure = $("*:not(.cfdebugger-image-match) > figure");
  htmlElementsFigure.each(function(index, value) {
    paintTargetElements.push($(this));
  });

  $("*:not(.cfdebugger-image-match) > div").filter(function() {
    var temp = $(this).css("background-image");
    if (temp.includes("url") && !temp.includes("data:image")) {
      paintTargetElements.push($(this));
    }
  });

  $("*:not(.cfdebugger-image-match) > span").filter(function() {
    var temp = $(this).css("background-image");
    if (temp.includes("url") && !temp.includes("data:image")) {
      paintTargetElements.push($(this));
    }
  });

  $("*:not(.cfdebugger-image-match) > a").filter(function() {
    var temp = $(this).css("background-image");
    if (temp.includes("url") && !temp.includes("data:image")) {
      paintTargetElements.push($(this));
    }
  });

  $("*:not(.cfdebugger-image-match) > i").filter(function() {
    var temp = $(this).css("background-image");
    if (temp.includes("url") && !temp.includes("data:image")) {
      paintTargetElements.push($(this));
    }
  });

  markAllImg();

  sendResponse({result: true});
  return true;

});

function markAllImg() {
  let imgjQueryObj = null;
  let imgRequest = null;
  for (let i = 0; i < paintTargetElements.length; i++) {
    imgjQueryObj = paintTargetElements[i];
    // If a Img DOM has `cfdebugger-image-match`, no need to do again.
    if (!imgjQueryObj.hasClass('cfdebugger-image-match')) {
      imgRequest = getImageRequest(imgjQueryObj);
      if (imgRequest) {
        imgjQueryObj.addClass('cfdebugger-image-match');
        imgjQueryObj.removeClass("cf-debugger-blur cf-debugger-opacity cf-debugger-saturate cf-debugger-grayscale cf-debugger-invert");

        if (imgRequest.cfCached) {
          imgjQueryObj.addClass('cf-debugger-invert');
        } else {
          imgjQueryObj.addClass('cf-debugger-blur');
        }
      } else {
        // if (!imgjQueryObj.hasClass('cfdebugger-image-match')) {
          // imgjQueryObj.addClass('cf-debugger-grayscale'); 
        // }
      }
    }
  }
}

function getImageRequest(imgjQueryObj) {
  let srcURL;
  let matchImageRequest;

  if (imgjQueryObj[0].currentSrc) {
    srcURL = imgjQueryObj[0].currentSrc;
  } else {
    srcURL = parseBackgroundURL(imgjQueryObj.css('background-image'));
  }
 
  for (let requestId in imageRequests) {
    let requestObject = imageRequests[requestId];
    if (requestObject.url == srcURL) {
      return requestObject; 
    }
  }

  return false;
}

function parseBackgroundURL(backgroundImageURL) {
  let firstQuote; 
  let lastQuote;
  firstQuote = backgroundImageURL.indexOf('"');
  lastQuote = backgroundImageURL.lastIndexOf('"');
  return backgroundImageURL.substring(firstQuote + 1, lastQuote);
}
