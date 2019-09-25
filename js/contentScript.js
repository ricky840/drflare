/**
 * A copy of this content script not only gets injected to the main
 * HTML (the loaded page) but also to each iframe HTML on the page.
 *
 * Handle the following tasks:
 * - Receive every image requests from Network tab (devTools.js).
 * - Scrape every image DOM from the web context and match URLs.
 * - Identify hovered images and display popup on web pages.
 */

"use strict";

// All image requests from devtool (Network tab)
var imageRequests = {};

// All image DOMs that are underneath of cursor
var childMatch = [];
var iFrameImage = false;
var iFrameImageFound = true;

// Current mouse X and Y position
var mouseX = 0;
var mouseY = 0;

// Mouse event frequency scalses with the number of iframes on a page
// These limit were set to optimize the mouse event performance
var mouseMoveThreashold = 15;
var mouseMoveIFrameTheshold = 2;
var mouseMoveHoverTheshold = 1;

// Initializing the mouse event counters
var mouseMovementCounterForIFrame = 0;
var mouseMovementCounterForParent = 0;
var mouseMovementCounterForHover = 0;

// Upper limit for the number of hovered images for the second
// level DOM hierarchy
var imageObjectCountLimit = 80;

// Number of labels on the popup window.
var numberOfLabelsInRow = 4;

// Number of pixels off from the popup location
var popupMouseOffset = 50;

// Chrome tab ID
var tabId = null;

// Image DOMs that are hovered
var hoveredImages = [];

// Number of image DOMs that are hovered
var hoveredImageCount = 0;

// All image DOMs were hovered previously
var previousHoveredImages = {};

// A blocker for mousemove event
var isReadyToCheck = true;

// A list of popup response headers
var popupResponseHeaders = [
  'cf-ray', 'content-type',
  'content-length'
];

/* Another collection of popup response header list
var popupResponseHeaders = [
  'status', 'cf-ray', 'cf-cache-status', 'content-type',
  'content-length', 'expires', 'age', 'cf-railgun',
  'cf-polished', 'cf-bgj', 'cf-resized'
];
*/

// A list of popup labels
var cloudflareFeatureNames = [
  'Proxied', 'HIT', 'MISS', 'External',
  'Railgun', 'Minify', 'Polish', 'Resized'
];

// Popup dimension: width and height
var popupWidth = 370;
var popupHeight = 550;

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////      Content JS injection & Image Request listener    /////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
 
/**
 * Check to see if content script has already been injected
 */
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type !== 'content-script-status') return;
  tabId = message.tabId;

  // Send response back to devTools.js (injectContentScript function)
  sendResponse({ result: true });
  return true;
});

/**
 * Check to see if the page is dom-ready
 */
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type !== 'content-script-dom-status') return;
  tabId = message.tabId;

  if (document.readyState === "interactive" || document.readyState === "complete") {
    let documentDOM = $(document);
    let documentDOMLength = documentDOM.length;
    let i, iframeBodyDOM, iframeDOMS;

    for (i = 0; i < documentDOMLength; i++) {
      // Append one customized popup DOM at the end of the main HTML.
      if ((message.currentURL == documentDOM[i].URL) || hasPopUpDOM()) {
        if (!hasPopUpDOM()) {
          appendPopupDOMToBody();
          iframeDOMS = $(documentDOM[i].querySelectorAll('iframe'));
          /**
           * Each ifram will have a SEPARATE copy of contentJS injected. In
           * other words, the number of mouse events will also scale up.
           * Therefore, the mouseMoveThreshold needs to be scale with the
           * number of iframe on a page.
           */
          mouseMoveThreashold = mouseMoveThreashold * (1 + iframeDOMS.length);
        }
      /**
       * iframes need an indentifier class because the images DOMs in iframe
       * cannot be accessed from the main HTML DOM. In order to access iframe
       * image DOM for the popup in main, the hovered iframe image information
       * needs to be send through background.
       * Current flow:
       * contentscript (iframe) -> background (devTools) -> contentscript (main)
       */ 
      } else {
        iframeBodyDOM = $(documentDOM[i].querySelectorAll('body'));
        if (iframeBodyDOM.attr("class") && iframeBodyDOM.attr("class").match("cfdebugger-iframe-body")) {
          // Do nothing.
        } else {
          iframeBodyDOM.addClass('cfdebugger-iframe-body');
        }
      }
    }

    sendResponse({ result: true });
  }

  sendResponse({ result: false });
});

