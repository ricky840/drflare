var imageRequests = {};

var prevImageMatch = null;
var injectedPopupDOM = false;
var childMatch = [];
var contentInveral = null;
var REFRESH_RATE = 2000;
var frameImage = null;

var something = false;
var newsomething = false;

var mouseX = 0;
var mouseY = 0;

var mouseEnterX = 0;
var mouseEnterY = 0;

var mouseMovementCounterForIFrame = 0;
var mouseMovementCounterForParent = 0;

var mouseMoveThreashold = 25;
var mouseMoveIFrameTheshold = 20;

$("body").on('mousemove', '*', function(event){
  mouseX = event.clientX;
  mouseY = event.clientY;
  if (mouseMovementCounter()) {
    checker();
  }
});

$("body").on('mouseenter', '*', function(event){
  mouseEnterX = event.clientX;
  mouseEnterY = event.clientY;
  hoverChecker();
});

function getCurrentMousePosition() {
  return [mouseX, mouseY];
}

function hoverChecker() {
  let elementHoverOver = $(document.querySelectorAll(":hover"));
  if (elementHoverOver.length < 1) return;

  let lastIndex = elementHoverOver.length - 1;

  // targetParentNode will be used as a stopping point
  let targetParentNode;
  if (lastIndex > 0) { targetParentNode = $(elementHoverOver[lastIndex].parentNode); }
  
  let currentNode;
  let current = getCurrentMousePosition();
  let mX2 = current[0];
  let mY2 = current[1];

  for (let i = lastIndex; i >= 0; i--) {
    currentNode = $(elementHoverOver[i]);
    if (currentNode.is(targetParentNode)) { i = -1; }

    if (currentNode.attr("class") && currentNode.attr("class").match("cfdebugger-image-match")) {
      resetPrevIMG(currentNode);
      currentNode.addClass("cf-debugger-grayscale");

      if (checkIFrameImage()) {
        if (iFrameMouseMovementCounter()) {
          let imageRequest = getImageRequest(currentNode);
          sendImageToDevTools(imageRequest);
        }
      } else {
        showPopup(mouseEnterX, mouseEnterY);
      }
      return;
    } else {
      // Pass to Checker
      childMatch = currentNode.find(".cfdebugger-image-match");
    }
  }

  hidePopup();
}


function checker() {
  let current = getCurrentMousePosition();
  let mX = current[0];
  let mY = current[1];

  let elementMouseIsOver = $(document.elementFromPoint(mX, mY));
  let found = false;
  if (elementMouseIsOver.attr("class") && elementMouseIsOver.attr("class").match("cfdebugger-image-match")) {
    resetPrevIMG(elementMouseIsOver);
    let imageRequest = getImageRequest(elementMouseIsOver);
    elementMouseIsOver.addClass("cf-debugger-grayscale");

    if (checkIFrameImage()) {
      if (iFrameMouseMovementCounter()) {
        sendImageToDevTools(imageRequest);
      } 
    } else {
      updatePopupDOM(imageRequest);
      showPopup(mouseEnterX, mouseEnterY);
    }
    return;

  } else if (childMatch.length > 0) {
    childMatch.each(function() {
      tempObj = $(this)[0].getBoundingClientRect();

      if (mX >= tempObj.left 
        && mX <= tempObj.right
        && mY >= tempObj.top
        && mY <= tempObj.bottom
      ) {
        found = true;
        resetPrevIMG($(this));
        $(this).addClass("cf-debugger-grayscale");
        let imageRequest = getImageRequest($(this));
        if (checkIFrameImage()) {
          if (iFrameMouseMovementCounter()) {
          // if (iFrameMouseMovementCounter()) {
            sendImageToDevTools(imageRequest);
          } 
        } else {
          updatePopupDOM(imageRequest);
          showPopup(mouseEnterX, mouseEnterY);
        }
      }
    });

    if (!found) { 
      resetPrevIMG(null); 
      hidePopup();
    }

    return ;
  }

  resetPrevIMG(null);
  hidePopup();
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
  if (prevImageMatch) {
    prevImageMatch.removeClass("cf-debugger-grayscale");
  }
  prevImageMatch = newImageMatch;
}

