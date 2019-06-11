chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type !== 'content-script-status') return;
  sendResponse({result: true});
  return true;
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type !== 'content-script-paint') return;
  $("body").find("img").wrap("<div class='cfdebugger-container'>");
  $("body").find('.cfdebugger-container').append("<div class='cfdebugger-overlay'></div>");
  sendResponse({result: true});
  return true;
});


$(document).ready(function() {
  // var allElements = document.body.getElementsByTagName("*");
  // var hightlightElements = [];
  //
  // for (var i=0; i < allElements.length; i++) {
  //   let element = allElements[i];
  //   if (element.tagName === 'IMG') {
  //     hightlightElements.push(element);
  //   }
  // }

  // $("body").find("img").wrap("<div class='cfdebugger-container'>");

  // for (var i=0; i < hightlightElements.length; i++) {
  //   $(hightlightElements[i]).wrap("<div class='cfdebugger-container'>");
  // }
  // $("body").find('.cfdebugger-container').append("<div class='cfdebugger-overlay'></div>")
  // $("body").find("img").wrap("<div class='cfdebugger-container'>");
  // $("body").find('.cfdebugger-container').append("<div class='cfdebugger-overlay'></div>");
});
