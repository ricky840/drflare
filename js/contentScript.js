chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type !== 'content-script-status') return;
  sendResponse({result: true});
  return true;
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type !== 'content-script-paint') return;
  var urls = message.urls;
  var parser = document.createElement('a');
  var parsedUrls = [];
  for (var i=0; i < urls.length; i++) {
    parser.href = urls[i];
    parsedUrls.push({
      path: parser.pathname,
      full_url: urls[i],
      path_and_query: parser.pathname + parser.search,
      path_without_slash: parser.pathname.substr(1)
    });
  }

  $('img').each(function() {
    let thisObj = $(this);
    let src = $(this).attr('src');
    var domFound = false;

    for (var j=0; j < parsedUrls.length; j++) {
      var parsedUrl = parsedUrls[j];
      for (var key in parsedUrl) {
        if (parsedUrl[key] === src) {
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
  });

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
