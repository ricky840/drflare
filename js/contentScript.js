var imageRequests = {};

var prevImageMatch = null;
var injectedPopupDOM = false;
var childMatch = [];
var contentInveral = null;
var REFRESH_RATE = 2000;
var iFrameImage = false;

var iFrameImageFound = true;

var mouseX = 0;
var mouseY = 0;

var mouseEnterX = 0;
var mouseEnterY = 0;

var mouseMovementCounterForIFrame = 0;
var mouseMovementCounterForParent = 0;
var mouseMovementCounterForHover = 0;

var mouseMoveThreashold = 15;
var mouseMoveIFrameTheshold = 2;
var mouseMoveHoverTheshold = 1;

var tabId = null;

var hoveredImages = [];
var hoveredImageCount = 0;

var previousHoveredImages = [];

var isReadyToCheck = true;

var popupResponseHeaders = ['content-type', 'cf-cache-status', 'content-length', 'expires'];

var timestamp = null;
var lastMouseX = null;
var lastMouseY = null;

$("body").on('mousemove', '*', function(event) {
  mouseX = event.clientX;
  mouseY = event.clientY;

  if (mouseMovementCounter() && isReadyToCheck) {
    moveChecker(mouseX, mouseY);
    if (iFrameImage && !checkIFrameImage()) {
      iFrameImage = false;
      resetPreviousImageMatch();
    }
  }
});

$("body").on('mouseenter', '*', function(event){
  mouseEnterX = event.clientX;
  mouseEnterY = event.clientY;
  if (hoverMouseMovementCounter()) {
    hoverChecker();
  }

  if (iFrameImage && !checkIFrameImage()) {
    iFrameImage = false;
    resetPreviousImageMatch();
  }
});

function hoverChecker() {
  let elementHoverOver = $(document.querySelectorAll(":hover"));
  
  if (elementHoverOver.length < 1) return;

  let lastIndex = elementHoverOver.length - 1;

  // firstLevelParentNode will be used as a stopping point
  let secondLevelParentNode = null;
  let firstLevelParentNode = null;
  let currentNode;

  if (lastIndex > 0) firstLevelParentNode = $(elementHoverOver[lastIndex].parentNode);

  if (firstLevelParentNode[0].parentNode && firstLevelParentNode[0].parentNode != undefined && lastIndex > 0) {
    secondLevelParentNode = $(firstLevelParentNode[0].parentNode);
  }

  // isReadyToCheck = false;
  if (secondLevelParentNode) {
    childMatch = secondLevelParentNode.find("[cfdebugger-request-id]").addBack("[cfdebugger-request-id]");
  } 

  // not sure about this threshold
  if (firstLevelParentNode && childMatch.length > 80) {
    childMatch = firstLevelParentNode.find("[cfdebugger-request-id]").addBack("[cfdebugger-request-id]");
  }
  // isReadyToCheck = true;

  hidePopup();
}

function moveChecker(mX, mY) {
  isReadyToCheck = false;
  let elementMouseIsOver = $(document.elementFromPoint(mX, mY));
  let found = false;
  hoveredImages = [];
  hoveredImageCount = 0;

  if (elementMouseIsOver.attr("cfdebugger-request-id")) {
    found = true;
    hoveredImages.push(elementMouseIsOver);
  } if (childMatch.length > 0) {
    childMatch.each(function() {
      tempObj = $(this)[0].getBoundingClientRect();
      
      if (mX >= tempObj.left 
        && mX <= tempObj.right
        && mY >= tempObj.top
        && mY <= tempObj.bottom
      ) {
        found = true;
        hoveredImageCount++;
        hoveredImages.push($(this));
      }
    });
  }

  handleHoveredImage(hoveredImages, hoveredImageCount);

  if (!found) { 
    resetPrevIMG(null); 
    hidePopup();
  }
  isReadyToCheck = true;
}

function handleHoveredImage(imageDOMs) {
  resetPrevIMG();
  let imageDOM;
  let style;
  let imageRequest;
  for (let i = 0; i < imageDOMs.length; i++) {
    imageDOM = imageDOMs[i];
    style = imageDOM.attr("cf-debugger-style");
    if (!style.match('grayscale')) {
      previousHoveredImages.push(imageDOM);
      imageDOM.attr("cf-debugger-style", 'grayscale');
      imageRequest = getImageRequest(imageDOM);
      // hoveredImages[imageRequest.requestId] = imageRequest;
      if (checkIFrameImage()) {
        if (iFrameMouseMovementCounter()) {
          sendImageToDevTools(imageRequest);
        } 
      } else {
        if (i == 0) {
          setPopupPosition(imageDOM);
          updatePopupDOM(imageRequest, hoveredImageCount);
          showPopup();
        }
      }
    }
  }
}

