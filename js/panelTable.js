var requestTable = (function(global) {

  const TABLE_CODES = {
    CFCACHED: "cf-cached-table",
    CFCACHEMISS: "cf-cache-miss-table", 
    EXTERNAL: "external-req-table",
    IMGPOLISH: "image-polished-table",
    IMGRESIZE: "image-resized-table",
    RAILGUN: "railgun-table",
    AUTOMINIFY: "auto-minify-table",
    ALL: "summary-table"
  }

  let TABLE_COLSPAN = {};

  for (let code in TABLE_CODES) {
    TABLE_COLSPAN[code] = $(`#${TABLE_CODES[code]}`).find('th').length;
  }

  function addTableRow(requests) {
    for (var requestId in requests) { 
      let request = requests[requestId];
      var addTableCodes = checkWhichTable(request);
      for(let i=0; i < addTableCodes.length; i++) {
        $(`#${TABLE_CODES[addTableCodes[i]]} .table-no-row`).remove();
        $(`#${TABLE_CODES[addTableCodes[i]]} tbody`).append(createRowHtml(request, addTableCodes[i]));
      }
    }
  }

  function checkWhichTable(request) {
    let targetTableIds = [];
    if(request.cfCached) targetTableIds.push("CFCACHED");
    if(!request.cfCached && request.rayId !== "") targetTableIds.push("CFCACHEMISS");
    if(request.rayId == "") targetTableIds.push("EXTERNAL");
    if(request.imagePolished) targetTableIds.push("IMGPOLISH");
    if(request.minified) targetTableIds.push("AUTOMINIFY");
    if(request.railguned) targetTableIds.push("RAILGUN");
    if(request.imageResized) targetTableIds.push("IMGRESIZE");
    targetTableIds.push("ALL");
    return targetTableIds;
  }

  function createRowHtml(request, tableCode) {
    let html = "";
    let htmlCreated = false;

    let cacheControlHeader = (request.responseHeaders['cache-control'] != undefined) ? request.responseHeaders['cache-control'] : "";
    let contentEncodingHeader = (request.responseHeaders['content-encoding'] != undefined) ? request.responseHeaders['content-encoding']: "";
    let cacheStatus = (request.rayId != "" && request.cfCacheStatus == "") ? "miss" : request.cfCacheStatus;
    let polishSavedRatio = (request.imagePolished && request.origSize != 0 && request.contentLength != 0) ? ((request.origSize-request.contentLength)/request.origSize*100).toFixed(2) : 0;
    let minifiedSavedRatio = (request.minified && request.origSize != 0 && request.contentLength != 0) ? ((request.origSize-request.contentLength)/request.origSize*100).toFixed(3) : 0;

    if (tableCode == "CFCACHED") {
      htmlCreated = true;
      html += `<tr reqid="${request.requestId}">`;
      html += `<td>${request.httpVersion}</td>`;
      html += `<td>${request.method}</td>`;
      html += `<td>${request.url}</td>`;
      html += `<td>${request.statusCode}</td>`;
      html += `<td>${request.rayId}</td>`;
      html += `<td>${request.timingWait.toFixed()}ms</td>`;
      html += `<td>${cacheControlHeader}</td>`;
      html += `<td>${request.serverIPAddress}</td>`;
      html += `<td>${request.contentLength}</td>`;
      html += `<td>${request.objectType}</td>`;
      html += `<td>${cacheStatus}</td>`;
      html += `<td>${request.colo}</td>`;
      html += "</tr>";
      html += createHiddenRowHtml(request, TABLE_COLSPAN[tableCode]);
    } else if (tableCode == "CFCACHEMISS") {
      htmlCreated = true;
      html += `<tr reqid="${request.requestId}">`;
      html += `<td>${request.httpVersion}</td>`;
      html += `<td>${request.method}</td>`;
      html += `<td>${request.url}</td>`;
      html += `<td>${request.statusCode}</td>`;
      html += `<td>${request.rayId}</td>`;
      html += `<td>${request.timingWait.toFixed()}ms</td>`;
      html += `<td>${cacheControlHeader}</td>`;
      html += `<td>${contentEncodingHeader}</td>`;
      html += `<td>${request.serverIPAddress}</td>`;
      html += `<td>${request.contentLength}</td>`;
      html += `<td>${request.objectType}</td>`;
      html += `<td>${cacheStatus}</td>`;
      html += `<td>${request.colo}</td>`;
      html += "</tr>";
      html += createHiddenRowHtml(request, TABLE_COLSPAN[tableCode]);
    } else if (tableCode == "EXTERNAL") {
      htmlCreated = true;
      html += `<tr reqid="${request.requestId}">`;
      html += `<td>${request.httpVersion}</td>`;
      html += `<td>${request.method}</td>`;
      html += `<td>${request.url}</td>`;
      html += `<td>${request.statusCode}</td>`;
      html += `<td>${request.timingWait.toFixed()}ms</td>`;
      html += `<td>${cacheControlHeader}</td>`;
      html += `<td>${contentEncodingHeader}</td>`;
      html += `<td>${request.serverIPAddress}</td>`;
      html += `<td>${request.contentLength}</td>`;
      html += `<td>${request.objectType}</td>`;
      html += "</tr>";
      html += createHiddenRowHtml(request, TABLE_COLSPAN[tableCode]);
    } else if (tableCode == "IMGPOLISH") {
      htmlCreated = true;
      html += `<tr reqid="${request.requestId}">`;
      html += `<td>${request.httpVersion}</td>`;
      html += `<td>${request.method}</td>`;
      html += `<td>${request.url}</td>`;
      html += `<td>${request.statusCode}</td>`;
      html += `<td>${request.rayId}</td>`;
      html += `<td>${request.imagePolishOrigFmt}</td>`;
      html += `<td>${request.objectType}</td>`;
      html += `<td>${request.imagePolishStatus}</td>`;
      html += `<td>${request.imagePolishQuality}</td>`;
      html += `<td>${request.origSize}</td>`;
      html += `<td>${request.contentLength}</td>`;
      html += `<td>${(polishSavedRatio > 0) ? "<p class='ui header inverted tiny green'>" : "<p>"}${polishSavedRatio}%</p></td>`;
      html += `<td>${cacheStatus}</td>`;
      html += `<td>${request.colo}</td>`;
      html += "</tr>";
      html += createHiddenRowHtml(request, TABLE_COLSPAN[tableCode]);
    } else if (tableCode == "IMGRESIZE") {
      htmlCreated = true;
      html += `<tr reqid="${request.requestId}">`;
      html += `<td>${request.httpVersion}</td>`;
      html += `<td>${request.method}</td>`;
      html += `<td>${request.url}</td>`;
      html += `<td>${request.statusCode}</td>`;
      html += `<td>${request.rayId}</td>`;
      html += `<td>${request.imageResizerInternalStatus}</td>`;
      html += `<td>${request.imageResizerProcessTime}ms</td>`;
      html += `<td>${request.contentLength}</td>`;
      html += `<td>${request.objectType}</td>`;
      html += `<td>${cacheStatus}</td>`;
      html += `<td>${request.colo}</td>`;
      html += `<td>${request.imageResizerVersion}</td>`;
      html += "</tr>";
      html += createHiddenRowHtml(request, TABLE_COLSPAN[tableCode]);
    } else if (tableCode == "RAILGUN") {
      htmlCreated = true;
      html += `<tr reqid="${request.requestId}">`;
      html += `<td>${request.httpVersion}</td>`;
      html += `<td>${request.method}</td>`;
      html += `<td>${request.url}</td>`;
      html += `<td>${request.statusCode}</td>`;
      html += `<td>${request.rayId}</td>`;
      html += `<td>${request.timingWait.toFixed()}ms</td>`;
      html += `<td>${(request.railgunDirectConnected) ? "<p class='ui header inverted tiny'>Direct</p>" : "<p class='ui header inverted green tiny'>Listener</p>"}</td>`;
      html += `<td>${request.railgunOptimizedComRatio}</td>`;
      html += `<td>${(request.railgunOptimizedFetchLatency * 1000).toFixed(2)}ms</td>`;
      html += `<td>${request.contentLength}</td>`;
      html += `<td>${request.objectType}</td>`;
      html += `<td>${cacheStatus}</td>`;
      html += `<td>${request.colo}</td>`;
      html += "</tr>";
      html += createHiddenRowHtml(request, TABLE_COLSPAN[tableCode]);
    } else if (tableCode == "AUTOMINIFY") {
      htmlCreated = true;
      html += `<tr reqid="${request.requestId}">`;
      html += `<td>${request.httpVersion}</td>`;
      html += `<td>${request.method}</td>`;
      html += `<td>${request.url}</td>`;
      html += `<td>${request.statusCode}</td>`;
      html += `<td>${request.rayId}</td>`;
      html += `<td>${request.origSize}</td>`;
      html += `<td>${request.contentLength}</td>`;
      html += `<td>${(minifiedSavedRatio > 0) ? "<p class='ui header inverted tiny green'>" : "<p>"}${minifiedSavedRatio}%</p></td>`;
      html += `<td>${request.objectType}</td>`;
      html += `<td>${cacheStatus}</td>`;
      html += `<td>${request.colo}</td>`;
      html += "</tr>";
      html += createHiddenRowHtml(request, TABLE_COLSPAN[tableCode]);
    } else if (tableCode == "ALL") {
      let positive = '<p class="ui olive empty circular label"></p>';
      let negative = '<p class="ui grey empty circular label"></p>';
      htmlCreated = true;
      html += `<tr reqid="${request.requestId}">`;
      html += `<td>${request.httpVersion}</td>`;
      html += `<td>${request.method}</td>`;
      html += `<td>${request.url}</td>`;
      html += `<td>${request.statusCode}</td>`;
      html += `<td>${request.rayId}</td>`;
      html += `<td>${request.objectType}</td>`;
      html += `<td>${request.colo}</td>`;
      html += `<td>${(request.rayId != "") ? positive : negative }</td>`;
      html += `<td>${(request.cfCached && request.rayId != "") ? positive : negative }</td>`;
      html += `<td>${(request.imagePolished) ? positive : negative }</td>`;
      html += `<td>${(request.minified) ? positive : negative }</td>`;
      html += `<td>${(request.railguned) ? positive : negative }</td>`;
      html += `<td>${(request.imageResized) ? positive : negative }</td>`;
      html += "</tr>";
      html += createHiddenRowHtml(request, TABLE_COLSPAN[tableCode]);
    }

    if (!htmlCreated) {
      html += "<tr>";
      html += `<td colspan="${TABLE_COLSPAN[tableCode]}">`;
      html += "No data available";
      html += "</td>";
      html += "</tr>";
    }

    return html;
  }

  function createHiddenRowHtml(request, colspan) {
    let html = "<tr>";

    html += `<td colspan=${colspan} class='td-collapsed'>`;
    html += "<div class='hiddenTableRow'>"; 
    html += "<div class='ui grid padded'>";
    html += "<div class='row'>";

    html += "<div class='four wide column'>";
    html += "<h4 class='ui header inverted orange'>Cloudflare Features</h4>";
    html += "<div class='ui inverted divider'></div>";
    html += `<div>${createCfFeatureRowHtml(request)}</div>`;
    html += "<h4 class='ui header inverted orange'>Request Timings</h4>";
    html += "<div class='ui inverted divider'></div>";
    html += `<div>${createTimingHtml(request)}</div>`;
    html += "</div>";

    html += "<div class='six wide column'>";
    html += "<h4 class='ui header inverted orange'>Request Headers</h4>";
    html += "<div class='ui inverted divider'></div>";
    html += `<div>${createHeaderHtml(request.requestHeaders)}</div>`;
    html += "</div>";
    
    html += "<div class='six wide column'>";
    html += "<h4 class='ui header inverted orange'>Response Headers</h4>";
    html += "<div class='ui inverted divider'></div>";
    html += `<div>${createHeaderHtml(request.responseHeaders)}</div>`;
    html += "</div>";
    
    html += "</div>";
    html += "</div>";
    html += "</div>";
    html += "</td>";
    html += "</tr>";

    return html;
  }

  function createCfFeatureRowHtml(request) {
    let html = '<div class="ui middle aligned relaxed inverted list">';

    html += '<div class="item">';
    html += '<div class="content">';
    html += `<div class="ui horizontal label ${(request.rayId != "") ? "green" : "grey"} inverted">Proxied</div>`;
    html += 'The request went through Cloudflare servers.';
    html += '</div>';
    html += '</div>';

    html += '<div class="item">';
    html += '<div class="content">';
    html += `<div class="ui horizontal label ${(request.cfCached) ? "green" : "grey"} inverted">Cache HIT</div>`;
    html += 'Cloudflare served the object from the cache.';
    html += '</div>';
    html += '</div>';
    
    html += '<div class="item">';
    html += '<div class="content">';
    html += `<div class="ui horizontal label ${(!request.cfCached && request.rayId != "") ? "green" : "grey"} inverted">Cache MISS</div>`;
    html += 'The request was not in Cloudflare cache.';
    html += '</div>';
    html += '</div>';

    html += '<div class="item">';
    html += '<div class="content">';
    html += `<div class="ui horizontal label ${(request.rayId == "") ? "green" : "grey"} inverted">3rd Party</div>`;
    html += 'The request did not contact Cloudflare.';
    html += '</div>';
    html += '</div>';

    html += '<div class="item">';
    html += '<div class="content">';
    html += `<div class="ui horizontal label ${(request.railguned) ? "green" : "grey"} inverted">Railgun</div>`;
    html += 'The object was served through Railgun.';
    html += '</div>';
    html += '</div>';

    html += '<div class="item">';
    html += '<div class="content">';
    html += `<div class="ui horizontal label ${(request.imagePolished) ? "green" : "grey"} inverted">IMG Polish</div>`;
    html += 'Image Polish was applied for the object.';
    html += '</div>';
    html += '</div>';

    html += '<div class="item">';
    html += '<div class="content">';
    html += `<div class="ui horizontal label ${(request.minified) ? "green" : "grey"} inverted">Auto Minify</div>`;
    html += 'The object was minified by Cloudflare.';
    html += '</div>';
    html += '</div>';

    html += '<div class="item">';
    html += '<div class="content">';
    html += `<div class="ui horizontal label ${(request.imageResized) ? "green" : "grey"} inverted">IMG Resized</div>`;
    html += 'The image was resized by Image Resizer.';
    html += '</div>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  function createTimingHtml(request) {
    let html = '<div class="ui inverted list">';

    html += '<div class="item">';
    html += '<h4 class="ui header inverted green">Total Time';
    html += `<div class="sub header">${(request.timingTotal > 0) ? request.timingTotal.toFixed(3) : "< 0"}ms</div>`; 
    html += '</h4>';
    html += '</div>';

    html += '<div class="item">';
    html += '<h4 class="ui header inverted green">DNS Lookup';
    html += `<div class="sub header">${(request.timingDns > 0) ? request.timingDns.toFixed(3) : "< 0"}ms</div>`; 
    html += '</h4>';
    html += '</div>';

    html += '<div class="item">';
    html += '<h4 class="ui header inverted green">SSL Handshake';
    html += `<div class="sub header">${(request.timingSsl > 0) ? request.timingSsl.toFixed(3) : "< 0"}ms</div>`; 
    html += '</h4>';
    html += '</div>';

    html += '<div class="item">';
    html += '<h4 class="ui header inverted green">Connection Time';
    html += `<div class="sub header">${(request.timingConnect > 0) ? request.timingConnect.toFixed(3) : "< 0"}ms</div>`; 
    html += '</h4>';
    html += '</div>';

    html += '<div class="item">';
    html += '<h4 class="ui header inverted green">Request Send';
    html += `<div class="sub header">${(request.timingSend > 0) ? request.timingSend.toFixed(3) : "< 0"}ms</div>`; 
    html += '</h4>';
    html += '</div>';

    html += '<div class="item">';
    html += '<h4 class="ui header inverted green">Time To First Byte';
    html += `<div class="sub header">${(request.timingWait > 0) ? request.timingWait.toFixed(3) : "< 0"}ms</div>`; 
    html += '</h4>';
    html += '</div>';

    html += '<div class="item">';
    html += '<h4 class="ui header inverted green">Content Download';
    html += `<div class="sub header">${(request.timingReceive > 0) ? request.timingReceive.toFixed(3) : "< 0"}ms</div>`; 
    html += '</h4>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  function createHeaderHtml(headerObject) {
    let html = '<div class="ui list">';
    for (let name in headerObject) {
      html += '<div class="item">';
      html += '<div class="content">';
      html += `<h4 class="ui header inverted green">${name}<div class="sub header">${headerObject[name]}</div></h4>`;
      html += '</div>';
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  function resetTables() {
    for (let code in TABLE_CODES) {
      let html = "<tr class='table-no-row'>";
      html += `<td colspan="${TABLE_COLSPAN[code]}">No data available</td>`;
      html += "</tr>";
      let tbody = $(`#${TABLE_CODES[code]}`).children('tbody');
      tbody.empty().html(html);
    }
  }

  return {
    addTableRow: addTableRow,
    checkWhichTable: checkWhichTable,
    createRowHtml: createRowHtml,
    createHiddenRowHtml: createHiddenRowHtml,
    createCfFeatureRowHtml: createCfFeatureRowHtml,
    createTimingHtml: createTimingHtml,
    createHeaderHtml: createHeaderHtml,
    resetTables: resetTables
  }

})(this);
