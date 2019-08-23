var requestTable = (function(global) {
  'use_strict';

  var dataTables = {};
  var tableLoaderIndicator = false;

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

  function initTables(pageLength) {
    dataTables = {
      "cf-cached-table": $('#cf-cached-table').DataTable({
        "columnDefs": [
          // {targets: 0, visible: false}, // Reuqest Id
          {targets: 0, width: "2%"}, // Request Id
          {targets: 1, width: "4%"}, // Http Version
          {targets: 4, width: "5%"}, // Status
          {targets: 5, width: "10%"}, // RayId
          {targets: 7, width: "10%"}, // Cache Control
          {targets: 8, width: "7%"}, // Server IP
          {targets: 10, width: "10%"} // Object Type
        ],
        "bAutoWidth": false,
        "pageLength": pageLength,
        "createdRow": function(row, data, dataIndex) {
          $(row).attr("reqid", data[0]);
        }
      }),
      "cf-cache-miss-table": $('#cf-cache-miss-table').DataTable({
        "columnDefs": [
          // {targets: 0, visible: false}, // Request Id
          {targets: 0, width: "2%"}, // Request Id
          {targets: 1, width: "4%"}, // Http Version
          {targets: 4, width: "5%"}, // Status
          {targets: 5, width: "10%"}, // RayId
          {targets: 7, width: "10%"}, // Cache Control
          {targets: 9, width: "7%"}, // Server IP
          {targets: 11, width: "10%"} // Object Type
        ],
        "bAutoWidth": false,
        "pageLength": pageLength,
        "createdRow": function(row, data, dataIndex) {
          $(row).attr("reqid", data[0]);
        }
      }),
      "external-req-table": $('#external-req-table').DataTable({
        "columnDefs": [
          // {targets: 0, visible: false}, // Request Id
          {targets: 0, width: "2%"}, // Request Id
          {targets: 1, width: "4%"}, // Http Version
          {targets: 4, width: "5%"}, // Status
          {targets: 6, width: "10%"}, // Cache Control
          {targets: 8, width: "7%"}, // Server IP
          {targets: 10, width: "10%"} // object Type
        ],
        "bAutoWidth": false,
        "pageLength": pageLength,
        "createdRow": function(row, data, dataIndex) {
          $(row).attr("reqid", data[0]);
        }
      }),
      "image-polished-table": $('#image-polished-table').DataTable({
        "columnDefs": [
          // {targets: 0, visible: false}, // Request Id
          {targets: 0, width: "2%"}, // Request Id
          {targets: 1, width: "4%"}, // Http Version
          {targets: 4, width: "5%"}, // Status
          {targets: 5, width: "10%"}, // RayId
          {targets: 7, width: "10%"} // Object Type
        ],
        "bAutoWidth": false,
        "pageLength": pageLength,
        "createdRow": function(row, data, dataIndex) {
          $(row).attr("reqid", data[0]);
        }
      }),
      "image-resized-table": $('#image-resized-table').DataTable({
        "columnDefs": [
          // {targets: 0, visible: false}, // Request Id
          {targets: 0, width: "2%"}, // Request Id
          {targets: 1, width: "4%"}, // Http Version
          {targets: 4, width: "5%"}, // Status
          {targets: 5, width: "10%"}, // RayId
          {targets: 9, width: "10%"} // Object Type
        ],
        "bAutoWidth": false,
        "pageLength": pageLength,
        "createdRow": function(row, data, dataIndex) {
          $(row).attr("reqid", data[0]);
        }
      }),
      "railgun-table": $('#railgun-table').DataTable({
        "columnDefs": [
          // {targets: 0, visible: false}, // Request Id
          {targets: 0, width: "2%"}, // Request Id
          {targets: 1, width: "4%"}, // Http Version
          {targets: 4, width: "5%"}, // Status
          {targets: 5, width: "10%"}, // RayId
          {targets: 11, width: "10%"} // Object Type
        ],
        "bAutoWidth": false,
        "pageLength": pageLength,
        "createdRow": function(row, data, dataIndex) {
          $(row).attr("reqid", data[0]);
        }
      }),
      "auto-minify-table": $('#auto-minify-table').DataTable({
        "columnDefs": [
          // {targets: 0, visible: false}, // Request Id
          {targets: 0, width: "2%"}, // Request Id
          {targets: 1, width: "4%"}, // Http Version
          {targets: 4, width: "5%"}, // Status
          {targets: 5, width: "10%"}, // RayId 
          {targets: 9, width: "10%"} // Object Type
        ],
        "bAutoWidth": false,
        "pageLength": pageLength,
        "createdRow": function(row, data, dataIndex) {
          $(row).attr("reqid", data[0]);
        }
      }),
      "summary-table": $('#summary-table').DataTable({
        "columnDefs": [
          // {targets: 0, visible: false}, // Request Id
          {targets: 0, width: "2%"}, // Request Id
          {targets: 1, width: "4%"}, // Http Version
          {targets: 4, width: "5%"}, // Status
          {targets: 5, width: "10%"}, // RayId
          {targets: 6, width: "10%"}, // Object Type
          {targets: [8, 9, 10, 11, 12, 13], orderable: false},
          {targets: [8, 9, 10, 11, 12, 13], searchable: false}
        ],
        "bAutoWidth": false,
        "pageLength": pageLength,
        "createdRow": function(row, data, dataIndex) {
          $(row).attr("reqid", data[0]);
        }
      })
    }
  }

  function showHiddenRow(tableId, tr) {
    let row = dataTables[tableId].row(tr);
    let reqId = $(tr).attr('reqId');
    if (row.child.isShown()) {
      row.child.hide();
      tr.removeClass('shown');
    } else {
      row.child(hiddenRowHtml(reqId)).show();
      tr.addClass('shown');
    }
  }

  function hiddenRowHtml(requestId) {
    let request = allRequestObjects[requestId];
    if (request != undefined) {
      return createHiddenRowHtml(request);
    } else {
      return `Error: Could not find the request information. Id - ${requestId}`;
    }
  }

  function addTableRow(request) {
    var addTableCodes = checkWhichTable(request);
    for(let i=0; i < addTableCodes.length; i++) {
      createAndDrawRow(request, addTableCodes[i]);
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

  function createAndDrawRow(request, tableCode) {
    let positive = '<p class="ui olive empty circular label tiny"></p>';
    let negative = '<p class="ui grey empty circular label tiny"></p>';
    let cacheControlHeader = (request.responseHeaders['cache-control'] != undefined) ? request.responseHeaders['cache-control'] : "";
    let contentEncodingHeader = (request.responseHeaders['content-encoding'] != undefined) ? request.responseHeaders['content-encoding']: "";
    let cacheStatus = (request.rayId != "" && request.cfCacheStatus == "") ? "miss" : request.cfCacheStatus;
    let polishSavedRatio = (request.imagePolished && request.origSize != 0 && request.contentLength != 0) ? ((request.origSize-request.contentLength)/request.origSize*100).toFixed(2) : 0;
    let minifiedSavedRatio = (request.minified && request.origSize != 0 && request.contentLength != 0) ? ((request.origSize-request.contentLength)/request.origSize*100).toFixed(3) : 0;

    if (tableCode == "CFCACHED") {
      dataTables[TABLE_CODES["CFCACHED"]].row.add([
        request.requestId,
        request.httpVersion,
        request.method,
        request.url,
        request.statusCode,
        request.rayId,
        request.timingWait.toFixed() + "ms",
        cacheControlHeader,
        request.serverIPAddress,
        request.contentLength,
        request.objectType,
        cacheStatus,
        request.colo
      ]).draw(false);
    } else if (tableCode == "CFCACHEMISS") {
      dataTables[TABLE_CODES["CFCACHEMISS"]].row.add([
        request.requestId,
				request.httpVersion,
				request.method,
				request.url,
				request.statusCode,
				request.rayId,
				request.timingWait.toFixed() + "ms",
				cacheControlHeader,
				contentEncodingHeader,
				request.serverIPAddress,
				request.contentLength,
				request.objectType,
				cacheStatus,
				request.colo
			]).draw(false);
    } else if (tableCode == "EXTERNAL") {
      dataTables[TABLE_CODES["EXTERNAL"]].row.add([
        request.requestId,
				request.httpVersion,
				request.method,
				request.url,
				request.statusCode,
				request.timingWait.toFixed() + "ms",
				cacheControlHeader,
				contentEncodingHeader,
				request.serverIPAddress,
				request.contentLength,
				request.objectType,
			]).draw(false);
    } else if (tableCode == "IMGPOLISH") {
      dataTables[TABLE_CODES["IMGPOLISH"]].row.add([
        request.requestId,
        request.httpVersion,
        request.method,
        request.url,
        request.statusCode,
        request.rayId,
        request.imagePolishOrigFmt,
        request.objectType,
        request.imagePolishStatus,
        request.imagePolishQuality,
        request.origSize,
        request.contentLength,
        (polishSavedRatio > 0) ? "<p class='ui header inverted tiny green'>" + polishSavedRatio +"%</p>" : "0%",
        cacheStatus,
        request.colo
      ]).draw(false);
    } else if (tableCode == "IMGRESIZE") {
      dataTables[TABLE_CODES["IMGRESIZE"]].row.add([
        request.requestId,
        request.httpVersion,
        request.method,
        request.url,
        request.statusCode,
        request.rayId,
        request.imageResizerInternalStatus,
        request.imageResizerProcessTime,
        request.contentLength,
        request.objectType,
        cacheStatus,
        request.colo,
        request.imageResizerVersion
      ]).draw(false);
    } else if (tableCode == "RAILGUN") {
      dataTables[TABLE_CODES["RAILGUN"]].row.add([
        request.requestId,
				request.httpVersion,
				request.method,
				request.url,
				request.statusCode,
				request.rayId,
				request.timingWait.toFixed() + "ms",
				request.railgunDirectConnected ? "<p class='ui header inverted tiny'>Direct</p>" : "<p class='ui header inverted green tiny'>Listener</p>",
				request.railgunOptimizedComRatio,
				(request.railgunOptimizedFetchLatency * 1000).toFixed(2),
				request.contentLength,
				request.objectType,
				cacheStatus,
				request.colo
	   ]).draw(false);
    } else if (tableCode == "AUTOMINIFY") {
      dataTables[TABLE_CODES["AUTOMINIFY"]].row.add([
        request.requestId,
				request.httpVersion,
				request.method,
				request.url,
				request.statusCode,
				request.rayId,
				request.origSize,
				request.contentLength,
				(minifiedSavedRatio > 0) ? "<p class='ui header inverted tiny green'>" + minifiedSavedRatio + "%</p>" : "0%",
				request.objectType,
				cacheStatus,
				request.colo
			]).draw(false);
    } else if (tableCode == "ALL") {
      dataTables[TABLE_CODES["ALL"]].row.add([
        request.requestId,
				request.httpVersion,
				request.method,
				request.url,
				request.statusCode,
				request.rayId,
				request.objectType,
				request.colo,
				(request.rayId != "") ? positive : negative,
				(request.cfCached && request.rayId != "") ? positive : negative,
				(request.imagePolished) ? positive : negative,
				(request.minified) ? positive : negative,
				(request.railguned) ? positive : negative,
				(request.imageResized) ? positive : negative
			]).draw(false);
    }
  }

  function createHiddenRowHtml(request) {
    let isObjectImage = false;
    let columnWidths = ["three", "five", "five"];

    if (request.objectType.match('image')) {
      columnWidths = ["two", "four", "four"];
      isObjectImage = true;
    }

    let html = "<table class='ui table inverted hiddenTable'>";
    html += "<tr>";
    html += `<td>`;
    html += "<div class='ui grid padded'>";
    html += "<div class='row'>";

    html += `<div class="${columnWidths[0]} wide column">`;
    html += "<h4 class='ui header inverted orange'>Cloudflare Features</h4>";
    html += "<div class='ui inverted divider'></div>";
    html += `<div>${createCfFeatureRowHtml(request)}</div>`;
    html += "<h4 class='ui header inverted orange'>Request Timings</h4>";
    html += "<div class='ui inverted divider'></div>";
    html += `<div>${createTimingHtml(request)}</div>`;
    html += "</div>";

    html += `<div class="${columnWidths[1]} wide column">`;
    html += "<h4 class='ui header inverted orange'>Request Headers</h4>";
    html += "<div class='ui inverted divider'></div>";
    html += `<div>${createHeaderHtml(request.requestHeaders)}</div>`;
    html += "</div>";
    
    html += `<div class="${columnWidths[2]} wide column">`;
    html += "<h4 class='ui header inverted orange'>Response Headers</h4>";
    html += "<div class='ui inverted divider'></div>";
    html += `<div>${createHeaderHtml(request.responseHeaders)}</div>`;
    html += "</div>";

    html += (isObjectImage) ? createImageHtml(request.url) : "";
    
    html += "</div>";
    html += "</div>";
    html += "</td>";
    html += "</tr>";
    html += "</table>";

    return html;
  }
  
  function createImageHtml(url) {
    let html = "";
    html += "<div class='four wide column'>";
    html += "<h4 class='ui header inverted orange'>Image</h4>";
    html += "<div class='ui inverted divider'></div>";
    html += "<div class='image-view-container'>";
    html += `<a href="${url}" target="_blank">`;
    html += `<img class="image-view" src='${url}'>`;
    html += "</a>";
    html += "</div>";
    html += "</div>";
    return html;
  }

  function createCfFeatureRowHtml(request) {
    let html = '<div class="ui middle aligned relaxed list">';

    html += '<div class="item">';
    html += '<div class="content">';
    html += `<div class="ui horizontal label ${(request.rayId != "") ? "green" : "grey"} inverted">Proxied</div>`;
    html += '</div>';
    html += '</div>';

    html += '<div class="item">';
    html += '<div class="content">';
    html += `<div class="ui horizontal label ${(request.cfCached) ? "green" : "grey"} inverted">Cache HIT</div>`;
    html += '</div>';
    html += '</div>';
    
    html += '<div class="item">';
    html += '<div class="content">';
    html += `<div class="ui horizontal label ${(!request.cfCached && request.rayId != "") ? "green" : "grey"} inverted">Cache MISS</div>`;
    html += '</div>';
    html += '</div>';

    html += '<div class="item">';
    html += '<div class="content">';
    html += `<div class="ui horizontal label ${(request.rayId == "") ? "green" : "grey"} inverted">External</div>`;
    html += '</div>';
    html += '</div>';

    html += '<div class="item">';
    html += '<div class="content">';
    html += `<div class="ui horizontal label ${(request.railguned) ? "green" : "grey"} inverted">Railgun</div>`;
    html += '</div>';
    html += '</div>';

    html += '<div class="item">';
    html += '<div class="content">';
    html += `<div class="ui horizontal label ${(request.imagePolished) ? "green" : "grey"} inverted">IMG Polish</div>`;
    html += '</div>';
    html += '</div>';

    html += '<div class="item">';
    html += '<div class="content">';
    html += `<div class="ui horizontal label ${(request.minified) ? "green" : "grey"} inverted">Auto Minify</div>`;
    html += '</div>';
    html += '</div>';

    html += '<div class="item">';
    html += '<div class="content">';
    html += `<div class="ui horizontal label ${(request.imageResized) ? "green" : "grey"} inverted">IMG Resized</div>`;
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
    for (let table in dataTables) {
      dataTables[table].clear().draw();
    }
  }

  function loaderShow() {
    if (!tableLoaderIndicator) {
      $(".table-loader").removeClass("disabled").addClass("active");
      tableLoaderIndicator = true;
    }
  }

  function loaderHide() {
    if (tableLoaderIndicator) {
      $(".table-loader").removeClass("active").addClass("disabled");
      tableLoaderIndicator = false;
    }
  }

  return {
    addTableRow: addTableRow,
    checkWhichTable: checkWhichTable,
    createAndDrawRow: createAndDrawRow,
    createHiddenRowHtml: createHiddenRowHtml,
    createCfFeatureRowHtml: createCfFeatureRowHtml,
    createTimingHtml: createTimingHtml,
    createHeaderHtml: createHeaderHtml,
    resetTables: resetTables,
    initTables: initTables,
    showHiddenRow: showHiddenRow,
    loaderShow: loaderShow,
    loaderHide: loaderHide
  }

})(this);
