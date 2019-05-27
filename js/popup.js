// popup checkbox handler
$('.checkbox').on("change", "input", function () {
  let status = `${this.name} checkbox is now `;
  if (this.checked) {
  	status = status.concat("checked");
  } else {
  	status = status.concat("unchecked");
  }

  console.log(status);
});