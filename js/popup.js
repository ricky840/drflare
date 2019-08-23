$(document).ready(function() { 
  var manifest = chrome.runtime.getManifest();
  $("#extVersion").html("v" + manifest.version);

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
});