/**
 * Construct and append a popup DOM at the end of the main 'body'.
 * Note: Tried to append this popup as a HTML string but that broke some of
 * tested websites.
 */
function appendPopupDOMToBody() {
  let textNode;
  let popupDiv = document.createElement('div');
  popupDiv.className = 'cf-debugger-popup';

  // Empty title for now
  let popupFeatureHeader = document.createElement('p');
  popupFeatureHeader.className = 'cf-debugger-popup-title';
  textNode = document.createTextNode('Cloudflare Features');
  popupFeatureHeader.appendChild(textNode);
  popupDiv.appendChild(popupFeatureHeader);

  let popupDividerFirst = document.createElement('div');
  popupDividerFirst.className = 'cf-debugger-popup-divider';
  popupDiv.appendChild(popupDividerFirst);

  let popupGrid = document.createElement('div');
  popupGrid.className = 'cf-debugger-popup-grid';

  // Add labels to popup
  let i, j, popupRow, popupColumn, popupLabel;
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

  // URL section
  let popupURLHeader = document.createElement('h4');
  popupURLHeader.className = 'cf-debugger-popup-title';
  textNode = document.createTextNode('Image URL');
  popupURLHeader.appendChild(textNode);
  popupDiv.appendChild(popupURLHeader);

  let popupDividerSecond = document.createElement('div');
  popupDividerSecond.className = 'cf-debugger-popup-divider';
  popupDiv.appendChild(popupDividerSecond);

  let popupURLHolder = document.createElement('p');
  popupURLHolder.className = 'cf-debugger-popup-url-holder';
  textNode = document.createTextNode('');
  popupURLHolder.appendChild(textNode);
  popupDiv.appendChild(popupURLHolder);

  // Image place holder.
  let popupImageThumbnailHeader = document.createElement('h4');
  popupImageThumbnailHeader.className = 'cf-debugger-popup-title';
  textNode = document.createTextNode('Image');
  popupImageThumbnailHeader.appendChild(textNode);
  popupDiv.appendChild(popupImageThumbnailHeader);

  let popupDividerThumbnail = document.createElement('div');
  popupDividerThumbnail.className = 'cf-debugger-popup-divider';
  popupDiv.appendChild(popupDividerThumbnail);

  let popupImageThumbnailContainer = document.createElement('div');
  popupImageThumbnailContainer.className = 'cf-debugger-popup-thumbnail-container';

  let popupImageThumbnail = document.createElement('img');
  popupImageThumbnail.className = 'cf-debugger-popup-thumbnail';
  popupImageThumbnailContainer.appendChild(popupImageThumbnail);

  popupDiv.appendChild(popupImageThumbnailContainer);

  let popupImageCountHeader = document.createElement('h4');
  popupImageCountHeader.className = 'cf-debugger-popup-title';
  textNode = document.createTextNode('Layered Images');
  popupImageCountHeader.appendChild(textNode);
  popupDiv.appendChild(popupImageCountHeader);

  let popupDividerForth = document.createElement('div');
  popupDividerForth.className = 'cf-debugger-popup-divider';
  popupDiv.appendChild(popupDividerForth);

  // Number of images underneath of cursor
  let popupImageCount = document.createElement('p');
  popupImageCount.className = 'cf-debugger-popup-image-counter';
  popupDiv.appendChild(popupImageCount);

  let popupReasponseHeader = document.createElement('h4');
  popupReasponseHeader.className = 'cf-debugger-popup-title';
  textNode = document.createTextNode('Response Headers');
  popupReasponseHeader.appendChild(textNode);
  popupDiv.appendChild(popupReasponseHeader);

  let popupDividerThird = document.createElement('div');
  popupDividerThird.className = 'cf-debugger-popup-divider';
  popupDiv.appendChild(popupDividerThird);

  // Response headers
  let popupResponseHolder = document.createElement('div');
  popupResponseHolder.className = 'cf-debugger-popup-headers';
  popupDiv.appendChild(popupResponseHolder);

  document.body.appendChild(popupDiv);
}

/**
 * Check to see if the main HTML has the popup DOM.
 *
 * @returns {bool} - true if the popup DOM has been appended to the main HTML
 */
