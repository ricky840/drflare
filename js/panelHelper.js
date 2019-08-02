// Menu Navigation
$(".menu .item").click(function() {
  let tab = $(this).attr("tab"); 
  let tabContentId = tab + "-content";

  $(".menu .item").each(function() {
    if ($(this).attr("tab") == tab) {
      $(this).removeClass("active").addClass("active");
    } else {
      $(this).removeClass("active");
    }
  });

  $(".tab-content").each(function() {
    if ($(this).attr("id") == tabContentId) {
      $(this).css("display", "block");
    } else {
      $(this).css("display", "none");
    }
  });
});

function sizeWording(bytes) {
  if ((bytes / (1024 * 1024)) > 2) {
    let newMB = (bytes / (1024 * 1024)).toFixed(2);
    return newMB.toString() + "MB";
  } else if ((bytes / (1024)) > 2) {
    let newKB = (bytes / (1024)).toFixed(2);
    return newKB.toString() + "KB";
  }
}









// $('.button').on("click", "button", function() {
//   let tableId = this.id;
//   switch (tableId) {
//     case 'view_table_button':
//       for (let i = 0; i < TABLE_IDS.length; i++) {
//         showTable(TABLE_IDS[i]);
//       }
//       break;
//
//     case 'hide_table_button':
//       for (let i = 0; i < TABLE_IDS.length; i++) {
//         hideTable(TABLE_IDS[i]);
//       }
//       break;
//
//     case 'cached_table_button':
//       viewOptionHandler('cached_table');
//       break;
//
//     case 'not_cached_table_button':
//       viewOptionHandler('not_cached_table');
//       break;
//
//     case 'external_table_button':
//       viewOptionHandler('external_table');
//       break;
//
//     case 'summary_table_button':
//       viewOptionHandler('summary_table');
//       break;
//   }
//
// })
//
// function viewOptionHandler(tableName) {
//   if (isHidden(tableName)) {
//     showTable(tableName);
//   } else {
//     hideTable(tableName);
//   }
// }
//
// function showTable(tableId) {
//   document.getElementById(tableId).style.display = "";
// }
//
// function hideTable(tableId) {
//   document.getElementById(tableId).style.display = "none";
// }
//
// function isHidden(tableId) {
//   if (document.getElementById(tableId).style.display.match("none")) {
//     return true;
//   }
//
//   return false;
// }
//
// $('.ui.accordion')
//   .accordion()
// ; 
