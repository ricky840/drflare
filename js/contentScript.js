chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type !== 'content-script-status') return;
  sendResponse({result: true});
  return true;
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type !== 'content-script-paint') return;

  let targetUrls = message.urls;
  var parsedUrls = [];

  var parser = document.createElement('a');
  for (var i=0; i < targetUrls.length; i++) {
    parser.href = targetUrls[i];
    parsedUrls.push({
      path: parser.pathname,
      full_url: targetUrls[i],
      path_and_query: parser.pathname + parser.search,
      path_without_slash: parser.pathname.substr(1)
    });
  }

  $('img').each(function() {
    let thisObj = $(this);
    let src = $(this).attr('src');
    for (var i=0; i < parsedUrls.length; i++) {
      let targetObj = parsedUrls[i];
      for (var key in targetObj) {
        if (targetObj[key] === src) {
          if (paintImgDom(thisObj)) {
            console.log("Painting " + thisObj.prop('outerHTML'));
          }  
        }
      }
    }
  });

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