function hasPopUpDOM() {
  let popUpDOM = $('.cf-debugger-popup');
  if (popUpDOM.length > 0) return true;

  return false;
}

/**
 * Receive image requests from the background (devTools.js) and fetch all
 * image DOMs on the page. Then, it calls 'markEveryImage' function to find the
 * matching image DOMs from the received requests.
 */
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type !== 'content-script-paint') return;

  // End if no new image request(s) came in.
  let imageRequestLength = message.requests.length;
  if (imageRequestLength < 1) return;

  // Store all image requests as a Map.
  for (let i = 0; i < imageRequestLength; i++) {
    if (!(message.requests[i].requestId in imageRequests)) {
      imageRequests[message.requests[i].requestId] = message.requests[i];
      // console.dir(message.requests[i]);
      // console.log(message.requests[i].url);
    }
  }

  // A place holder for every image DOM on a page.
  let paintTargetElements = [];

  // Get all 'image' tagged DOMs
  let htmlElementsImg = $("img:not([cfdebugger-request-id])");
  htmlElementsImg.each(function(index, value) {
    paintTargetElements.push($(this));
  });

  // Get all 'figure' tagged DOMs
  let htmlElementsFigure = $("figure:not([cfdebugger-request-id])");
  htmlElementsFigure.each(function(index, value) {
    paintTargetElements.push($(this));
  });

  let temp;

  // Get all background-image with 'div' tag
  $("div:not([cfdebugger-request-id])").filter(function() {
    temp = $(this).css("background-image");
    if (temp.includes("url") && !temp.includes("data:image")) {
      paintTargetElements.push($(this));
    }
  });

  // Get all background-image with 'span' tag
  $("span:not([cfdebugger-request-id])").filter(function() {
    temp = $(this).css("background-image");
    if (temp.includes("url") && !temp.includes("data:image")) {
      paintTargetElements.push($(this));
    }
  });

  // Get all background-image with 'a' tag
  $("a:not([cfdebugger-request-id])").filter(function() {
    temp = $(this).css("background-image");
    if (temp.includes("url") && !temp.includes("data:image")) {
      paintTargetElements.push($(this));
    }
  });

  // Get all background-image with 'i' tag
  $("i:not([cfdebugger-request-id])").filter(function() {
    temp = $(this).css("background-image");
    if (temp.includes("url") && !temp.includes("data:image")) {
      paintTargetElements.push($(this));
    }
  });

  markEveryImage(paintTargetElements);
  sendResponse({ result: true });
});

/**
 * Go through invidual image DOM and mark them 'cache', 'miss', 'external'
 * @param {*} targetImages - Every image DOM on the page.
 */
function markEveryImage(targetImages) {
  // Make a copy of image DOMs
  let paintTargetElements = targetImages;
  let imgjQueryObj = null;
  let imgRequest = null;
  let paintTargetElementsLength = paintTargetElements.length;
  for (let i = 0; i < paintTargetElementsLength; i++) {
    imgjQueryObj = paintTargetElements[i];
    /**
     * If an image DOM already has 'cfdebugger-request-id' attribute, the
     * image has been matched with a request previously.
     */
    if (!imgjQueryObj[0].hasAttribute('cfdebugger-request-id')) {
      // Get the matching image request details
      imgRequest = getImageRequest(imgjQueryObj);
      if (imgRequest) {
        imgjQueryObj.attr('cfdebugger-request-id', imgRequest.requestId);
        // Cloudflare Cached image
        if (imgRequest.cfCached) {
          imgjQueryObj.attr('cf-debugger-style', 'cache');
        // Existing 'cf-ray' header, cache missed image request
        } else if (imgRequest.rayId != "") {
          imgjQueryObj.attr('cf-debugger-style', 'miss');
        // External image request
        } else {
          imgjQueryObj.attr('cf-debugger-style', 'external');
        }
      }
    }
  }
}

/**
 * Find the matching image request URL for an image DOM.
 * @param {*} imgjQueryObj - An image jQuery object
 * @returns {*} - Image request object
 */