function setPopupPosition(imageDOM) {
  let tempObj = imageDOM[0].getBoundingClientRect();
  let windowWidth = $(window).width();
  let windowheight = $(window).height();
  let popupDOM = $('.cf-debugger-popup');
  popupDOMDimension = popupDOM[0].getBoundingClientRect();

  if ((tempObj.right + popupDOMDimension.width) > windowWidth) {
    mouseEnterX = tempObj.left - popupDOMDimension.width;
  } else {
    mouseEnterX = tempObj.right;   
  }

  if ((tempObj.top + popupDOMDimension.height) > windowheight) {
    mouseEnterY = tempObj.bottom - popupDOMDimension.height;
  } else {
    mouseEnterY = tempObj.top;
  }
}

function iFrameMouseMovementCounter() {
  if (mouseMovementCounterForIFrame < mouseMoveIFrameTheshold) {
    mouseMovementCounterForIFrame += 1;
    return false;
  } else {
    mouseMovementCounterForIFrame = 0;
    return true;
  }
}

function mouseMovementCounter() {
  if (mouseMovementCounterForParent < mouseMoveThreashold) {
    mouseMovementCounterForParent += 1;
    return false;
  } else {
    mouseMovementCounterForParent = 0;
    return true;
  }
}

function hoverMouseMovementCounter() {
  if (mouseMovementCounterForHover < mouseMoveHoverTheshold) {
    mouseMovementCounterForHover += 1;
    return false;
  } else {
    mouseMovementCounterForHover = 0;
    return true;
  }
}

function resetPrevIMG(newImageMatch) {
  for (let i = 0; i < previousHoveredImages.length; i++) {
    if (previousHoveredImages[i]) previousHoveredImages[i].attr("cf-debugger-style", 'blur');
  }
}

// Append Popup HTML format
function appendPopupDOMToBody() {
  let textNode;

  let popupDiv = document.createElement('div');
  popupDiv.className = 'cf-debugger-popup';

  // Empty for now
  let popupDivHeader = document.createElement('h1');
  popupDivHeader.className = 'cf-debugger-popup-title';
  let headerNode = document.createTextNode('');
  popupDivHeader.appendChild(headerNode);

  let popupDivBody = document.createElement('div');
  popupDivBody.className = 'cf-debugger-popup-detail';

  let popupDivBodyCFFeatures = document.createElement('h1');
  popupDivBodyCFFeatures.className = 'cf-debugger-popup-detail-cf';
  textNode = document.createTextNode('Cloudflare Features');
  popupDivBodyCFFeatures.appendChild(textNode);

  let popupDivBodyStatusCode = document.createElement('p');
  popupDivBodyStatusCode.className = 'cf-debugger-popup-detail-cf-status-code';
  popupDivBodyStatusCode.setAttribute('cf-label', '');
  textNode = document.createTextNode('Status:');
  popupDivBodyStatusCode.appendChild(textNode);

  let popupDivBodyCache = document.createElement('p');
  popupDivBodyCache.className = 'cf-debugger-popup-detail-cf-cache';
  popupDivBodyCache.setAttribute('cf-label', '');
  textNode = document.createTextNode('CF Cache');
  popupDivBodyCache.appendChild(textNode);

  let popupDivBodyPolish = document.createElement('p');
  popupDivBodyPolish.className = 'cf-debugger-popup-detail-cf-polish';
  popupDivBodyPolish.setAttribute('cf-label', 'empty');
  textNode = document.createTextNode('Polish');
  popupDivBodyPolish.appendChild(textNode);

  let popupDivBodyRailgun = document.createElement('p');
  popupDivBodyRailgun.className = 'cf-debugger-popup-detail-cf-railgun';
  popupDivBodyRailgun.setAttribute('cf-label', '');
  textNode = document.createTextNode('Railgun');
  popupDivBodyRailgun.appendChild(textNode);

  let popupDivBodyImageResizing = document.createElement('p');
  popupDivBodyImageResizing.className = 'cf-debugger-popup-detail-cf-image-resizing';
  popupDivBodyImageResizing.setAttribute('cf-label', '');
  textNode = document.createTextNode('Image Resizing');
  popupDivBodyImageResizing.appendChild(textNode);

  let popupDivBodyHeaders = document.createElement('h1');
  popupDivBodyHeaders.className = 'cf-debugger-popup-detail-headers';
  textNode = document.createTextNode('Relevant Headers');
  popupDivBodyHeaders.appendChild(textNode);

  let popupDivBodyHeadersDetail = document.createElement('div');
  popupDivBodyHeadersDetail.className = 'cf-debugger-popup-detail-headers-detail';
  textNode = document.createTextNode('Relevant Headers');
  popupDivBodyHeadersDetail.appendChild(textNode);

  popupDivBody.appendChild(popupDivBodyCFFeatures);
  popupDivBody.appendChild(popupDivBodyStatusCode);
  popupDivBody.appendChild(popupDivBodyCache);
  popupDivBody.appendChild(popupDivBodyPolish);
  popupDivBody.appendChild(popupDivBodyRailgun);
  popupDivBody.appendChild(popupDivBodyImageResizing);

  popupDivBody.appendChild(popupDivBodyHeaders);
  popupDivBody.appendChild(popupDivBodyHeadersDetail);

  popupDiv.appendChild(popupDivHeader);
  popupDiv.appendChild(popupDivBody);

  document.body.appendChild(popupDiv);
}