function updatePopupDOM(imageRequest) {
  if (imageRequest) {
    let popupTitle = document.getElementsByClassName('cf-debugger-popup-title')[0];
    let popupDetail = document.getElementsByClassName('cf-debugger-popup-detail')[0];
    popupTitle.innerHTML = imageRequest.url;
    // popupDetail.innerHTML = JSON.stringify([...imageRequest.responseHeaders]);

    let headersInString = "";
    for (let header in imageRequest.responseHeaders) {
      headersInString += `${header}: ${imageRequest.responseHeaders[header]} <br>`;
    }

    popupDetail.innerHTML = headersInString;
  }
}

// Append Popup HTML format
function appendPopupDOMToBody() {
  let popupDiv = document.createElement('div');
  popupDiv.className = 'cf-debugger-popup';

  let popupDivHeader = document.createElement('h2');
  popupDivHeader.className = 'cf-debugger-popup-title';
  let headerNode = document.createTextNode('Pop-up div Successfully Displayed');
  popupDivHeader.appendChild(headerNode);

  let popupDivText = document.createElement('p');
  popupDivText.className = 'cf-debugger-popup-detail';
  let textNode = document.createTextNode('his div only appears when the trigger link is hovered over.');
  popupDivText.appendChild(textNode);

  popupDiv.appendChild(popupDivHeader);
  popupDiv.appendChild(popupDivText);
  // document.documentElement.appendChild(popupDiv);
  document.body.appendChild(popupDiv);
}

function showPopup(mX, mY) {
  let scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
  $('.cf-debugger-popup').show()
    .css('top', mY + 10 + scrollTop)
    .css('left', mX + 10);
}

function hidePopup() {
  $('.cf-debugger-popup').hide();
}

function sendImageToDevTools(imageRequest) {
  chrome.runtime.sendMessage({
    type: 'found-image',
    message: imageRequest,
    url: imageRequest.url,
    tabId: tabId
  });
}

function checkIFrameImage() {
  if ($('body').attr('class') && $('body').attr('class').match('cfdebugger-iframe-body')) { return true; } 
  
  return false;
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type.match('found-image-response') && tabId == message.tabId) {
    if ($('body').attr('class') && $('body').attr('class').match('cfdebugger-iframe-body')) {
      // DO NOTHING
    } else {
      // console.log('drawing iFrameImage');
      updatePopupDOM(message.message)

      let current = getCurrentMousePosition();
      let mX2 = current[0];
      let mY2 = current[1];
      showPopup(mX2, mY2);
    }
  }
});

// chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
//   if (message.type !== 'show-tooltip') return;
//   let requestId = message.requestId;
//   // $("[cfdebugger-request-id="+ requestId +"]").addClass("cf-debugger-grayscale");
//   // $("[cfdebugger-request-id="+ requestId +"]").attr('aria-label', 'hello');
// });

// chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
//   if (message.type !== 'show-tooltip') return;
//   let requestId = message.requestId;
//   // $("[cfdebugger-request-id="+ requestId +"]").addClass("cf-debugger-grayscale");
//   // $("[cfdebugger-request-id="+ requestId +"]").attr('aria-label', 'hello');
// });

// chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
//   if (message.type !== 'hide-tooltip') return;
//   let requestId = message.requestId;
//   $("[cfdebugger-request-id="+ requestId +"]").removeClass("cf-debugger-grayscale");
// });


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

  return null;
}

function parseBackgroundURL(backgroundImageURL) {
  let firstQuote; 
  let lastQuote;
  firstQuote = backgroundImageURL.indexOf('"');
  lastQuote = backgroundImageURL.lastIndexOf('"');
  return backgroundImageURL.substring(firstQuote + 1, lastQuote);
}
