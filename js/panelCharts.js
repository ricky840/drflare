// When Page Refreshed
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type.match('tab-updated') && tabId == message.tabId) {
    resetChartData();
    showLoadingIndicators(); // Show Loading Data when we start listening network requests
    startCounterForEvent();
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
    if (pageOnCompleteEventForPanel) {
      drawCharts();
    } else {
      hideLoadingIndicators();
      drawCharts();
    }
    pageOnCompleteEventForPanel = true;
  }
});

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
var categoryAxisReqCount = requestCountBarChart.yAxes.push(new am4charts.CategoryAxis());
categoryAxisReqCount.dataFields.category = "category";
categoryAxisReqCount.renderer.inversed = true;
categoryAxisReqCount.renderer.grid.template.location = 0;

// create value axis
var valueAxisReqCount = requestCountBarChart.xAxes.push(new am4charts.ValueAxis());
valueAxisReqCount.renderer.opposite = true;
valueAxisReqCount.cursorTooltipEnabled = false;

//create columns
var seriesReqCount = requestCountBarChart.series.push(new am4charts.ColumnSeries());
seriesReqCount.dataFields.categoryY = "category";
seriesReqCount.dataFields.valueX = "value";
seriesReqCount.name = "Number of Requests";
seriesReqCount.columns.template.fillOpacity = 0.5;
seriesReqCount.columns.template.strokeOpacity = 0;
seriesReqCount.tooltipText = "# of Request: {valueX.value}";
seriesReqCount.columns.template.adapter.add("fill", function(fill, target) {
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
pieSeries.slices.template.fillOpacity = 0.5;
pieSeries.labels.template.text = "{category}: {value.value}";

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
  series.columns.template.fillOpacity = 0.5;
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
// Content Type Chart CF Uncached
//
var unCachedContentTypeChart = am4core.create("uncached-content-type-chart", am4charts.PieChart);

// Add data
unCachedContentTypeChart.data = [{
  "category": "No data",
  "value": 1
}];

// Add and configure Series
var pieSeriesUnCached = unCachedContentTypeChart.series.push(new am4charts.PieSeries());
pieSeriesUnCached.dataFields.value = "value";
pieSeriesUnCached.dataFields.category = "category";
pieSeriesUnCached.slices.template.stroke = am4core.color("#fff");
pieSeriesUnCached.slices.template.strokeWidth = 2;
pieSeriesUnCached.slices.template.strokeOpacity = 0.5;
pieSeriesUnCached.slices.template.fillOpacity = 0.5;
pieSeriesUnCached.labels.template.text = "{category}: {value.value}";
pieSeriesUnCached.colors.list = [
  new am4core.color("#845EC2"),
  new am4core.color("#D65DB1"),
  new am4core.color("#FF6F91"),
  new am4core.color("#FF9671"),
  new am4core.color("#FFC75F"),
  new am4core.color("#F9F871")
];

// This creates initial animation
pieSeriesUnCached.hiddenState.properties.opacity = 1;
pieSeriesUnCached.hiddenState.properties.endAngle = -90;
pieSeriesUnCached.hiddenState.properties.startAngle = -90;

// ******************************************************************
// Image Polish Saved Bytes Chart
//

var chart = am4core.create("chartdiv", am4charts.XYChart);
// chart.numberFormatter.numberFormat = "#.0b";

// Add data
chart.data = [{
  "category": "Original",
  "value": 0
}, {
  "category": "Optimized",
  "value": 0
}];

// Populate data
for (let i = 0; i < (chart.data.length - 1); i++) {
  chart.data[i].valueNext = chart.data[i + 1].value;
}

// Create axes
var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
categoryAxis.dataFields.category = "category";
categoryAxis.renderer.grid.template.location = 0;
categoryAxis.renderer.minGridDistance = 30;
// categoryAxis.renderer.grid.template.disabled = true;
// categoryAxis.renderer.minGridDistance = 40;
// categoryAxis.renderer.labels.template.location = 0.25;
// categoryAxis.startLocation = -0.3;
// categoryAxis.endLocation = 0.9;

var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
valueAxis.min = 0;

// Create series
var series = chart.series.push(new am4charts.ColumnSeries());
series.dataFields.valueY = "value";
series.dataFields.categoryX = "category";
// series.columns.template.width = am4core.percent(100);

// Add series for showing variance arrows
var series2 = chart.series.push(new am4charts.ColumnSeries());
series2.dataFields.valueY = "valueNext";
series2.dataFields.openValueY = "value";
series2.dataFields.categoryX = "category";
series2.columns.template.width = 1;
series2.fill = am4core.color("#555");
series2.stroke = am4core.color("#555");

// Add a triangle for arrow tip
var arrow = series2.bullets.push(new am4core.Triangle);
arrow.width = 10;
arrow.height = 10;
arrow.horizontalCenter = "middle";
arrow.verticalCenter = "top";
arrow.dy = -1;

// Set up a rotation adapter which would rotate the triangle if its a negative change
arrow.adapter.add("rotation", function(rotation, target) {
  return getVariancePercent(target.dataItem) < 0 ? 180 : rotation;
});

// Set up a rotation adapter which adjusts Y position
arrow.adapter.add("dy", function(dy, target) {
  return getVariancePercent(target.dataItem) < 0 ? 1 : dy;
});

// Add a label
var label = series2.bullets.push(new am4core.Label);
label.padding(10, 10, 10, 10);
label.text = "";
label.fill = am4core.color("#0c0");
label.strokeWidth = 0;
label.horizontalCenter = "middle";
label.verticalCenter = "top";
label.fontWeight = "bolder";
label.fontSize = "30px";

// Adapter for label text which calculates change in percent
label.adapter.add("textOutput", function(text, target) {
  var percent = getVariancePercent(target.dataItem);
  return percent ? percent + "%" : text;
});

// Adapter which shifts the label if it's below the variance column
label.adapter.add("verticalCenter", function(center, target) {
  return getVariancePercent(target.dataItem) < 0 ? "bottom" : center;
});

// Adapter which changes color of label to red
label.adapter.add("fill", function(fill, target) {
  return getVariancePercent(target.dataItem) < 0 ? am4core.color("#c00") : fill;
});

function getVariancePercent(dataItem) {
  if (dataItem) {
    var value = dataItem.valueY;
    var openValue = dataItem.openValueY;
    var change = value - openValue;
    return Math.round(change / openValue * 100);
  }
  return 0;
}


























// ******************************************************************
// Loading Indicator
//
var indicators = [];

function showLoadingIndicators() {
  indicators.push(requestCountBarChart.tooltipContainer.createChild(am4core.Container));
  indicators.push(totalContentTypeChart.tooltipContainer.createChild(am4core.Container));
  indicators.push(routingColoChart.tooltipContainer.createChild(am4core.Container));
  indicators.push(unCachedContentTypeChart.tooltipContainer.createChild(am4core.Container));

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
  for (let type in contentTypes) {
    let typeExists = false;
    for(let i=0; i < totalContentTypeChart.data.length; i++) {
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

  // unCachedContentTypeChart
  for (let type in unCachedContentTypes) {
    let typeExists = false;
    for(let i=0; i < unCachedContentTypeChart.data.length; i++) {
      if(unCachedContentTypeChart.data[i].category == type) {
        typeExists = true;
        unCachedContentTypeChart.data[i].value = unCachedContentTypes[type];
      }
    }
    if (!typeExists) {
      unCachedContentTypeChart.data.push({
        category: type,
        value: contentTypes[type]
      })
    }
  }
  unCachedContentTypeChart.invalidateData();

  // Routing Colo Chart
  for (var colo in routingColo) {
    if(routingColoChart.data[0][colo] == undefined) {
      createSeries(colo, colo);
    }
    routingColoChart.data[0][colo] = routingColo[colo];
  }
  routingColoChart.invalidateData();

	// Polish...........
	chart.data[0].value = getArraySum(imagePolishOriginal);
  chart.data[1].value = getArraySum(imagePolishOptimized);
  // Populate data
  for (let i = 0; i < (chart.data.length - 1); i++) {
    chart.data[i].valueNext = chart.data[i + 1].value;
  }
  // chart.invalidateRawData();
  chart.invalidateData();


}

function resetChartData() {
  console.log("Tab Refreshed Resetting Chart data");
  totalContentTypeChart.data = [];
  unCachedContentTypeChart.data = [];

  routingColoChart.data = [{"colo": "Routed Datacenters"}];
  routingColoChart.series.clear();
}

function startCounterForEvent() {
  setTimeout(function() { 
    // Fire if the onload event was not arrived for 4 seconds
    if (!pageOnCompleteEventForPanel) {
      hideLoadingIndicators();
      drawCharts();
      pageOnCompleteEventForPanel = true;
    } 
  }, WAIT_FOR_ONLOAD_EVENT);
}
