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

var mouseMoveThreashold = 20;
var mouseMoveIFrameTheshold = 2;

var tabId = null;

var hoveredImages = {};

var isReadyToCheck = false;

var popupResponseHeaders = ['content-type', 'cf-cache-status', 'content-length', 'expires'];


var timestamp = null;
var lastMouseX = null;
var lastMouseY = null;


$("body").on('mousemove', '*', function(event){
  if (timestamp === null) {
    timestamp = Date.now();
    lastMouseX = event.screenX;
    lastMouseY = event.screenY;
    return;
  }

  let now = Date.now();
  let dt =  now - timestamp;
  let dx = event.screenX - lastMouseX;
  let dy = event.screenY - lastMouseY;
  let speedX = Math.round(dx / dt * 100);
  let speedY = Math.round(dy / dt * 100);

  timestamp = now;
  lastMouseX = event.screenX;
  lastMouseY = event.screenY;

  console.log(`${speedX} : ${speedY}`);



  mouseX = event.clientX;
  mouseY = event.clientY;
  if (mouseMovementCounter()) {
    moveChecker(mouseX, mouseY);
    if (iFrameImage && !checkIFrameImage()) {
      iFrameImage = true;
      resetPreviousImageMatch();
    }
  }
});

$("body").on('mouseenter', '*', function(event){
  mouseEnterX = event.clientX;
  mouseEnterY = event.clientY;
  hoverChecker();

  if (!checkIFrameImage()) resetPreviousImageMatch();
});

function hoverChecker() {
  let elementHoverOver = $(document.querySelectorAll(":hover"));
  
  if (elementHoverOver.length < 1) return;

  let lastIndex = elementHoverOver.length - 1;

  // targetParentNode will be used as a stopping point
  let targetParentNode;
  let currentNode;

  if (lastIndex > 0) targetParentNode = $(elementHoverOver[lastIndex].parentNode);

  hoveredImages = [];

  // if (targetParentNode.attr("class") && targetParentNode.attr("class").match("cfdebugger-image-match")) {
  //   // hoveredImages
  //   // handleHoveredImage(currentNode);
  //   hoveredImages.push(targetParentNode[0]);
  //   hoveredImages.push(...targetParentNode.find(".cfdebugger-image-match"));
  //   // console.log('edgeCase');
  //   // console.log(hoveredImages);
  //   return;
  // } else {
  //   hoveredImages = targetParentNode.find(".cfdebugger-image-match");
  //   // childMatch = targetParentNode.find(".cfdebugger-image-match");
  //   // console.log('normal case');
  //   // console.log(hoveredImages);
  // }
  // 


  // console.log(childMatch);

  // isReadyToCheck = false;
  // console.dir(elementHoverOver);
  // for (let i = lastIndex; i >= 0; i--) {
  //   currentNode = $(elementHoverOver[i]);
  //   if (currentNode.is(targetParentNode)) { i = -1; }

  //   if (currentNode.attr("class") && currentNode.attr("class").match("cfdebugger-image-match")) {
  //     handleHoveredImage(currentNode);
  //     return;
  //   } else {
  //     // Pass to Checker
  //     childMatch = currentNode.find(".cfdebugger-image-match");
  //   }
  // }

  // isReadyToCheck = true;


  for (let i = lastIndex; i >= 0; i--) {
    currentNode = $(elementHoverOver[i]);
    if (currentNode.is(targetParentNode)) { i = -1; }

    if (currentNode.attr("class") && currentNode.attr("class").match("cfdebugger-image-match")) {
      handleHoveredImage(currentNode);
      return;
    } else {
      // Pass to Checker
      childMatch = currentNode.find(".cfdebugger-image-match");
    }
  }

  hidePopup();
}

function moveChecker(mX, mY) {
  let elementMouseIsOver = $(document.elementFromPoint(mX, mY));
  let found = false;
  if (elementMouseIsOver.attr("class") && elementMouseIsOver.attr("class").match("cfdebugger-image-match")) {
    found = true;
    handleHoveredImage(elementMouseIsOver);
  } else if (childMatch.length > 0) {

    
    childMatch.each(function() {
      tempObj = $(this)[0].getBoundingClientRect();

      if (mX >= tempObj.left 
        && mX <= tempObj.right
        && mY >= tempObj.top
        && mY <= tempObj.bottom
      ) {
        found = true;
        handleHoveredImage($(this));
      }
    });
  }

  // console.dir(hoveredImages);

  if (!found) { 
    resetPrevIMG(null); 
    hidePopup();
  }
} 

function handleHoveredImage(imageDOM) {
  resetPrevIMG(imageDOM);
  if (!imageDOM.hasClass("cf-debugger-grayscale")) {

    imageDOM.addClass("cf-debugger-grayscale");
    let imageRequest = getImageRequest(imageDOM);
    // hoveredImages[imageRequest.requestId] = imageRequest;
    if (checkIFrameImage()) {
      if (iFrameMouseMovementCounter()) {
        sendImageToDevTools(imageRequest);
      } 
    } else {
      getPopupPosition(imageDOM);

      updatePopupDOM(imageRequest);
      showPopup();
    }
  }
}