function showPopup() {
  let scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
  $('.cf-debugger-popup').show()
    .css('top', mouseEnterY + 10 + scrollTop)
    .css('left', mouseEnterX + 10);
}

function hidePopup() {
  $('.cf-debugger-popup').hide();
}

function sendImageToDevTools(imageRequest) {
  if (iFrameImageFound) {
    iFrameImageFound = false;
    chrome.runtime.sendMessage({
      type: 'found-image',
      message: imageRequest,
      url: imageRequest.url,
      tabId: tabId
    });
  }
}

function checkIFrameImage() {
  if ($('body').attr('class') && $('body').attr('class').match('cfdebugger-iframe-body')) return true;
  
  return false;
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type.match('found-image-response') && tabId == message.tabId) {
    if (!checkIFrameImage()) {
      updatePopupDOM(message.message, 1);
      showPopup();
    }

    iFrameImage = true;
    iFrameImageFound = true;
  }
});

function updatePopupDOM(imageRequest, count = 0) {
  if (imageRequest) {

    let popupTitle = document.getElementsByClassName('cf-debugger-popup-title')[0];
    let popupDetailStatusCode = document.getElementsByClassName('cf-debugger-popup-detail-cf-status-code')[0];
    let popupDetailCache = document.getElementsByClassName('cf-debugger-popup-detail-cf-cache')[0];
    let popupDetailPolish = document.getElementsByClassName('cf-debugger-popup-detail-cf-polish')[0];
    let popupDetailRailgun = document.getElementsByClassName('cf-debugger-popup-detail-cf-railgun')[0];
    let popupDetailImageResizing = document.getElementsByClassName('cf-debugger-popup-detail-cf-image-resizing')[0];
    let popupDetailHeaders = document.getElementsByClassName('cf-debugger-popup-detail-headers-detail')[0];
    
    let headersInString = "";
    for (let header in imageRequest.responseHeaders) {
      if (popupResponseHeaders.includes(header)) {
        headersInString += `<p> ${header}: ${imageRequest.responseHeaders[header]} </p>`;
      }
    }

    popupDetailHeaders.innerHTML = headersInString;

    popupDetailStatusCode.setAttribute('cf-label', 'green');
    popupDetailStatusCode.innerHTML = `Status: ${imageRequest.statusCode} : count ${count}`;

    if (imageRequest.cfCached || false) {
      popupDetailCache.setAttribute('cf-label', 'green');
    } else {
      popupDetailCache.setAttribute('cf-label', 'red');
    }

    if (imageRequests.polished || false) {
      popupDetailPolish.setAttribute('cf-label', 'green');
    } else {
      popupDetailPolish.setAttribute('cf-label', 'red');
    }
    
    if (imageRequests.railguned || false) {
      popupDetailRailgun.setAttribute('cf-label', 'green');
    } else {
      popupDetailRailgun.setAttribute('cf-label', 'red');
    }

    if (imageRequests.imageResized || false) {
      popupDetailImageResizing.setAttribute('cf-labe', 'green');
    } else {
      popupDetailImageResizing.setAttribute('cf-label', 'red');
    }
    
    // popupDetailCache.innerHTML = `Cache: ${imageRequest.cfCached || false}`;
    // popupDetailPolish.innerHTML = `Polish: ${imageRequests.polished || false}`;
    // popupDetailRailgun.innerHTML = `Railgun: ${imageRequests.railguned || false}`;
    // popupDetailImageResizing.innerHTML = `Image Resizing: ${imageRequests.imageResized || false}`;
  }
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type.match('remove-grey-scale') && tabId == message.tabId) {
    if (checkIFrameImage()) {
      resetPrevIMG();
    } 
  }
})

