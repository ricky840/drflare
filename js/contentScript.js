var imageRequests = {};

var prevImageMatch = null;
var found_flag = false;
var childMatch = [];


var mouseX = 0;
var mouseY = 0;

$("body").on('mousemove', '*', function(event){
  mouseX = event.clientX;
  mouseY = event.clientY;
  // console.log(`lastest - ${mouseX}, ${mouseY}`);
  checker();
});

$("body").on('mouseenter', '*', function(event){
  // console.log(`when mouseover - ${mouseX}, ${mouseY}`);
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
  if (lastIndex > 0) {
    targetParentNode = $(elementHoverOver[lastIndex].parentNode);
  }
  
  let currentNode;
  for (let i = lastIndex; i >= 0; i--) {
    currentNode = $(elementHoverOver[i]);

    // Found ParentNode, stop searching after this round
    if (currentNode.is(targetParentNode)) { i = -1; }

    if (currentNode.attr("class") && currentNode.attr("class").match("cfdebugger-image-match")) {
      resetPrevIMG(currentNode);
      currentNode.addClass("cf-debugger-grayscale");
      return;
    } else {
      childMatch = currentNode.find(".cfdebugger-image-match");
    }
  }
}


function checker() {
  let current = getCurrentMousePosition();
  let mX2 = current[0];
  let mY2 = current[1];

  let elementMouseIsOver = $(document.elementFromPoint(mX2, mY2));

  if (elementMouseIsOver.attr("class") && elementMouseIsOver.attr("class").match("cfdebugger-image-match")) {
    resetPrevIMG(elementMouseIsOver);
    elementMouseIsOver.addClass("cf-debugger-grayscale");
    return;
  } else if (childMatch.length > 0) {
    let found = false;
    childMatch.each(function() {
      tempObj = $(this)[0].getBoundingClientRect();
      let current = getCurrentMousePosition();
      mX = current[0];
      mY = current[1];
      if (mX >= tempObj.left 
        && mX <= tempObj.right
        && mY >= tempObj.top
        && mY <= tempObj.bottom
      ) {
        // console.log("Found match!");
        found = true;
        resetPrevIMG($(this));
        $(this).addClass("cf-debugger-grayscale");
      }
    });

    if (!found) { resetPrevIMG(null); }
  } else {
    resetPrevIMG(null);
  }
}


function resetPrevIMG(newImageMatch) {
  if (prevImageMatch) {
    prevImageMatch.removeClass("cf-debugger-grayscale");
  }
  prevImageMatch = newImageMatch;
}


// function test() {
//   var current = getCurrentMousePosition();
//   mX2 = current[0];
//   mY2 = current[1];
//   var elementMouseIsOver = $(document.elementFromPoint(mX2, mY2));
//   // console.log(elementMouseIsOver);
//   // console.log(`${mouseX}, ${mouseY}`);

//   // if (elementMouseIsOver.attr("class") && elementMouseIsOver.attr("class").match("cfdebugger-image-match")) {
//   //   console.log("direct match");
//   //   elementMouseIsOver.addClass("cf-debugger-grayscale");
//   //   // console.log(elementMouseIsOver);
//   //   return;
//   // }
//   //
//   element_image_match = elementMouseIsOver.find(".cfdebugger-image-match");
//   // console.log(element_image_match);

//   if(element_image_match.length > 0 && element_image_match.length < 50) {
//   // if(element_image_match.length == 2) {
//     console.log("Found underlying images - " + element_image_match.length);
//     element_image_match.each(function() {
//       console.log($(this).prop("tagName"));
//       tempObj = $(this)[0].getBoundingClientRect();
//       console.log(tempObj);
//       var current = getCurrentMousePosition();
//       mX = current[0];
//       mY = current[1];
//       console.log(`${mX}, ${mY}`);
//       if (mX >= tempObj.left 
//         && mX <= tempObj.right
//         && mY >= tempObj.top
//         && mY <= tempObj.bottom
//       ) {
//         console.log("Found match!");
//         $(this).addClass("cf-debugger-grayscale");
//       }
//     });
//   }
// }

// function test2(elementMouseIsOver, mouseX, mouseY) {
//   var elements = [];
//
//   if (elementMouseIsOver.prop("tagName") != "HTML" && elementMouseIsOver.prop("tagName") != "BODY") {
//
//     elements.push(elementMouseIsOver);
//     console.log("Pushed");
//     console.log(elementMouseIsOver);
//
//     elementMouseIsOver.hide("fast", function(){
//       elementMouseIsOver = $(document.elementFromPoint(mouseX, mouseY));
//       if (elementMouseIsOver == undefined) {
//         console.log("dead end!");
//         return elements;
//       } else if(elementMouseIsOver.attr("class") == undefined) {
//         console.log("this dom has no class attribute");
//         test2(elementMouseIsOver, mouseX, mouseY);
//       } else if(elementMouseIsOver.attr("class").match("cfdebugger-image-match")) {
//         console.log("found cfdebugger-image-match");
//         console.log(elementMouseIsOver);
//         return elements;
//       } else {
//         console.log("loop");
//         test2(elementMouseIsOver, mouseX, mouseY);
//       }
//     });
//   }
// }















chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type !== 'show-tooltip') return;
  let requestId = message.requestId;
  // $("[cfdebugger-request-id="+ requestId +"]").addClass("cf-debugger-grayscale");
  // $("[cfdebugger-request-id="+ requestId +"]").attr('aria-label', 'hello');
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type !== 'hide-tooltip') return;
  let requestId = message.requestId;
  $("[cfdebugger-request-id="+ requestId +"]").removeClass("cf-debugger-grayscale");
});


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
        imgjQueryObj.attr('cfdebugger-request-id', imgRequest.requestId);
        imgjQueryObj.removeClass("cf-debugger-blur cf-debugger-opacity cf-debugger-saturate cf-debugger-grayscale cf-debugger-invert");

        if (imgRequest.cfCached) {
          imgjQueryObj.addClass('cf-debugger-invert');

          // imgjQueryObj.siblings().each(function(){
          //   $(this).css("pointer-events", "none");
          // });
          // imgjQueryObj.mouseover(function() {
          //   console.log("hi");
          // });
        } else {
          imgjQueryObj.addClass('cf-debugger-blur');
          // imgjQueryObj.siblings().each(function(){
          //   $(this).css("pointer-events", "none");
          // });
          //   imgjQueryObj.mouseover(function() {
          //     console.log("hi2");
          //   });
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