function getImageRequest(imgjQueryObj) {
  let sourceURL, requestObject, requestId;

  // image jQuery object may or may not have URL information (currentSrc).
  if (imgjQueryObj[0].currentSrc) {
    sourceURL = imgjQueryObj[0].currentSrc;
  } else {
    // In this case, the image jQuery object will have the source in
    // 'background-image' CSS field.

    // Parse 'backgroud-image' URL.
    sourceURL = parseBackgroundURL(imgjQueryObj.css('background-image'));
  }

  // Loop through every received image request
  for (requestId in imageRequests) {
    requestObject = imageRequests[requestId];

    if (requestObject.url == sourceURL) return requestObject;
  }

  return null;
}

/**
 * Parse CSS 'background-image' URL and return as a full URL.
 * @param {string} backgroundImageURL - 'background-image' currnet source
 * @returns {string} - The full URL of a 'background-image'
 */
function parseBackgroundURL(backgroundImageURL) {
  let firstQuote;
  let lastQuote;

  // Removing (") characters.
  firstQuote = backgroundImageURL.indexOf('"');
  lastQuote = backgroundImageURL.lastIndexOf('"');

  return backgroundImageURL.substring(firstQuote + 1, lastQuote);
}

/**
 * A listener for 'copy popup image URL' action from the background script.
 * Hasn't implemented yet.
 */
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type !== 'copy-url') return;
  let popupURLTextArea = document.getElementsByClassName(
    'cf-debugger-popup-url-text-area')[0];

  // Testing popup URL copy tool
  /*
    popupURLTextArea.select();
    document.execCommand("copy");
  */
});

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
/////////////      Mouse move event listener & Popup handler    ///////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

/**
 * Trigger whenever user cursor enters a different DOM object, and 
 * then it checks the images underneath of the cursor point.
 */
$("body").on('mouseenter', '*', function(event) {
  if (hoverMouseMovementCounter()) {
    hoveredImageChecker();
  }

  /**
   * Case when images in iframe were hovered previously, and
   * now the cursor is back in the main HTML.
   */
  if (iFrameImage && !checkIFrameImage()) {
    iFrameImage = false;
    resetPreviousImageMatch();
  }
});

/**
 * Check all hovered DOMs and filter all images DOMS contain
 * 'cfdebugger-request-id' attribute.
 */
function hoveredImageChecker() {
  /**
   * ':hover' query select every DOM element that are underneath of
   * a cursor and return a list of DOMs from the BOTTOM layer to the
   * SURFACE layer.
   * For example, ['html', 'body', ..., 'div', 'p']
   */
  let elementHoverOver = $(document.querySelectorAll(":hover"));

  if (elementHoverOver.length < 1) return;

  let lastIndex = elementHoverOver.length - 1;

  // secondLevelParentNode will be used as a default stopping point
  let secondLevelParentNode = null;
  /**
   * firstLevekParentNode will be used in case where:
   * 1. Its parent doesn't exist.
   * 2. Its parent node has TOO many images
   */
  let firstLevelParentNode = null;

  if (lastIndex > 0) firstLevelParentNode = $(elementHoverOver[lastIndex].parentNode);

  // Check if the surface layer has a parent DOM
  if (firstLevelParentNode[0].parentNode && firstLevelParentNode[0].parentNode !=
    undefined && lastIndex > 0) {
    secondLevelParentNode = $(firstLevelParentNode[0].parentNode);
  }

  // When second layer isn't empty, get all image DOMs
  if (secondLevelParentNode) {
    childMatch = secondLevelParentNode.find("[cfdebugger-request-id]").addBack(
      "[cfdebugger-request-id]");
  }

  // Fallback. Get all image DOMs in the first parent layer.
  if (firstLevelParentNode && childMatch.length > imageObjectCountLimit) {
    childMatch = firstLevelParentNode.find("[cfdebugger-request-id]").addBack(
      "[cfdebugger-request-id]");
  }

  hidePopup();
}

/**
 * Hide popup if cursor isn't hovering an image.
 */
function hidePopup() { $('.cf-debugger-popup').hide(); }

/**
 * Trigger whenever user cursor moves.
 * Use all image DOMs found from 'mouseenter' event.
 */
$("body").on('mousemove', '*', function(event) {
  // Set current cursor X and Y coordinates.
  mouseX = event.clientX;
  mouseY = event.clientY;

  // Check hovered image DOMs if when it's currently not processing
  // previous 'moveChecker' and hit the event threshold.
  if (mouseMovementCounter() && isReadyToCheck) {
    moveChecker(mouseX, mouseY);
    // iframe image needs to be handle differently
    if (iFrameImage && !checkIFrameImage()) {
      iFrameImage = false;
      // Set image filter back to the original color filtering
      resetPreviousImageMatch();
    }
  }
});

