var cdnCgi = (function(global) {
  'use strict';
  
  const CDNCGI_PATH = '/cdn-cgi/trace';
  const CDNCGI_PROTOCOL = 'http://';
  const DOMID = 'cdn-cgi-result';
  const RAYID_HEADER = 'cf-ray';


  function update() {
    chrome.tabs.get(tabId, function(tabDetail) {

      var txtResult = "";
      var txtResponseHeaders = "";
      var url = tabDetail.url;
      var parser = document.createElement("a");
      parser.href = url;
      var cdnCgiUrl = CDNCGI_PROTOCOL + parser.hostname + CDNCGI_PATH;
      var request = {
        url: cdnCgiUrl,
        headers: {} 
      }

      http.getRequest(request).then(function(result) {
        if (result.statusCode == 200) {

          txtResult = result.responseText;
          txtResponseHeaders = result.responseHeaders;
          let cfHeaderFound = false;
          let arrHeaders = txtResponseHeaders.split('\n');

          for (let i=0; i < arrHeaders.length; i++) {
            let temp = arrHeaders[i].split(':');
            if (temp.length == 2) {
              let headerName = temp[0].trim();
              if (headerName.match(RAYID_HEADER)) {
                // CF-Proxied Domain, we can update the html.
                $(`#${DOMID}`).html(txtResult);
                cfHeaderFound = true;
                break;
              }
            }
          }

          if (!cfHeaderFound) {
            $(`#${DOMID}`).html(`No data available for ${parser.hostname}. Status Code: ${result.statusCode}`);
          }
        } else {
          $(`#${DOMID}`).html(`No data available for ${parser.hostname}. Status Code: ${result.statusCode}`);
        }
      }).catch(function(err) {
        // txtResult = err.responseText;
        $(`#${DOMID}`).html(`No data available for ${parser.hostname}. Status Code: ${err.statusCode}`);
      });
    });
  }

  return {
    update: update
  }

})(this);
