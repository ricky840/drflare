var loadingIndicators = (function(global) {

  var containers = [];

  function add(chart) {
    var container = chart.tooltipContainer.createChild(am4core.Container);

    container.background.fill = am4core.color("#212124");
    container.background.fillOpacity = 0.6;
    container.width = am4core.percent(100);
    container.height = am4core.percent(100);

    let label = container.createChild(am4core.Label);
    label.text = "Loading...";
    label.align = "center";
    label.valign = "middle";
    label.fontSize = 20;
    label.dy = 50;

    let loader = container.createChild(am4core.Image);
    loader.href = LOAD_INDICATOR;
    loader.align = "center";
    loader.valign = "middle";
    loader.horizontalCenter = "middle";
    loader.verticalCenter = "middle";
    loader.scale = 0.7;
  
    containers.push(container);
    container.hide(0);
  }

  function show() {
    for(let i=0; i < containers.length; i++) { 
      containers[i].show();
    }
  }

  function hide() {
    for(let i=0; i < containers.length; i++) { 
      containers[i].hide();
    }
  }

  return {
    add: add,
    show: show,
    hide: hide
  }

})(this);
