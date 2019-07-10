var tabId = requests = parser = parsedUrls = paintTargetElements = htmlElementsImg = htmlElementsFigure = null;
var paintedObjectsImages = [];
var domImgUrls = [];
var urls = [];
var matchedURLs = [];
var matchCount = 0;
var imageRequests = [];
// var imageRequests = {};

window.addEventListener('DOMContentLoaded', (event) => {
  // console.log('content DOM ready');
  sendContentReadyMesssage(tabId);
});

// Inject ContentJS and check if the Content DOM is ready to be drawn
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type !== 'content-script-status') return;

  // console.log('contentJS yes');
  tabId = message.tabId;
  sendResponse({result: true});
  return true;
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type !== 'content-script-dom-status') return;

  // console.log('contentJS yes');
  tabId = message.tabId;

  if(document.readyState === "complete") {
    // console.log('contentJS DOM ready');
    sendContentReadyMesssage(tabId);
  }
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type.match('reload-shortcut') && tabId == message.tabId) {
    tabId = requests = parser = parsedUrls = paintTargetElements = htmlElementsImg = htmlElementsFigure = null;
    paintedObjectsImages = [];
    domImgUrls = [];
    urls = [];
    matchedURLs = [];
    imageRequests = [];
  }
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type !== 'content-script-paint') return;
  if (message.requests.length < 1) return;

  // console.log(message.requests);

  // Remove duplicates imageRequest
  let add = false;
  for (let i = 0; i < message.requests.length; i++) {
    add = true;
    for (let j = 0; j < imageRequests.length; j++) {
      if (imageRequests[j].requestId == message.requests[i].requestId) { add = false; } 
    }

    if (add) { imageRequests.push(message.requests[i]); }
  }

  // console.log(imageRequests);

  paintTargetElements = [];

  // Get all Image objects
  htmlElementsImg = $("*:not(.cfdebugger-image-match) > img");
  // htmlElementsImg = $("img");
  htmlElementsImg.each(function(index, value) {
    paintTargetElements.push($(this));
  });

  // Get all Figure objects
  htmlElementsFigure = $("*:not(.cfdebugger-image-match) > figure");
  // htmlElementsFigure = $("figure");
  htmlElementsFigure.each(function(index, value) {
    paintTargetElements.push($(this));
  });

  $("*:not(.cfdebugger-image-match) > div").filter(function() {
  // $("div").filter(function() {
    var temp = $(this).css("background-image");
    if (temp.includes("url") && !temp.includes("data:image")) {
      paintTargetElements.push($(this));
    }
  });

  $("*:not(.cfdebugger-image-match) > span").filter(function() {
  // $("span").filter(function() {
    var temp = $(this).css("background-image");
    if (temp.includes("url") && !temp.includes("data:image")) {
      paintTargetElements.push($(this));
    }
  });

  $("*:not(.cfdebugger-image-match) > a").filter(function() {
  // $("a").filter(function() {
    var temp = $(this).css("background-image");
    if (temp.includes("url") && !temp.includes("data:image")) {
      paintTargetElements.push($(this));
    }
  });

  $("*:not(.cfdebugger-image-match) > i").filter(function() {
  // $("i").filter(function() {
    var temp = $(this).css("background-image");
    if (temp.includes("url") && !temp.includes("data:image")) {
      paintTargetElements.push($(this));
    }
  });

  markAllImg();

  sendResponse({result: true});
  return true;

});

function sendContentReadyMesssage(tabId) {
  chrome.runtime.sendMessage({
    type: 'content-ready',
    message: 'content-Ready', 
    tabId: tabId,
    from: 'contentScript.js'
  });
}


