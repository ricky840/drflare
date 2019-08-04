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
  if (bytes <= 0) return "0<span class='bytes-char'>B</span>";
  if ((bytes / (1024 * 1024)) > 1) {
    let newMB = (bytes / (1024 * 1024)).toFixed(2);
    return newMB.toString() + "<span class='bytes-char'>MB</span>";
  } else if ((bytes / (1024)) > 1) {
    let newKB = (bytes / (1024)).toFixed(2);
    return newKB.toString() + "<span class='bytes-char'>KB</span>";
  } else if (bytes / (1024) < 1) {
    return bytes + "<span class='bytes-char'>B</span>";
  }
}

function getAvgArray(array) {
  if (array.length < 1) return 0;
  return (array.reduce((a,b) => a + b) / array.length).toFixed(2);
}

function getAutoMinifyRate() {
  let sumOriginal = getArraySum(autoMinifyOriginal);
  let sumOptimized = getArraySum(autoMinifyOptimized);
  return (sumOriginal > 0) ? (100 - ((sumOptimized/sumOriginal) * 100)).toFixed(1) : 0;
}

function getArraySum(array) {
  return array.reduce(function(acc, val) { return acc + val; }, 0)
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