/**
 * Counter for mouseMovementCounterForParent variable to reduce frequency of
 * hovered images checking logic.
 * 
 * @returns - true if the counter is great than or equal to its threshold
 */
function mouseMovementCounter() {
  if (mouseMovementCounterForParent < mouseMoveThreashold) {
    mouseMovementCounterForParent += 1;
    return false;
  } else {
    mouseMovementCounterForParent = 0;
    return true;
  }
}

/**
 * Check if the current image DOM belongs to an iframe.
 * 
 * @returns {bool} - true if the current image DOM belongs
 *                   to iframe
 */
function checkIFrameImage() {
  if ($('body').attr('class') && $('body').attr('class').match(
      'cfdebugger-iframe-body')) return true;

  return false;
}

/**
 * Send an image 'reset' message to devTool.
 */
function resetPreviousImageMatch() {
  chrome.runtime.sendMessage({
    type: 'reset-previous-image',
    tabId: tabId
  });
}

/**
 * Iterate through hovered image DOMs from 'hoveredImageChecker' and check if
 * a cursor is within the image DOM dimension.
 *
 * @param {*} mX - current cursor X position
 * @param {*} mY - current cursor Y position
 */
function moveChecker(mX, mY) {

  // Stop mousemove events from overloading the process 
  isReadyToCheck = false;

  // Get object right underneath of cursor
  let elementMouseIsOver = $(document.elementFromPoint(mX, mY));
  let found = false;
  hoveredImages = [];
  hoveredImageCount = 0;

  // Check surface DOM attribute
  if (elementMouseIsOver.attr("cfdebugger-request-id")) {
    found = true;
    // Push to the collection of currently surface hovered image DOM
    hoveredImages.push(elementMouseIsOver);
  }

  // Iterate through hovered image DOMs from 'hoveredImageChecker'
  if (childMatch.length > 0) {
    childMatch.each(function() {
      // Get image DOM coordinates and width & height
      let tempObj = $(this)[0].getBoundingClientRect();

      // Check if cursor is within the image DOM
      if (mX >= tempObj.left &&
        mX <= tempObj.right &&
        mY >= tempObj.top &&
        mY <= tempObj.bottom
      ) {
        found = true;
        hoveredImageCount++;
        // Push to the collection of currently hovered image DOMs
        hoveredImages.push($(this));
      }
    });
  }

  // Apply the hovered images to the popup DOM
  handleHoveredImages(hoveredImages, hoveredImageCount);

  // If no matching image was found, reset the previous hovered image
  // and hide popup
  if (!found) {
    resetPrevIMG();
    hidePopup();
  }

  // Accept 'mousemove' event again
  isReadyToCheck = true;
}

/**
 * Update popup window details and hovered image filter.
 * 
 * @param {*} imageDOMs  - A list of image DOMs right underneath of cursor
 * @param {*} imageCount - Total number of images right underneath of cursor
 */
function handleHoveredImages(imageDOMs, imageCount) {
  resetPrevIMG();
  let imageDOM, style, imageRequest;
  let imageDOMsLength = imageDOMs.length;
  // console.log(`length: ${imageDOMsLength}`);

  // Loop through each hovered image DOM and display popup and handle 
  // differently if the image belongs to an iframe
  for (let i = 0; i < imageDOMsLength; i++) {
    imageDOM = imageDOMs[i];
    style = imageDOM.attr("cf-debugger-style");

    // Check if the image DOM has already been hovered previously
    if (!style.match('hover')) imageDOM.attr("cf-debugger-style", 'hover');
    // Get image request object with image DOM
    imageRequest = getImageRequest(imageDOM);
    if (imageRequest) previousHoveredImages[imageRequest.requestId] = imageDOM;
    // If the current image DOM belongs to an iframe, it needs to send to
    // parent contentJS where popup DOM exists.
    if (checkIFrameImage()) {
      if (iFrameMouseMovementCounter()) sendImageToDevTools(imageRequest);
    } else {
      if (i == 0) {
        setPopupPosition(imageDOM);
        // Update popup DOM accordingly with the matching image request object
        updatePopupDOM(imageRequest, imageCount);
        showPopup();
      }
    }
  }
}

