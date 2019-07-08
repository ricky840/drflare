$('.button').on("click", "button", function() {
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