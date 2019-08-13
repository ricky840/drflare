var resetData = (function(global) {

  function chartData() {
    // Request Count Chart
    for(let i=0; i < requestCountBarChart.chart.data.length; i++) {
      requestCountBarChart.chart.data[i].value = 0;
    }
    requestCountBarChart.chart.invalidateData();

    // Content Types
    totalContentTypeChart.chart.data = [];
    unCachedContentTypeChart.chart.data = [];
    httpVersionChart.chart.data = [];

    // Routing
    routingColoChart.chart.data = [{"colo": "Routed Datacenters"}];
    routingColoChart.chart.series.clear();

    // Polish
    for(let i=0; i < imgPolishByteSaveChart.chart.data.length; i++) {
      if (i == (imgPolishByteSaveChart.chart.data.length - 1)) {
        imgPolishByteSaveChart.chart.data[i].value = 0;
      } else {
        imgPolishByteSaveChart.chart.data[i].value = 0;
        imgPolishByteSaveChart.chart.data[i].valueNext = 0;
      }
    }
    imgPolishByteSaveChart.chart.invalidateData();

    // Gauge Charts
    byteSavedByCachedRatioChart.range0.endValue = 0;
    byteSavedByCachedRatioChart.range1.value = 0;
    byteSavedByCachedRatioChart.label.text = "";
    byteSavedByCachedRatioChart.axis2.invalidateRawData();
    proxiedRequestRatioChart.range0.endvalue = 0;
    proxiedRequestRatioChart.range1.value = 0;
    proxiedRequestRatioChart.label.text = "";
    proxiedRequestRatioChart.axis2.invalidateRawData();
  }


  function statData() {
    totalNumberOfRequests = 0;
    totalNumberOfCfRequests = 0;
    cachedNumberOfCfRequests = 0;
    unCachedNumberOfCfRequests = 0;
    externalNumberOfRequests = 0;

    totalBytes = 0;
    cfProxiedBytes = 0;
    cfProxiedByteCached = 0;
    cfProxiedByteUnCached = 0;
    externalBytes = 0;

    contentTypes = {}; 
    unCachedContentTypes = {}; 
    httpVersions = {};
    routingColo = {};

    waitingCfCached = [];
    waitingCfUncached = [];
    waitingNotProxied = [];

    connectionIds = [];

    autoMinifyNumberOfRequest = 0;
    autoMinifyOriginal = [];
    autoMinifyOptimized = [];

    numberOfPolishedImages = 0;
    numberOfPolishedImagesFormatConverted = 0;
    imagePolishOriginal = [];
    imagePolishOptimized = [];

    numberOfRailgunApplied = 0;
    numberOfRailgunDirectConnect = 0;
    numberOfRailgunListenerConnect = 0;
    railgunOriginTimes = [];
    railgunTimeToFirstByteTimesListener = [];
    railgunTimeToFirstByteTimesDirect = [];

    rocketLoaderApplied = false;
    mirageApplied = false;

    numberOfImageResizerApplied = 0;
    imageResizerProcessingTimes = [];
  }

  function circularLabels() {
    $(".menu div.circular.label[cfstat]").removeClass("green").addClass("disabled"); 
  }

  return {
    chartData: chartData,
    statData: statData,
    circularLabels: circularLabels 
  }

})(this);