function markAllImg() {
  let imgjQueryObj;
  let imgRequest;
  for (let i = 0; i < paintTargetElements.length; i++) {
    imgjQueryObj = paintTargetElements[i];
    // If a Img DOM has `cfdebugger-image-match`, no need to do again.
    if (!imgjQueryObj.hasClass('cfdebugger-image-match')) {
      imgRequest = getImageRequest(imgjQueryObj);

      if (imgRequest) {
        imgjQueryObj.attr("cfdebugger-id", `${imgRequest.requestId}`);
      }

      ////////////////////////////////////////////////////////////////

      ////Check ImgObj == Webrequest AND Cached
      // if (imgRequest && imgRequest.cfCached) {
      //   if (imgjQueryObj.hasClass('grayscale')) {
      //       imgjQueryObj.removeClass('grayscale');
      //   }
      //   imgjQueryObj.addClass('cfdebugger-highlight');
      //   imgjQueryObj.addClass('cfdebugger-image-match');
      // } else {
      //   if (imgjQueryObj.hasClass('cfdebugger-image-match')) break;
      //   paintImgDom(imgjQueryObj);
      // }

      ////Check ImgObj == Webrequest
      if (imgRequest) {
        imgjQueryObj.addClass('cfdebugger-highlight');
        imgjQueryObj.addClass('cfdebugger-image-match');
        if (imgRequest.cfCached) {
          if (imgjQueryObj.hasClass('grayscale')) {
            imgjQueryObj.removeClass('grayscale');
          }
        } else if (imgRequest.rayId.length > 0) {
          if (imgjQueryObj.hasClass('grayscale')) {
            imgjQueryObj.removeClass('grayscale');
          }
          imgjQueryObj.addClass('invert'); 
        } else {
          if (imgjQueryObj.hasClass('grayscale')) {
            imgjQueryObj.removeClass('grayscale');
          }
          imgjQueryObj.addClass('cf-debugging-blur');
        }
      } else {
        if (imgjQueryObj.hasClass('cfdebugger-image-match')) break;
        paintImgDom(imgjQueryObj);
      }

      // if (imgRequest) {
      //   if (imgjQueryObj.hasClass('grayscale')) {
      //     imgjQueryObj.removeClass('grayscale');
      //   }
      //   imgjQueryObj.addClass('cfdebugger-highlight');
      //   imgjQueryObj.addClass('cfdebugger-image-match');
      // } else {
      //   if (imgjQueryObj.hasClass('cfdebugger-image-match')) break;
      //   paintImgDom(imgjQueryObj);
      // }
    }
  }
}

function getImageRequest(imgjQueryObj) {
  let srcURL;
  let src;
  let matchImageRequest;

  src = imgjQueryObj.attr('src');

  if (imgjQueryObj[0].currentSrc) {
    srcURL = imgjQueryObj[0].currentSrc;
  } else if (src) {
    srcURL = src.trim();
  } else {
    srcURL = parseBackgroundURL(imgjQueryObj.css('background-image'));
  }
 
  // Requests based
  for (let i = 0; i < imageRequests.length; i++) {
    // console.log(`${imageRequests[i].url} == ${srcURL}`)
    if (imageRequests[i].url == srcURL) {

      if (paintedObjectsImages.indexOf(imageRequests[i])) {
        paintedObjectsImages.push(imageRequests[i]);
        matchedURLs.push(srcURL);
      }
      matchImageRequest = imageRequests[i];
      // console.log(`Matchfound: ${i} : ${imageRequests[i].url} and ${srcURL}`);
      // console.log(JSON.parse(JSON.stringify(imageRequests)));
      imageRequests.splice(i,1);
      // console.log(JSON.parse(JSON.stringify(imageRequests)));
      return matchImageRequest;
    }
  }

  for (let i = 0; i < paintedObjectsImages.length; i++) {
    if (paintedObjectsImages[i].url == srcURL) {
      return paintedObjectsImages[i];
    }
  }

  return null;
}

function paintImgDom(imgjQueryObj) {
  imgjQueryObj.addClass('cfdebugger-highlight');
  imgjQueryObj.addClass('grayscale'); 
}

function parseBackgroundURL(backgroundImageURL) {
  let firstQuote; 
  let lastQuote;

  firstQuote = backgroundImageURL.indexOf('"');
  lastQuote = backgroundImageURL.lastIndexOf('"');

  return backgroundImageURL.substring(firstQuote + 1, lastQuote);
}

function addPaintedObjectsImages(requests) {
  if (requests.length > 1) {
    paintedObjectsImages.push(...requests);
  } else {
    paintedObjectsImages.push(requests[0]);
  }
}



function isCachedImage(imgjQueryObj) {
  for (let i = 0; i < imageRequests.length; i++) {
    // console.log(`${requests[i].url} and ${imgjQueryObj[0].currentSrc}`);
    if (imageRequests[i].url.includes(imgjQueryObj[0].currentSrc)) {
      return true;
      // return requests[i].cfCached; 
    }
  }

  return false;
}

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

// $('.activating.element')
//   .popup()
// ;

// $('img')
//   .popup({
//     title   : 'Popup Title',
//     content : `${$(this).val( $(this).attr("cfdebugger-id") )}`
//   })
  
// ;

// $('figure')
//   .popup({
//     title   : 'Popup Title',
//     content : 'Hello I am a popup'
//   })
// ;
