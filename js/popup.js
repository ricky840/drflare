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

  // Show Updated Version
  chrome.storage.local.get("extUpdated", function(result) {
    if(result['extUpdated']) {
      $("#notification_area").show();
      $("#notification_message").html("Extension was updated to v" + manifest.version);
    }
    chrome.storage.local.set({'extUpdated': false});
  });

  // Get the previous option settings
  chrome.storage.local.get('options', function(data) {
    let options = data['options'];
    $("#paint-option").prop("checked", options.disablePaintAndPopupOption ? true : false);
    $("#url-filter-option").prop("checked", options.disableURLFilterOption ? true : false);
  });

  $("#paint-option").change(function() {
    let disablePaintAndPopupCheckbox = $(this).prop("checked");
    if (disablePaintAndPopupCheckbox == true || disablePaintAndPopupCheckbox == false) {
      updatePopupOptions('disablePaintAndPopupOption', disablePaintAndPopupCheckbox);
    }
  });

  $("#url-filter-option").change(function() {
    const disableURLFilterCheckbox = $(this).prop("checked");
    if (disableURLFilterCheckbox == true || disableURLFilterCheckbox == false) {
      updatePopupOptions('disableURLFilterOption', disableURLFilterCheckbox);
    }
  });

  function updatePopupOptions(optionType, newOptionValue) {
    chrome.storage.local.get('options',  function(data) {
      let updatedOptions = data['options'];
      updatedOptions[optionType] = newOptionValue;
      chrome.storage.local.set(
        {options: updatedOptions},
        sendUpdatedOptionMessage(`${optionType}-message`, newOptionValue)
      );
    });
  }

  function sendUpdatedOptionMessage(optionType, optionValue) {
    chrome.runtime.sendMessage({
      type: optionType,
      option: optionValue
    });
  }

  // Notification Close
  $('.message .close').on('click', function() {
    $("#notification_area").fadeOut();
  });

  // Collapsible URL(s)
  $('.ui.accordion')
  .accordion()
  ;
});