/**
 * Counter for 'mouseMovementCounterForIFrame' variable to reduce frequency
 * of hovered images checking logic.
 * 
 * @returns - true if the counter is great than or equal to its threshold
 */
function iFrameMouseMovementCounter() {
  if (mouseMovementCounterForIFrame < mouseMoveIFrameTheshold) {
    mouseMovementCounterForIFrame += 1;
    return false;
  } else {
    // Set back to 0
    mouseMovementCounterForIFrame = 0;
    return true;
  }
}

/**
 * Update popup DOM correspond to the hovered image request information.
 * 
 * @param {*} imageRequest - Hovered image request object with all details
 * @param {*} count        - Number of images underneath cursor
 */
function updatePopupDOM(imageRequest, count = 0) {
  if (imageRequest) {
    // To avoid unnecessary request count for popup image, send the image URL
    // to background to omit from any incoming request.
    

    let popupLabels = document.getElementsByClassName('cf-debugger-popup-label');
    let i;

    // Update CF features that are enabled.
    for (i = 0; i < popupLabels.length; i++) {
      switch (popupLabels[i].innerHTML) {
        case ('Proxied'):
          popupLabels[i].setAttribute('cf-label', (imageRequest.rayId != "") ? "green" : "grey");
          break;
        case ('HIT'):
          popupLabels[i].setAttribute('cf-label', (imageRequest.cfCached != "") ? "green" : "grey");
          break;
        case ('MISS'):
          popupLabels[i].setAttribute('cf-label', (!imageRequest.cfCached && imageRequest.rayId != "") ? "green" : "grey");
          break;
        case ('External'):
          popupLabels[i].setAttribute('cf-label', (imageRequest.rayId == "") ? "green" : "grey");
          break;
        case ('Railgun'):
          popupLabels[i].setAttribute('cf-label', (imageRequest.railguned) ? "green" : "grey");
          break;
        case ('Polish'):
          popupLabels[i].setAttribute('cf-label', (imageRequest.imagePolished != "") ? "green" : "grey");
          break;
        case ('Minify'):
          popupLabels[i].setAttribute('cf-label', (imageRequest.minified != "") ? "green" : "grey");
          break;
        case ('Resized'):
          popupLabels[i].setAttribute('cf-label', (imageRequest.imageResized != "") ? "green" : "grey");
          break;
      }
    }

    let popupURL = document.getElementsByClassName('cf-debugger-popup-url-holder')[0];
    popupURL.textContent = imageRequest.url;

    let thumbnailImage = document.getElementsByClassName('cf-debugger-popup-thumbnail')[0];
    // thumbnailImage.src = imageRequest.url;

    // Sending a popup image request with a special header so that it won't counted as a new
    // request in Panel.
    let src = imageRequest.url;
    sendPopupImageWithSpecialHeader(src, thumbnailImage);

    let popupImageCount = document.getElementsByClassName('cf-debugger-popup-image-counter')[0];
    popupImageCount.textContent = `DOM has ${count} layers of image`;

    let popupTitle = document.getElementsByClassName('cf-debugger-popup-headers')[0];
    popupURL.textContent = imageRequest.url;

    while (popupTitle.hasChildNodes()) {
      popupTitle.removeChild(popupTitle.firstChild);
    }

    let header, headerValue, textNode, responseHeader, responseSubHeader;

    // Display response header information
    for (i = 0; i < popupResponseHeaders.length; i++) {
      header = popupResponseHeaders[i];
      headerValue = imageRequest.responseHeaders[header] == undefined ? 'N/A' :
        imageRequest.responseHeaders[header];

      responseHeader = document.createElement('div');
      responseHeader.className = 'cf-debugger-popup-response-header';
      textNode = document.createTextNode(header);
      responseHeader.appendChild(textNode);

      responseSubHeader = document.createElement('div');
      responseSubHeader.className = 'cf-debugger-popup-response-sub-header';
      textNode = document.createTextNode(headerValue);
      responseSubHeader.appendChild(textNode);
      responseHeader.appendChild(responseSubHeader);

      popupTitle.appendChild(responseHeader);
    }

    let popupDiv = document.getElementsByClassName('cf-debugger-popup')[0];
    popupDiv.appendChild(popupTitle);
  }
}

