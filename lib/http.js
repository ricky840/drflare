var http = (function(global) {
  'use strict';

  function getRequest(request) {
    return new Promise(function(resolve, reject) {
      $.ajax({
        url: request.url,
        type: 'GET',
        headers: request.headers,
        success: function(response, status, xhr) {
          resolve({
            statusCode: xhr.status,
            responseText: (xhr.responseText) ? xhr.responseText : "",
            responseHeaders: xhr.getAllResponseHeaders().trim()
          });
        },
        error: function(xhr, status, error) {
          reject({
            statusCode: xhr.status,
            responseText: (xhr.responseText) ? xhr.responseText : "",
            responseHeaders: xhr.getAllResponseHeaders().trim()
          });
        },
        complete: function (xhr, status) {
          // console.log(status);
        }
      });
    });
  }

  function postRequest(request) {
    return new Promise(function(resolve, reject) {
      $.ajax({
        url: request.url,
        type: 'POST',
        data: JSON.stringify(request.data),
        headers: request.headers,
        success: function(response, status, xhr) {
          resolve({
            statusCode: xhr.status,
            responseText: (xhr.responseText) ? xhr.responseText : "",
            responseHeaders: xhr.getAllResponseHeaders().trim()
          });
        },
        error: function(xhr, status, error) {
          reject({
            statusCode: xhr.status,
            responseText: (xhr.responseText) ? xhr.responseText : "",
            responseHeaders: xhr.getAllResponseHeaders().trim()
          });
        },
        complete: function (xhr, status) {
          // console.log(status);
        }
      });
    });
  }

  return {
    getRequest: getRequest,
    postRequest: postRequest
  }
})(this);
