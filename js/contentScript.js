chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type !== 'content-script-status') return;
  sendResponse({result: true});
  return true;
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type !== 'content-script-paint') return;
  var tabId = message.tabId;
  var urls = message.urls;
  var parser = document.createElement('a');
  var parsedUrls = [];

  console.log(urls);

  for (var i=0; i < urls.length; i++) {
    parser.href = urls[i];
    parsedUrls.push({
      path: parser.pathname,
      full_url: urls[i],
      path_and_query: parser.pathname + parser.search,
      path_without_slash: parser.pathname.substr(1),
      path_with_slash: parser.pathname,
      path_with_two_slash: "/" + parser.pathname,
      url_without_protocol: "//" + parser.hostname + parser.pathname,
      url_without_protocol_with_query: "//" + parser.hostname + parser.pathname + parser.search
    });
  }


  paintTargetElements = [];


  // iframe -> body -> img
  // elements in body
  
  // console.log("event_arrived");

  var htmlElements = $("*:not(.cfdebugger-container) > img");
  htmlElements.each(function(index, value) {
    paintTargetElements.push($(this));
  });

  $("*:not(.cfdebugger-container) > div").filter(function() {
    var temp = $(this).css("background-image");
    if (temp !== "none") {
      paintTargetElements.push($(this));
    }
  });

  $("*:not(.cfdebugger-container) > span").filter(function() {
    var temp = $(this).css("background-image");
    if (temp !== "none") {
      paintTargetElements.push($(this));
    }
  });

  // $("*:not(.cfdebugger-container) > span").filter(function() {
  //   var temp2 = $(this).css("background-image");
  //   if (temp2 !== "none") {
  //     paintTargetElements.push($(this));
  //     console.log(temp2);
  //   }
  // });

  // $("*:not(.cfdebugger-container) > a").filter(function() {
  //   var temp = $(this).css("background-image");
  //   if (temp !== "none") {
  //     paintTargetElements.push($(this));
  //   }
  // });
 
  // console.log(hello);



  // iframe
  // var iframes = document.getElementsByTagName('iframe');
  // // console.log("found iframes = " + iframes.length);
  //
  // for (var i=0; i < iframes.length; i++) {
  //   // var iframe_imgs = iframes[i].contentDocument.getElementsByTagName("img");
  //   // var iframe_imgs = iframes[i].contentWindow.document.getElementsByTagName("img");
  //   var innerDoc = iframes[i].contentDocument || iframes[i].contentWindow.document;
  //   var iframe_imgs = innerDoc.getElementsByTagName("*:not(.cfdebugger-container) > img");
  //
  //   // console.log(iframe_imgs.length);
  //   for (var j=0; j < iframe_imgs.length; j++) {
  //     paintTargetElements.push($(iframe_imgs[j]));
  //   }
  // }





    for (var i=0; i < paintTargetElements.length; i++) {
      let thisObj = paintTargetElements[i];
      var src = thisObj.attr('src');
      if (src) {
        src.trim();
      }

      var backgroundImageUrl = thisObj.css("background-image");
      backgroundImageUrl = backgroundImageUrl.replace('url(','').replace(')','');
      if (backgroundImageUrl !== "none") {
        backgroundImageUrl.trim();
      }

      // ################ css url compare

      var domFound = false;

      for (var j=0; j < parsedUrls.length; j++) {
        var parsedUrl = parsedUrls[j];
        for (var key in parsedUrl) {
          if (parsedUrl[key] == src) {
            domFound = true;
          }
          if (parsedUrl[key] == backgroundImageUrl) {
            domFound = true;
            console.log("matched " + backgroundImageUrl);
          }
        }
        if (domFound) {
          paintImgDom(thisObj);
           // console.log("Found matching dom, painting " + thisObj.prop('outerHTML'));
          break;
        }
      }

      if (!domFound) {
         // console.log("Matching URL doesn't exist for img dom " + src);
      }
    }

    sendResponse({result: true});
    return true;

  // });

});

function paintImgDom(imgjQueryObj) {
  if (imgjQueryObj.parent().hasClass('cfdebugger-container')) {
    return false;
  } else {
    imgjQueryObj.attr('style', 'position: unset !important');
    imgjQueryObj.wrap("<div class='cfdebugger-container'>");
    imgjQueryObj.after("<div class='cfdebugger-overlay'></div>");
    return true;
  }
}