/**
 * Send a popup image request with a special header which can be use as
 * an identifier for our listener.
 * Note: a bug fix for version 0.1.1
 *
 * @param {*} imageURL       - URL of thumbnail image
 * @param {*} thumbnailImage - Thumbnail image holder DOM
 */
function sendPopupImageWithSpecialHeader(imageURL, thumbnailImage = null) {
  if (thumbnailImage) {
    let thumbnailImageRequest = new XMLHttpRequest();
    thumbnailImageRequest.open("GET", imageURL, true);
    // Special Popup image request header
    thumbnailImageRequest.setRequestHeader("Dr-Flare-Popup", "1");
    thumbnailImageRequest.responseType = "arraybuffer";
    thumbnailImageRequest.onload = function (oEvent) {
      // Response's body content in ArrayBuffer
      let arrayBuffer = thumbnailImageRequest.response;
      if (arrayBuffer) {
        // ArrayBuffer to base64 encoded image
        let u8 = new Uint8Array(arrayBuffer);
        /**
         * let b64encoded = btoa(String.fromCharCode.apply(null, u16)) was causing
         * To resolve Uncaught RangeError: Maximum call stack size exceeded
         * https://stackoverflow.com/questions/49123222/converting-array-buffer-
         * to-string-maximum-call-stack-size-exceeded/49124600
         */
        let b64encoded = btoa(new Uint8Array(u8).reduce(function (data, byte) {
          return data + String.fromCharCode(byte);
        }, ''));
        thumbnailImage.src = `data:image/png;base64,${b64encoded}`;
      }
    };
    thumbnailImageRequest.send(null);
  }
}

/**
 * Depending on cursor's position, popup displays on a different location.
 * By default, the popup window displays on the top right corner of the page.
 * 
 * @param {*} imageDOM - Hovered image DOM
 */
function setPopupPosition(imageDOM = null) {
  let popupDOM = $('.cf-debugger-popup');
  let popupDOMDimension = popupDOM[0].getBoundingClientRect();
  let windowWidth = $(window).width();
  // On the very first, popup window width is set to 0
  let width = (popupDOMDimension.width == 0) ? popupWidth : popupDOMDimension.width;
  
  // Popup stays at the right corner unless cursor X position is closer to
  // default popup position. Y-axis isn't important.
  if ((windowWidth - (width + popupMouseOffset)) < mouseX) {
    popupDOM[0].style.removeProperty('right');
    popupDOM[0].style.left = 0;
  } else {
    popupDOM[0].style.removeProperty('left');
    popupDOM[0].style.right = 0;
  }
}

/**
 * Counter for 'mouseMovementCounterForHover' variable to reduce frequency of
 * hovered images checking logic.
 * 
 * @returns - true if the counter is great than or equal to its threshold
 */
function hoverMouseMovementCounter() {
  if (mouseMovementCounterForHover < mouseMoveHoverTheshold) {
    mouseMovementCounterForHover += 1;
    return false;
  } else {
    // Set back to 0
    mouseMovementCounterForHover = 0;
    return true;
  }
}

/**
 * Set back all hovered images back to its filtered color.
 */
function resetPrevIMG() {
  let requestId;
  for (requestId in previousHoveredImages) {

    // Cloudflare cached image
    if (previousHoveredImages[requestId] && imageRequests[requestId].cfCached) {
      previousHoveredImages[requestId].attr("cf-debugger-style", 'cache');
    // Cloudflare cache missed image
    } else if (previousHoveredImages[requestId] && imageRequests[requestId].rayId !=
      "") {
      previousHoveredImages[requestId].attr("cf-debugger-style", 'miss');
    // External (or third party) image
    } else {
      previousHoveredImages[requestId].attr('cf-debugger-style', 'external');
    }
  }

  previousHoveredImages = {};
}

/**
 * Display Popup DOM.
 */
function showPopup() { $('.cf-debugger-popup').fadeIn('fast'); }

/**
 * For images in iframe, hovered image request needs to be sent back to the
 * background (devtool.js) and then forwarded it to the main contentJS where
 * the popup window can be accessed.
 * 
 * @param {*} imageRequest - Hovered image request object
 */
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

// Update the popup window when iframe image was hovered.
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

// Reset iframe image back to its original color filtering.
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type.match('remove-grey-scale') && tabId == message.tabId) {
    // Only when the current content script is on iframe
    if (checkIFrameImage()) {
      resetPrevIMG();
    }
  }
});