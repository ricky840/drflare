const TABLE_ELEMENTS = ["requestId", "rayId", "url", "cfCached", "railguned", "polished"];
let tabId = chrome.devtools.inspectedWindow.tabId;

window.addEventListener('DOMContentLoaded', (event) => {
  console.log('DOM fully loaded and parsed');
  chrome.runtime.sendMessage({
    type: 'panel-ready',
    message: 'Panel-Ready', 
    tabId: tabId,
    from: 'debugBackground.js'
  });
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  console.log(`${tabId} and ${message.tabId}`)
  if (message.type.match('web-request-objects') && tabId == message.tabId) { 
    let request = message.message;
    // console.log("DebugBackground Request Object Delivered: " + request);
    addRow({request});

  } else if (message.type.match('web-requests-array') && tabId == message.tabId) {
    let requests = message.message;

    // console.log("DebugBackground REQUESTS Array Object Delivered: " + requests);
    // console.log(requests);
    addRow(requests);
  }
});



function addRow(requests) {
  // console.log('row added');
  var table = document.getElementById("status_table");

  for (let tabId in requests) {
    let row = table.insertRow(table.rows.length - 1);

    for (let j = 0; j < TABLE_ELEMENTS.length; j++) {
      let column = row.insertCell(j);
      column.innerHTML = `${requests[tabId][TABLE_ELEMENTS[j]]}`;
    }
  }
}

function resetTable() {

}