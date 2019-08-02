// When Page Refreshed
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type.match('tab-updated') && tabId == message.tabId) {
    resetChartData();
    showLoadingIndicators(); // Show Loading Data when we start listening network requests
  }
});

// Network Request Event Listner
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type.match('web-request-objects') && tabId == message.tabId) { 
    if(pageOnCompleteEventForPanel) drawCharts();
  } 
});

// WebNavigation OnLoad Event Listner
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type.match('page-onload-event') && tabId == message.tabId) {
    hideLoadingIndicators();
    drawCharts();
  }
});

// To avoid duplicated ContentLoadedEvent
var indicatorDisplayStatus = false;
const LOAD_INDICATOR = "img/indicator.gif";

// Create Charts
am4core.useTheme(am4themes_dark);
am4core.useTheme(am4themes_animated);

// ******************************************************************
// Request Count Bar Chart
// 
var requestCountBarChart = am4core.create("request-count-bar-chart", am4charts.XYChart);

requestCountBarChart.data = [{
    "category": "Total Requests",
    "value": totalNumberOfRequests
  }, {
    "category": "CF Proxied",
    "value": totalNumberOfCfRequests
  }, {
    "category": "CF Cached",
    "value": cachedNumberOfCfRequests
  }, {
    "category": "CF Uncached",
    "value": unCachedNumberOfCfRequests
  }, {
    "category": "None CF Proxied",
    "value": externalNumberOfRequests
  }
];

// create category axis
var categoryAxis = requestCountBarChart.yAxes.push(new am4charts.CategoryAxis());
categoryAxis.dataFields.category = "category";
categoryAxis.renderer.inversed = true;
categoryAxis.renderer.grid.template.location = 0;

// create value axis
var valueAxis = requestCountBarChart.xAxes.push(new am4charts.ValueAxis());
valueAxis.renderer.opposite = true;
valueAxis.cursorTooltipEnabled = false;

//create columns
var series = requestCountBarChart.series.push(new am4charts.ColumnSeries());
series.dataFields.categoryY = "category";
series.dataFields.valueX = "value";
series.name = "Number of Requests";
series.columns.template.fillOpacity = 0.8;
series.columns.template.strokeOpacity = 0;
series.tooltipText = "{valueX.value}";
series.columns.template.adapter.add("fill", function(fill, target) {
  return requestCountBarChart.colors.getIndex(target.dataItem.index);
});

//add chart cursor
requestCountBarChart.cursor = new am4charts.XYCursor();
requestCountBarChart.cursor.behavior = "none";

//add legend
requestCountBarChart.legend = new am4charts.Legend();
requestCountBarChart.legend.markers.template.disabled = true;


// ******************************************************************
// Content Type Chart
//
var totalContentTypeChart = am4core.create("content-type-chart", am4charts.PieChart);

// Add data
totalContentTypeChart.data = [{
  "category": "No data",
  "value": 1
}];

// Add and configure Series
var pieSeries = totalContentTypeChart.series.push(new am4charts.PieSeries());
pieSeries.dataFields.value = "value";
pieSeries.dataFields.category = "category";
pieSeries.slices.template.stroke = am4core.color("#fff");
pieSeries.slices.template.strokeWidth = 2;
pieSeries.slices.template.strokeOpacity = 0.5;

// This creates initial animation
pieSeries.hiddenState.properties.opacity = 1;
pieSeries.hiddenState.properties.endAngle = -90;
pieSeries.hiddenState.properties.startAngle = -90;


// ******************************************************************
// Routing Colo Chart
//
var routingColoChart = am4core.create("routing-colo-chart", am4charts.XYChart);
routingColoChart.data = [{"colo": "Routed Datacenters"}];

// Create axes
var categoryAxis = routingColoChart.xAxes.push(new am4charts.CategoryAxis());
categoryAxis.dataFields.category = "colo";
categoryAxis.renderer.grid.template.location = 0;

