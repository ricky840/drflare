// Todo - Scan the page and apply css
var elems = document.body.getElementsByTagName("*");
var hello = "";

for (var i=0; i < elems.length; i++) {
  let element = elems[i];
  if (element.tagName === 'IMG') {
    console.log(element);
    hello = $(element);
    // hello.wrap("<div class='cfdebugger-container'>");

    // $(element).wrapAll("<div class='cfdebugger-container'></div>");
    $("body").find('.cfdebugger-container').append("<div class='cfdebugger-overlay'></div>")
  }
}

var applyOverlay = function(dom) {
    
}
