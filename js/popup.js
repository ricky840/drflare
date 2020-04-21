$(document).ready(function() { 
  const manifest = chrome.runtime.getManifest();
  $("#extVersion").html("v" + manifest.version);

  // Show Notification
  chrome.storage.local.get("freshInstalled", function(result) {
    if(result['freshInstalled']) {
      $(NOTIFICATION_AREA_DOM).show();
      $(NOTIFICATION_MESSAGE_DOM).html("Thanks for installing! Don't forget to refresh the page after changing the option. Enjoy!");
    }
    chrome.storage.local.set({'freshInstalled': false});
  });

  // Show Updated Version
  chrome.storage.local.get("extUpdated", function(result) {
    if(result['extUpdated']) {
      $(NOTIFICATION_AREA_DOM).show();
      $(NOTIFICATION_MESSAGE_DOM).html("Extension was updated to v" + manifest.version);
    }
    chrome.storage.local.set({'extUpdated': false});
  });

  // Get the previous option settings
  chrome.storage.local.get(LOCAL_STORAGE_OPTION_LABEL, function(data) {
    const options = data[LOCAL_STORAGE_OPTION_LABEL];
    $(PAINT_OPTION_CHECKBOX_DOM).prop("checked", options.disablePaintAndPopupOption ? true : false);
    $(URL_FILTER_OPTION_CHECKBOX_DOM).prop("checked", options.disableURLFilterOption ? true : false);
  });

  // Update paint option checkbox
  $(PAINT_OPTION_CHECKBOX_DOM).change(function() {
    const disablePaintAndPopupCheckbox = $(this).prop("checked");
    if (disablePaintAndPopupCheckbox == true || disablePaintAndPopupCheckbox == false) {
      updatePopupOptionsAndSendUpdateMessage(DISABLE_PAINT_AND_POPUP_OPTION, disablePaintAndPopupCheckbox);
    }
  });

  // Update URL filter option checkbox
  $(URL_FILTER_OPTION_CHECKBOX_DOM).change(function() {
    const disableURLFilterCheckbox = $(this).prop("checked");
    if (disableURLFilterCheckbox == true || disableURLFilterCheckbox == false) {
      updatePopupOptionsAndSendUpdateMessage(DISABLE_URL_FILTER_OPTION, disableURLFilterCheckbox);
    }
  });

  /**
   * Update popup option values to the local storage and send update message.
   * 
   * @param {string} optionType   - Option checkbox type
   * @param {bool} newOptionValue - True if the option is disabled
   */
  function updatePopupOptionsAndSendUpdateMessage(optionType, newOptionValue) {
    chrome.storage.local.get(LOCAL_STORAGE_OPTION_LABEL,  function(data) {
      let updatedOptions = data[LOCAL_STORAGE_OPTION_LABEL];
      updatedOptions[optionType] = newOptionValue;
      chrome.storage.local.set(
        {options: updatedOptions},
        sendUpdatedOptionMessage(`${optionType}-message`, newOptionValue)
      );
    });
  }

  /**
   * Send a message to devTools.js regarding the updated a popup option.
   * 
   * @param {string} optionType   - Option checkbox type
   * @param {bool} newOptionValue - True if the option is disabled
   */
  function sendUpdatedOptionMessage(optionType, newOptionValue) {
    chrome.runtime.sendMessage({
      type: optionType,
      option: newOptionValue
    });
  }

  // Notification Close
  $('.message .close').on('click', function() {
    $(NOTIFICATION_AREA_DOM).fadeOut();
  });

  // Collapsible URL(s) for the URL filter option
  $('.ui.accordion')
  .accordion()
  ;
});
