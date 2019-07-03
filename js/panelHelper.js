function calculateCacheHitRatio(request) {
  if (request.cfCached) {
    cachedNumberOfRequests += 1;
  }
  
  document.getElementById("cache").innerHTML = `${cachedNumberOfRequests} / ${totalNumberOfRequests}`;
}

function calculateOffload(request) {
  if (request.cfCached) {
    cachedBytes = parseFloat(cachedBytes) + parseFloat(request.contentLength);
  }

  let percent =  (parseFloat(cachedBytes) / parseFloat(totalBytes) * 100).toFixed(2);
  let wording = `${percent}% - ${cachedBytes} / ${totalBytes} Bytes`;
  if ((totalBytes / (1024 * 1024)) > 2) {
    wording = `${percent}% - ${parseFloat(cachedBytes / (1024 * 1024)).toFixed(2)} / ${parseFloat(totalBytes / (1024 * 1024)).toFixed(2)} MB`;
  } else if ((totalBytes / (1024)) > 2) {
    wording = `${percent}% - ${parseFloat(cachedBytes / (1024)).toFixed(2)} / ${parseFloat(totalBytes / (1024)).toFixed(2)} KB`;
  }
  document.getElementById("offload").innerHTML = wording;
}

function externalContentRatio(request) {
  if (!request.rayId) {
    externalNumberOfRequests += 1;
  }
  document.getElementById("external").innerHTML = `${externalNumberOfRequests} / ${totalNumberOfRequests}`;
}


// $("#summary_table_button").click(function() {
//   console.log("Button Clicked"); 
//   alert(this.id);
// });

$('.button').on("click", "button", function() {
  // console.log(this.id);
  // console.log("Button Clicked");
  let tableId = this.id;
  switch (tableId) {
    case 'view_table_button':
      for (let i = 0; i < TABLE_IDS.length; i++) {
        showTable(TABLE_IDS[i]);
      }
      break;

    case 'hide_table_button':
      for (let i = 0; i < TABLE_IDS.length; i++) {
        hideTable(TABLE_IDS[i]);
      }
      break;

    case 'cached_table_button':
      viewOptionHandler('cached_table');
      break;

    case 'not_cached_table_button':
      viewOptionHandler('not_cached_table');
      break;

    case 'external_table_button':
      viewOptionHandler('external_table');
      break;

    case 'summary_table_button':
      viewOptionHandler('summary_table');
      break;
  }

})

function viewOptionHandler(tableName) {
  if (isHidden(tableName)) {
    showTable(tableName);
  } else {
    hideTable(tableName);
  }
}

function showTable(tableId) {
  document.getElementById(tableId).style.display = "";
}

function hideTable(tableId) {
  document.getElementById(tableId).style.display = "none";
}

function isHidden(tableId) {
  if (document.getElementById(tableId).style.display.match("none")) {
    return true;
  }

  return false;
}

$('.ui.accordion')
  .accordion()
;