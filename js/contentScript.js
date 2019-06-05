var allElements = document.body.getElementsByTagName("*");
var hightlightElements = [];

for (var i=0; i < allElements.length; i++) {
  let element = allElements[i];
  if (element.tagName === 'IMG') {
    hightlightElements.push(element);
  }
}

for (var i=0; i < hightlightElements.length; i++) {
  $(hightlightElements[i]).wrap("<div class='cfdebugger-container'>");
}

$("body").find('.cfdebugger-container').append("<div class='cfdebugger-overlay'></div>")
