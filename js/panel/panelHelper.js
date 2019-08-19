// Menu Navigation
$(".menu .item").click(function() {

  if ($(this).hasClass("disabled")) {
    return;
  }

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

      // If the overview tab is activated, redraw graphs to adjust the position
      if (tabContentId == "overview-content") {
        for (let chartName in createdCharts) {
          createdCharts[chartName].invalidateLabels();
        }
      }
    } else {
      $(this).css("display", "none");
    }
  });
});

// Table row slide toggle
// $("table").on("click", "[reqid]", function() {
//   $(this).next('tr').find(".hiddenTableRow").slideToggle();
// });

function sizeWording(bytes) {
  if (bytes <= 0) return "0<span class='bytes-char'>B</span>";
  if ((bytes / (1024 * 1024)) > 1) {
    let newMB = (bytes / (1024 * 1024)).toFixed(1);
    return newMB.toString() + "<span class='bytes-char'>MB</span>";
  } else if ((bytes / (1024)) > 1) {
    let newKB = (bytes / (1024)).toFixed(1);
    return newKB.toString() + "<span class='bytes-char'>KB</span>";
  } else if (bytes / (1024) < 1) {
    return bytes + "<span class='bytes-char'>B</span>";
  }
}

function getAvgArray(array) {
  if (array.length < 1) return 0;
  return (array.reduce((a,b) => a + b) / array.length).toFixed(2);
}

function getAutoMinifySavedByteRate() {
  let sumOriginal = getArraySum(autoMinifyOriginal);
  let sumOptimized = getArraySum(autoMinifyOptimized);
  return (sumOriginal > 0) ? ((sumOriginal-sumOptimized) / sumOriginal * 100).toFixed(1) : 0;
}

function getArraySum(array) {
  return array.reduce(function(acc, val) { return acc + val; }, 0)
}
