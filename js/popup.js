// popup checkbox handler
$('.checkbox').on("change", "input", function() {
  let status = `${this.name} checkbox is now `;
  if (this.checked) {
  	status = status.concat("checked");
  } else {
  	status = status.concat("unchecked");
  }

  console.log(status);
});


$('.button').on("click", "button", function() {
	console.log("Button Clicked");
	chrome.runtime.sendMessage(
		{
  		type: "string",
  		message: "test",
  		from: "popup.js"
  	}

  // Debugging message from devTools.js
    // {
    //   type: "new-inspected-window-tabid",
    //   message: "12",
    //   from: "devTools.js"
    // }
	);
})