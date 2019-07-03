chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type !== 'content-script-status') return;
  sendResponse({result: true});
  return true;
});

var previous_url = "";

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type !== 'content-script-paint') return;
  var urls = message.urls;
  var parser = document.createElement('a');
  var parsedUrls = [];

  if (urls.length === 1 && previous_url === urls[0]) {
    sendResponse({result: true});
    return true;
  } else if (urls.length === 1 && previous_url != "") {
    previous_url = urls[0];
  }

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

  $("img)

  $(this).css('background-image')


  var imgs = Array.from(document.getElementsByTagName("img"));
  kkkk
  console.log(typeof imgs);
  console.log(typeof paintTargetElements);

  console.log(imgs);
  

  paintTargetElements = imgs.slice();
  console.log(paintTargetElements);


  console.log("found img tags " + paintTargetElements.length);

  // iframe
  var iframes = document.getElementsByTagName('iframe');
  console.log("found iframes = " + iframes.length);
  
  for (var i=0; i < iframes.length; i++) {
    // var iframe_imgs = iframes[i].contentDocument.getElementsByTagName("img");
    // var iframe_imgs = iframes[i].contentWindow.document.getElementsByTagName("img");
    var innerDoc = iframes[i].contentDocument || iframes[i].contentWindow.document;
    var iframe_imgs = innerDoc.getElementsByTagName("img");
    // console.log(iframe_imgs.length);
    for (var j=0; j < iframe_imgs.length; j++) {
      paintTargetElements.push($(iframe_imgs[j]));
    }
  }

  console.log("found img tags including iframes " + paintTargetElements.length);


  for (var i=0; i < paintTargetElements.length; i++) {
    let thisObj = paintTargetElements[i];
    var src = thisObj.attr('src');
    if (src) {
      src.trim();
    }

    var domFound = false;

    for (var j=0; j < parsedUrls.length; j++) {
      var parsedUrl = parsedUrls[j];
      for (var key in parsedUrl) {
        if (parsedUrl[key] == src) {
          domFound = true;
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
  // $('img').each(function() {
  // });

  sendResponse({result: true});
  return true;
});

function paintImgDom(imgjQueryObj) {
  if (imgjQueryObj.parent().hasClass('cfdebugger-container')) {
    return false;
  } else {
    imgjQueryObj.wrap("<div class='cfdebugger-container'>");
    imgjQueryObj.after("<div class='cfdebugger-overlay'></div>");
    return true;
  }
}