function getPopupPosition(imageDOM) {
  let tempObj = imageDOM[0].getBoundingClientRect();
  let windowWidth = $(window).width();
  let windowheight = $(window).height();
  let popupDOM = $('.cf-debugger-popup');
  popupDOMDimension = popupDOM[0].getBoundingClientRect();

  if ((tempObj.right + popupDOMDimension.width) > windowWidth) {
    mouseEnterX = tempObj.left;
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

function resetPrevIMG(newImageMatch) {
  if (prevImageMatch) prevImageMatch.removeClass("cf-debugger-grayscale");
  prevImageMatch = newImageMatch;
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

  let popupDivBodyStatusCode = document.createElement('h2');
  popupDivBodyStatusCode.className = 'cf-debugger-popup-detail-cf-status-code';
  textNode = document.createTextNode('Status:');
  popupDivBodyStatusCode.appendChild(textNode);

  let popupDivBodyCache = document.createElement('h2');
  popupDivBodyCache.className = 'cf-debugger-popup-detail-cf-cache';
  textNode = document.createTextNode('CF Cache:');
  popupDivBodyCache.appendChild(textNode);

  let popupDivBodyPolish = document.createElement('h2');
  popupDivBodyPolish.className = 'cf-debugger-popup-detail-cf-polish';
  textNode = document.createTextNode('Polish:');
  popupDivBodyPolish.appendChild(textNode);

  let popupDivBodyRailgun = document.createElement('h2');
  popupDivBodyRailgun.className = 'cf-debugger-popup-detail-cf-railgun';
  textNode = document.createTextNode('Railgun:');
  popupDivBodyRailgun.appendChild(textNode);

  let popupDivBodyImageResizing = document.createElement('h2');
  popupDivBodyImageResizing.className = 'cf-debugger-popup-detail-cf-image-resizing';
  textNode = document.createTextNode('Image Resizing:');
  popupDivBodyImageResizing.appendChild(textNode);

  // let popupDivHeaderSummary = document.createElement('h1');
  // popupDivHeader.className = 'cf-debugger-popup-title';
  // let headerNode = document.createTextNode('Pop-up div Successfully Displayed');
  // popupDivHeader.appendChild(headerNode);



  let popupDivBodyHeaders = document.createElement('h1');
  popupDivBodyHeaders.className = 'cf-debugger-popup-detail-headers';
  textNode = document.createTextNode('Relevant Headers');
  popupDivBodyHeaders.appendChild(textNode);

  let popupDivBodyHeadersDetail = document.createElement('div');
  popupDivBodyHeadersDetail.className = 'cf-debugger-popup-detail-headers-detail';
  textNode = document.createTextNode('Relevant Headers');
  popupDivBodyHeadersDetail.appendChild(textNode);


  // let popupDivText = document.createElement('p');
  // popupDivText.className = 'cf-debugger-popup-detail-headers';
  // textNode = document.createTextNode('');
  // popupDivText.appendChild(textNode);

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
      updatePopupDOM(message.message)
      showPopup();
    }

    iFrameImage = true;
    iFrameImageFound = true;
  }
});

function updatePopupDOM(imageRequest) {
  if (imageRequest) {

    let popupTitle = document.getElementsByClassName('cf-debugger-popup-title')[0];
    let popupDetailStatusCode = document.getElementsByClassName('cf-debugger-popup-detail-cf-status-code')[0];
    let popupDetailCache = document.getElementsByClassName('cf-debugger-popup-detail-cf-cache')[0];
    let popupDetailPolish = document.getElementsByClassName('cf-debugger-popup-detail-cf-polish')[0];
    let popupDetailRailgun = document.getElementsByClassName('cf-debugger-popup-detail-cf-railgun')[0];
    let popupDetailImageResizing = document.getElementsByClassName('cf-debugger-popup-detail-cf-image-resizing')[0];
    let popupDetailHeaders = document.getElementsByClassName('cf-debugger-popup-detail-headers-detail')[0];

    // if (imageRequest.url.length > 40) {
    //   popupTitle.innerHTML = shortenURL(imageRequest.url);
    // } else {
    //   popupTitle.innerHTML = imageRequest.url;
    // }

    // popupTitle.innerHTML = "";
    
    let headersInString = "";
    for (let header in imageRequest.responseHeaders) {
      if (popupResponseHeaders.includes(header)) {
        headersInString += `<h2> ${header}: ${imageRequest.responseHeaders[header]} </h2>`;
      }
    }

    popupDetailHeaders.innerHTML = headersInString;

    popupDetailStatusCode.innerHTML = `Status: ${imageRequest.statusCode}`;
    popupDetailCache.innerHTML = `Cache: ${imageRequest.cfCached || false}`;
    popupDetailPolish.innerHTML = `Polish: ${imageRequests.polished || false}`;
    popupDetailRailgun.innerHTML = `Railgun: ${imageRequests.railguned || false}`;
    popupDetailImageResizing.innerHTML = `Image Resizing: ${imageRequests.imageResized || false}`;
  }
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type.match('remove-grey-scale') && tabId == message.tabId) {
    if (checkIFrameImage()) {
      resetPrevIMG(null);
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

function highlightDetails(headers) {

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
      if (message.currentURL.match(documentDOM[i].URL)) {
        if (!hasPopUpDOM()) {
          appendPopupDOMToBody();
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
        imgjQueryObj.attr('cfdebugger-request-id', imgRequest.requestId);
        imgjQueryObj.removeClass("cf-debugger-blur cf-debugger-opacity cf-debugger-saturate cf-debugger-grayscale cf-debugger-invert");

        if (imgRequest.cfCached) {
          imgjQueryObj.addClass('cf-debugger-invert');

        } else {
          imgjQueryObj.addClass('cf-debugger-blur');
          
        }
      } else {

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