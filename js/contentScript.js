// "use strict";

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

var imageObjectCountLimit = 80;
var numberOfLabelsInRow = 4;
var popupMouseOffset = 100;

var tabId = null;

var hoveredImages = [];
var hoveredImageCount = 0;

var previousHoveredImages = {};

var isReadyToCheck = true;

var popupResponseHeaders = [
  'status', 'cf-ray', 'cf-cache-status', 'content-type',
  'content-length', 'expires', 'age', 'cf-railgun',
  'cf-polished', 'cf-bgj', 'cf-resized'
];

var cloudflareFeatureNames = [
  'Proxied', 'Cache HIT', 'Cache Miss', '3rd Party',
  'Railgun', 'Auto Minify', 'IMG Polish', 'IMG Resized'
];

var timestamp = null;
var lastMouseX = null;
var lastMouseY = null;

var popupWidth = 370;
var popupHeight = 550;

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

  // secondLevelParentNode will be used as a stopping point
  let secondLevelParentNode = null;
  let firstLevelParentNode = null;
  let currentNode;

  if (lastIndex > 0) firstLevelParentNode = $(elementHoverOver[lastIndex].parentNode);

  if (firstLevelParentNode[0].parentNode && firstLevelParentNode[0].parentNode != undefined && lastIndex > 0) {
    secondLevelParentNode = $(firstLevelParentNode[0].parentNode);
  }

  if (secondLevelParentNode) {
    childMatch = secondLevelParentNode.find("[cfdebugger-request-id]").addBack("[cfdebugger-request-id]");
  } 

  // Above too many images objects
  if (firstLevelParentNode && childMatch.length > imageObjectCountLimit) {
    childMatch = firstLevelParentNode.find("[cfdebugger-request-id]").addBack("[cfdebugger-request-id]");
  }

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
      let tempObj = $(this)[0].getBoundingClientRect();
      
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

  handleHoveredImages(hoveredImages, hoveredImageCount);

  if (!found) { 
    resetPrevIMG(null); 
    hidePopup();
  }
  isReadyToCheck = true;
}

