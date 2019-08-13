var cdnCgi = (function(global) {
  'use strict';
  
  const CDNCGI_PATH = '/cdn-cgi/trace';
  const CDNCGI_PROTOCOL = 'http://';
  const DOMID = 'cdn-cgi-result';
  const RAYID_HEADER = 'cf-ray';

  var txtResult = "";
  var txtResponseHeaders = "";

  function update() {
    chrome.tabs.get(tabId, function(tabDetail) {
      var url = tabDetail.url;
      var parser = document.createElement("a");
      parser.href = url;

      var cdnCgiUrl = CDNCGI_PROTOCOL + parser.hostname + CDNCGI_PATH;

      var request = {
        url: cdnCgiUrl,
        headers: {} 
      }

      http.getRequest(request).then(function(result) {
        txtResult = result.responseText;
        txtResponseHeaders = result.responseHeaders;
        let arrHeaders = txtResponseHeaders.split('\n');
        for (let i=0; i < arrHeaders.length; i++) {
          let temp = arrHeaders[i].split(':');
          if (temp.length == 2) {
            let headerName = temp[0].trim();
            if (headerName.match(RAYID_HEADER)) {
              // CF-Proxied Domain, we can update the html.
              $(`#${DOMID}`).html(txtResult);
              break;
            }
          }
        }
      }).catch(function(err) {
        txtResult = err.responseText;
        if (txtResult == "") {
          txtResult = "No data available";
        }
      });
    });
  }

  function result() {
    return txtResult;
  }

  return {
    update: update,
    result: result
  }
})(this);