function resetPreviousImageMatch() {
  chrome.runtime.sendMessage({
    type: 'reset-previous-image',
    tabId: tabId
  });
}

// Popup utilities

function shortenURL(url) {
  let splittedURL = [];
  let newURL = url;
  if (url) {
    splittedURL = url.split("/");
    newURL = `${splittedURL[0]}//${splittedURL[2]}/.../${splittedURL[splittedURL.length - 1]}`;
  }

  return newURL;
}

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
    
    // add special class for iframe tags
    let documentDOM = $(document);

    for (let i = 0; i < documentDOM.length; i++) {
      // console.log(message.currentURL.match(documentDOM[i].URL));

      // console.log(`${message.currentURL} :  ${documentDOM[i].URL}`);
      if (message.currentURL == documentDOM[i].URL) {
        if (!hasPopUpDOM()) {
          appendPopupDOMToBody();
          let iframeDOMS = $(documentDOM[i].querySelectorAll('iframe'));
          mouseMoveThreashold = mouseMoveThreashold * (1 + iframeDOMS.length);
        }
      } else {
        iframeBodyDOM = $(documentDOM[i].querySelectorAll('body'));
        if (iframeBodyDOM.attr("class") && iframeBodyDOM.attr("class").match("cfdebugger-iframe-body")) {

        } else {
          iframeBodyDOM.addClass('cfdebugger-iframe-body');
        }
      }
    }

    sendResponse({result: true});
  }

  sendResponse({result: false});
  return true;
});

function hasPopUpDOM() {
  let popUpDOM = $('.cf-debugger-popup');
  if (popUpDOM.length > 0) return true;

  return false;
}

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
  htmlElementsImg = $("img:not([cfdebugger-request-id])");
  htmlElementsImg.each(function(index, value) {
    paintTargetElements.push($(this));
  });

  // Get all Figure objects
  htmlElementsFigure = $("figure:not([cfdebugger-request-id])");
  htmlElementsFigure.each(function(index, value) {
    paintTargetElements.push($(this));
  });

  $("div:not([cfdebugger-request-id])").filter(function() {
    var temp = $(this).css("background-image");
    if (temp.includes("url") && !temp.includes("data:image")) {
      paintTargetElements.push($(this));
    }
  });

  $("span:not([cfdebugger-request-id])").filter(function() {
    var temp = $(this).css("background-image");
    if (temp.includes("url") && !temp.includes("data:image")) {
      paintTargetElements.push($(this));
    }
  });

  $("a:not([cfdebugger-request-id])").filter(function() {
    var temp = $(this).css("background-image");
    if (temp.includes("url") && !temp.includes("data:image")) {
      paintTargetElements.push($(this));
    }
  });

  $("i:not([cfdebugger-request-id])").filter(function() {
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
    // If a Img DOM has `cfdebugger-request-id`, no need to do again.
    if (!imgjQueryObj[0].hasAttribute('cfdebugger-request-id')) {
      imgRequest = getImageRequest(imgjQueryObj);
      if (imgRequest) {
        imgjQueryObj.attr('cfdebugger-request-id', imgRequest.requestId);

        if (imgRequest.cfCached) {
          imgjQueryObj.attr('cf-debugger-style', 'invert');
        } else {
          imgjQueryObj.attr('cf-debugger-style', 'blur');
          
        }
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

  return null;
}

function parseBackgroundURL(backgroundImageURL) {
  let firstQuote; 
  let lastQuote;
  firstQuote = backgroundImageURL.indexOf('"');
  lastQuote = backgroundImageURL.lastIndexOf('"');
  return backgroundImageURL.substring(firstQuote + 1, lastQuote);
}