function handleHoveredImages(imageDOMs) {
  resetPrevIMG();
  let imageDOM, style, imageRequest;
  let imageDOMsLength = imageDOMs.length;
  for (let i = 0; i < imageDOMsLength; i++) {
    imageDOM = imageDOMs[i];
    style = imageDOM.attr("cf-debugger-style");
    if (!style.match('hover')) {
      imageDOM.attr("cf-debugger-style", 'hover');
      imageRequest = getImageRequest(imageDOM);

      if (imageRequest) previousHoveredImages[imageRequest.requestId] = imageDOM;

      if (checkIFrameImage()) {
        if (iFrameMouseMovementCounter()) sendImageToDevTools(imageRequest);
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

function setPopupPosition(imageDOM = null) {
  let popupDOM = $('.cf-debugger-popup');
  let popupDOMDimension = popupDOM[0].getBoundingClientRect();
  let width = (popupDOMDimension.width == 0) ? popupWidth : popupDOMDimension.width;

  if ((width + popupMouseOffset) > mouseX) {
    popupDOM[0].style.removeProperty('left');
    popupDOM[0].style.right = 0;
  } else {
    popupDOM[0].style.removeProperty('right');
    popupDOM[0].style.left = 0;
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

function resetPrevIMG(newImageMatch = null) {
  let requestId;
  for (requestId in previousHoveredImages) {
    if (previousHoveredImages[requestId] && imageRequests[requestId].cfCached) {
      previousHoveredImages[requestId].attr("cf-debugger-style", 'cache');
    } else if (previousHoveredImages[requestId] && imageRequests[requestId].rayId != "") {
      previousHoveredImages[requestId].attr("cf-debugger-style", 'grayscale');
    } else {
      previousHoveredImages[requestId].attr('cf-debugger-style', 'external');
    }
  }

  previousHoveredImages = {};
}

// Append Popup HTML format
function appendPopupDOMToBody() {
  let textNode;
  let popupDiv = document.createElement('div');
  popupDiv.className = 'cf-debugger-popup';

  // Empty for now
  let popupFeatureHeader = document.createElement('h4');
  popupFeatureHeader.className = 'cf-debugger-popup-title';
  textNode = document.createTextNode('Cloudflare Features');
  popupFeatureHeader.appendChild(textNode);
  popupDiv.appendChild(popupFeatureHeader);

  let popupDividerFirst = document.createElement('div');
  popupDividerFirst.className = 'cf-debugger-popup-divider';
  popupDiv.appendChild(popupDividerFirst);

  let popupGrid = document.createElement('div');
  popupGrid.className = 'cf-debugger-popup-grid';

  let i, j, popupRow, popupColumn, popupItem, popupContent, popupLabel;
  for (i = 0; i < cloudflareFeatureNames.length; i = i + numberOfLabelsInRow) {
    popupRow = document.createElement('div');
    popupRow.className = 'cf-debugger-popup-row';

    for (j = i; j < i + numberOfLabelsInRow; j++) {
      popupColumn = document.createElement('div');
      popupColumn.className = 'cf-debugger-popup-column';

      popupLabel = document.createElement('div');
      popupLabel.className = 'cf-debugger-popup-label';
      textNode = document.createTextNode(cloudflareFeatureNames[j]);
      popupLabel.appendChild(textNode);

      popupColumn.appendChild(popupLabel);
      popupRow.appendChild(popupColumn);  
    }

    popupGrid.appendChild(popupRow);
  }

  popupDiv.appendChild(popupGrid);


  let popupURLHeader = document.createElement('h4');
  popupURLHeader.className = 'cf-debugger-popup-title';
  textNode = document.createTextNode('Image URL');
  popupURLHeader.appendChild(textNode);
  popupDiv.appendChild(popupURLHeader);

  let popupDividerSecond = document.createElement('div');
  popupDividerSecond.className = 'cf-debugger-popup-divider';
  popupDiv.appendChild(popupDividerSecond);

  let popupURLHolder = document.createElement('h4');
  popupURLHolder.className = 'cf-debugger-popup-url-holder';
  textNode = document.createTextNode('');
  popupURLHolder.appendChild(textNode);
  popupDiv.appendChild(popupURLHolder);

  let popupURLTextAra = document.createElement('textarea');
  popupURLTextAra.className = 'cf-debugger-popup-url-text-area';
  textNode = document.createTextNode('');
  popupURLTextAra.appendChild(textNode);
  popupDiv.appendChild(popupURLTextAra);

  let popupReasponseHeader = document.createElement('h4');
  popupReasponseHeader.className = 'cf-debugger-popup-title';
  textNode = document.createTextNode('Response Headers');
  popupReasponseHeader.appendChild(textNode);
  popupDiv.appendChild(popupReasponseHeader);

  let popupDividerThird = document.createElement('div');
  popupDividerThird.className = 'cf-debugger-popup-divider';
  popupDiv.appendChild(popupDividerThird);

  let popupResponseHolder = document.createElement('div');
  popupResponseHolder.className = 'cf-debugger-popup-headers';
  popupDiv.appendChild(popupResponseHolder);

  document.body.appendChild(popupDiv);
}

function showPopup() {
  // // Get scrolled heights
  // let scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
  // $('.cf-debugger-popup').show()
  //   .css('top', mouseEnterY + scrollTop)
  //   .css('left', mouseEnterX);

  $('.cf-debugger-popup').show();
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
      setPopupPosition();
      updatePopupDOM(message.message, 1);
      showPopup();
    }

    iFrameImage = true;
    iFrameImageFound = true;
  }
});

function updatePopupDOM(imageRequest, count = 0) {
  if (imageRequest) {
    let popupLabels = document.getElementsByClassName('cf-debugger-popup-label');
    let i;
    for (i = 0; i < popupLabels.length; i++) {
      switch (popupLabels[i].innerHTML) {

        case ('Proxied'):
          popupLabels[i].setAttribute('cf-label', (imageRequest.rayId != "") ? "green" : "grey");
          break;
        case ('Cache HIT'):
          popupLabels[i].setAttribute('cf-label', (imageRequest.cfCached != "") ? "green" : "grey");
          break;
        case ('Cache Miss'):
          popupLabels[i].setAttribute('cf-label', (!imageRequest.cfCached && imageRequest.rayId != "") ? "green" : "grey");
          break;
        case ('3rd Party'):
          popupLabels[i].setAttribute('cf-label', (imageRequest.rayId == "") ? "green" : "grey");
          break;
        case ('Railgun'):
          popupLabels[i].setAttribute('cf-label', (imageRequest.railguned) ? "green" : "grey");
          break;
        case ('IMG Polish'):
          popupLabels[i].setAttribute('cf-label', (imageRequest.imagePolished != "") ? "green" : "grey");
          break;
        case ('Auto Minify'):
          popupLabels[i].setAttribute('cf-label', (imageRequest.minified != "") ? "green" : "grey");
          break;
        case ('IMG Resized'):
          popupLabels[i].setAttribute('cf-label', (imageRequest.imageResized != "") ? "green" : "grey");
          break;
      }
    }

    let popupURL = document.getElementsByClassName('cf-debugger-popup-url-holder')[0];
    popupURL.textContent = imageRequest.url;
    let popupURLTextArea = document.getElementsByClassName('cf-debugger-popup-url-text-area')[0];
    popupURLTextArea.textContent = imageRequest.url;
    
    
    let popupTitle = document.getElementsByClassName('cf-debugger-popup-headers')[0];

    while (popupTitle.hasChildNodes()) {   
      popupTitle.removeChild(popupTitle.firstChild);
    }

    let header, headerValue, popupItem, popupContent, textNode, responseHeader, responseSubHeader;
    for (i = 0; i < popupResponseHeaders.length; i ++) {
      header = popupResponseHeaders[i];
      headerValue = imageRequest.responseHeaders[header] == undefined ? 'N/A' : imageRequest.responseHeaders[header];

      popupItem = document.createElement('div');
      popupItem.className = 'cf-debugger-popup-item';

      popupContent = document.createElement('div');
      popupContent.className = 'cf-debugger-popup-content';

      responseHeader = document.createElement('h4');
      responseHeader.className = 'cf-debugger-popup-response-header';
      textNode = document.createTextNode(header);
      responseHeader.appendChild(textNode);

      responseSubHeader = document.createElement('div');
      responseSubHeader.className = 'cf-debugger-popup-response-sub-header';
      textNode = document.createTextNode(headerValue);
      responseSubHeader.appendChild(textNode);
      responseHeader.appendChild(responseSubHeader);

      popupContent.appendChild(responseHeader);
      popupItem.appendChild(popupContent);

      popupTitle.appendChild(popupItem);
    }

    let popupDiv = document.getElementsByClassName('cf-debugger-popup')[0];
    popupDiv.appendChild(popupTitle);
  }
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type.match('remove-grey-scale') && tabId == message.tabId) {
    if (checkIFrameImage()) {
      resetPrevIMG();
    } 
  }
});

function resetPreviousImageMatch() {
  chrome.runtime.sendMessage({
    type: 'reset-previous-image',
    tabId: tabId
  });
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
    let documentDOMLength = documentDOM.length;
    let i, iframeBodyDOM, iframeDOMS;
    for (let i = 0; i < documentDOMLength; i++) {
      if (message.currentURL == documentDOM[i].URL) {
        if (!hasPopUpDOM()) {
          appendPopupDOMToBody();
          iframeDOMS = $(documentDOM[i].querySelectorAll('iframe'));
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

  let imageRequestLength = message.requests.length;
  if (imageRequestLength < 1) return;

  for (let i = 0; i < imageRequestLength; i++) {
    if (!(message.requests[i].requestId in imageRequests)) {
      imageRequests[message.requests[i].requestId] = message.requests[i];
    }
  }

  // console.dir(imageRequests);

  let paintTargetElements = [];

  // Get all Image objects
  let htmlElementsImg = $("img:not([cfdebugger-request-id])");
  htmlElementsImg.each(function(index, value) {
    paintTargetElements.push($(this));
  });

  // Get all Figure objects
  let htmlElementsFigure = $("figure:not([cfdebugger-request-id])");
  htmlElementsFigure.each(function(index, value) {
    paintTargetElements.push($(this));
  });

  let temp;

  $("div:not([cfdebugger-request-id])").filter(function() {
    temp = $(this).css("background-image");
    if (temp.includes("url") && !temp.includes("data:image")) {
      paintTargetElements.push($(this));
    }
  });

  $("span:not([cfdebugger-request-id])").filter(function() {
    temp = $(this).css("background-image");
    if (temp.includes("url") && !temp.includes("data:image")) {
      paintTargetElements.push($(this));
    }
  });

  $("a:not([cfdebugger-request-id])").filter(function() {
    temp = $(this).css("background-image");
    if (temp.includes("url") && !temp.includes("data:image")) {
      paintTargetElements.push($(this));
    }
  });

  $("i:not([cfdebugger-request-id])").filter(function() {
    temp = $(this).css("background-image");
    if (temp.includes("url") && !temp.includes("data:image")) {
      paintTargetElements.push($(this));
    }
  });

  markAllImg(paintTargetElements);
  sendResponse({result: true});
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type !== 'copy-url') return;
  let popupURLTextArea = document.getElementsByClassName('cf-debugger-popup-url-text-area')[0];
  popupURLTextArea.select();
  document.execCommand("copy");
});


function markAllImg(paintTargetElements) {
  let imgjQueryObj = null;
  let imgRequest = null;
  let paintTargetElementsLength = paintTargetElements.length;
  for (let i = 0; i < paintTargetElementsLength; i++) {
    imgjQueryObj = paintTargetElements[i];
    // If a Img DOM has `cfdebugger-request-id`, no need to do again.
    if (!imgjQueryObj[0].hasAttribute('cfdebugger-request-id')) {
      imgRequest = getImageRequest(imgjQueryObj);
      if (imgRequest) {
        imgjQueryObj.attr('cfdebugger-request-id', imgRequest.requestId);

        if (imgRequest.cfCached) {
          imgjQueryObj.attr('cf-debugger-style', 'cache');
        } else if (imgRequest.rayId != "") {
          imgjQueryObj.attr('cf-debugger-style', 'grayscale');
        } else {
          imgjQueryObj.attr('cf-debugger-style', 'external');
        }
      }
    }
  }
}

function getImageRequest(imgjQueryObj) {
  let srcURL,requestObject, requestId;

  if (imgjQueryObj[0].currentSrc) {
    srcURL = imgjQueryObj[0].currentSrc;
  } else {
    srcURL = parseBackgroundURL(imgjQueryObj.css('background-image'));
  }
  
  for (requestId in imageRequests) {
    requestObject = imageRequests[requestId];
    
    if (requestObject.url == srcURL) return requestObject; 
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