var valueAxis = routingColoChart.yAxes.push(new am4charts.ValueAxis());
valueAxis.renderer.inside = true;
valueAxis.renderer.labels.template.disabled = true;
valueAxis.min = 0;

// Create series
function createSeries(field, name) {
  
  // Set up series
  var series = routingColoChart.series.push(new am4charts.ColumnSeries());
  series.name = name;
  series.dataFields.valueY = field;
  series.dataFields.categoryX = "colo";
  series.sequencedInterpolation = true;
  
  // Make it stacked
  series.stacked = true;
  
  // Configure columns
  series.columns.template.width = am4core.percent(60);
  series.columns.template.tooltipText = "[bold]{name}[/]\n[font-size:14px]Number of Request: {valueY}";
  
  // Add label
  var labelBullet = series.bullets.push(new am4charts.LabelBullet());
  labelBullet.label.text = "{valueY}";
  labelBullet.locationY = 0.5;
  
  return series;
}

// Legend
routingColoChart.legend = new am4charts.Legend();


// ******************************************************************
// Loading Indicator
//
var indicators = [];

function showLoadingIndicators() {
  if (indicatorDisplayStatus) return;
  indicatorDisplayStatus = true;

  indicators.push(requestCountBarChart.tooltipContainer.createChild(am4core.Container));
  indicators.push(totalContentTypeChart.tooltipContainer.createChild(am4core.Container));
  indicators.push(routingColoChart.tooltipContainer.createChild(am4core.Container));

  for(let i=0; i < indicators.length; i++) {
    indicators[i].background.fill = am4core.color("#212124");
    indicators[i].background.fillOpacity = 0.6;
    indicators[i].width = am4core.percent(100);
    indicators[i].height = am4core.percent(100);

   let indicatorLabel = indicators[i].createChild(am4core.Label);
   indicatorLabel.text = "Loading...";
   indicatorLabel.align = "center";
   indicatorLabel.valign = "middle";
   indicatorLabel.fontSize = 20;
	 indicatorLabel.dy = 50;

   let loader = indicators[i].createChild(am4core.Image);
   loader.href = LOAD_INDICATOR;
   loader.align = "center";
   loader.valign = "middle";
   loader.horizontalCenter = "middle";
   loader.verticalCenter = "middle";
   loader.scale = 0.7;
  }
}

function hideLoadingIndicators() {
  if (!indicatorDisplayStatus) return;
  indicatorDisplayStatus = false;
  for(let i=0; i < indicators.length; i++) { 
    indicators[i].hide();
  }
}

function drawCharts() {
  // requestCountBarChart
  requestCountBarChart.data[0].value = totalNumberOfRequests;
  requestCountBarChart.data[1].value = totalNumberOfCfRequests;
  requestCountBarChart.data[2].value = cachedNumberOfCfRequests;
  requestCountBarChart.data[3].value = unCachedNumberOfCfRequests;
  requestCountBarChart.data[4].value = externalNumberOfRequests;
  requestCountBarChart.invalidateRawData();

  // totalContentTypeChart
  for (var type in contentTypes) {
    var typeExists = false;
    for(var i=0; i < totalContentTypeChart.data.length; i++) {
      if(totalContentTypeChart.data[i].category == type) {
        typeExists = true;
        totalContentTypeChart.data[i].value = contentTypes[type];
      }
    }
    if (!typeExists) {
      totalContentTypeChart.data.push({
        category: type,
        value: contentTypes[type]
      })
    }
  }
  totalContentTypeChart.invalidateData();

  // Routing Colo Chart
  for (var colo in routingColo) {
    if(routingColoChart.data[0][colo] == undefined) {
      createSeries(colo, colo);
    }
    routingColoChart.data[0][colo] = routingColo[colo];
  }
  routingColoChart.invalidateData();
}

function resetChartData() {
  console.log("Tab Refreshed Resetting Chart data");
  totalContentTypeChart.data = [];
  routingColoChart.data = [{"colo": "Routed Datacenters"}];
  routingColoChart.series.clear();
}

