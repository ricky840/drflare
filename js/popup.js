$(document).ready(function() { 
  var manifest = chrome.runtime.getManifest();
  $("#extVersion").html("v" + manifest.version);

  // Show Notification
  chrome.storage.local.get("freshInstalled", function(result) {
    if(result['freshInstalled']) {
      $("#notification_area").show();
      $("#notification_message").html("Thanks for installing! Don't forget to refresh the page after changing the option. Enjoy!");
    }
    chrome.storage.local.set({'freshInstalled': false});
  });

  chrome.storage.local.get("extUpdated", function(result) {
    if(result['extUpdated']) {
      $("#notification_area").show();
      $("#notification_message").html("Extension was updated to v" + manifest.version);
    }
    chrome.storage.local.set({'extUpdated': false});
  });

  // Disable Painting Option
  chrome.storage.local.get('options', function(data) {
    let options = data['options'];
    $("#paint-option").prop("checked", options.disablePaintAndPopup);
  });

  $("#paint-option").change(function() {
    let disableOption = $(this).prop("checked");
    if (disableOption == true || disableOption == false) {
      let options = { disablePaintAndPopup: disableOption };
      chrome.storage.local.set({options: options}, function() {
        chrome.runtime.sendMessage({
          type: 'popupOption-disablePainting', 
          option: disableOption
        });
      }); 
    }
  });

  // Notification Close
  $('.message .close').on('click', function() {
    $("#notification_area").fadeOut();
  });
});

