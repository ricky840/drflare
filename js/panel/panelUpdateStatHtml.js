var updateStatHtml = (function(global) {

  function updateStats() {
    $("[cfstat=overview-total-number-of-request]").html(totalNumberOfRequests);
    $("[cfstat=overview-proxied-number-of-request]").html(totalNumberOfCfRequests);
    $("[cfstat=overview-cfcached-number-of-requests]").html(cachedNumberOfCfRequests);
    $("[cfstat=overview-cfuncached-number-of-requests]").html(unCachedNumberOfCfRequests);
    $("[cfstat=overview-external-number-of-requests]").html(externalNumberOfRequests);

    $("[cfstat=overview-total-bytes]").html(sizeWording(totalBytes));
    $("[cfstat=overview-cf-proxied-bytes]").html(sizeWording(cfProxiedBytes));
    $("[cfstat=overview-external-bytes]").html(sizeWording(externalBytes));
    $("[cfstat=overview-cf-cached-bytes]").html(sizeWording(cfProxiedByteCached));
    $("[cfstat=overview-cf-uncached-bytes]").html(sizeWording(cfProxiedByteUnCached));
    $("[cfstat=overview-number-of-connections]").html(connectionIds.length);

    $("[cfstat=overview-avg-waiting-cf-cached]").html(parseFloat(getAvgArray(waitingCfCached)).toFixed());
    $("[cfstat=overview-avg-waiting-cf-uncached]").html(parseFloat(getAvgArray(waitingCfUncached)).toFixed()); 
    $("[cfstat=overview-avg-waiting-not-proxied]").html(parseFloat(getAvgArray(waitingNotProxied)).toFixed());

    $("[cfstat=overview-num-of-minified]").html(autoMinifyNumberOfRequest);
    $("[cfstat=overview-minify-original-bytes]").html(sizeWording(getArraySum(autoMinifyOriginal)));
    $("[cfstat=overview-minify-total-optimized-bytes]").html(sizeWording(getArraySum(autoMinifyOptimized)));
    $("[cfstat=overview-saved-bytes-minify]").html(sizeWording(getArraySum(autoMinifyOriginal)-getArraySum(autoMinifyOptimized)));
    $("[cfstat=overview-minify-saved-rate]").html(getAutoMinifySavedByteRate());

    $("[cfstat=overview-image-polished]").html(numberOfPolishedImages);
    $("[cfstat=overview-image-polished-original-bytes]").html(sizeWording(getArraySum(imagePolishOriginal)));
    $("[cfstat=overview-image-polished-bytes]").html(sizeWording(getArraySum(imagePolishOptimized)));
    $("[cfstat=overview-image-polished-saved-bytes]").html(sizeWording(getArraySum(imagePolishOriginal)-getArraySum(imagePolishOptimized)));
    $("[cfstat=overview-image-format-converted]").html(numberOfPolishedImagesFormatConverted);

    $("[cfstat=overview-railgun-applied]").html(numberOfRailgunApplied);
    $("[cfstat=overview-railgun-direct]").html(numberOfRailgunDirectConnect);
    $("[cfstat=overview-railgun-listener]").html(numberOfRailgunListenerConnect);
    $("[cfstat=overview-railgun-ttfb-direct-avg]").html(parseFloat(getAvgArray(railgunTimeToFirstByteTimesDirect)).toFixed());
    $("[cfstat=overview-railgun-origin-time-avg]").html(parseFloat(getAvgArray(railgunOriginTimes)).toFixed());
    $("[cfstat=overview-railgun-ttfb-listener-avg]").html(parseFloat(getAvgArray(railgunTimeToFirstByteTimesListener)).toFixed());

    $("[cfstat=overview-rocketloader-status]").html((rocketLoaderApplied) ? "ON" : "OFF");
    $("[cfstat=overview-mirage-status]").html((mirageApplied) ? "ON" : "OFF");

    $("[cfstat=overview-image-resizer-applied]").html(numberOfImageResizerApplied); 
    $("[cfstat=overview-image-resizer-avg-process-time]").html(parseFloat(getAvgArray(imageResizerProcessingTimes)).toFixed(3));
    
    // Label Update
    if (cachedNumberOfCfRequests > 0) $(".circular.label[cfstat=overview-cfcached-number-of-requests]").removeClass('disabled').addClass('green');
    if (unCachedNumberOfCfRequests > 0) $(".circular.label[cfstat=overview-cfuncached-number-of-requests]").removeClass('disabled').addClass('green');
    if (externalNumberOfRequests > 0) $(".circular.label[cfstat=overview-external-number-of-requests]").removeClass('disabled').addClass('green');
    if (numberOfPolishedImages > 0) $(".circular.label[cfstat=overview-image-polished]").removeClass('disabled').addClass('green');
    if (autoMinifyNumberOfRequest > 0) $(".circular.label[cfstat=overview-num-of-minified]").removeClass('disabled').addClass('green');
    if (numberOfRailgunApplied > 0) $(".circular.label[cfstat=overview-railgun-applied]").removeClass('disabled').addClass('green');
    if (numberOfImageResizerApplied > 0) $(".circular.label[cfstat=overview-image-resizer-applied]").removeClass('disabled').addClass('green');
    if (totalNumberOfRequests > 0) $(".circular.label[cfstat=overview-total-number-of-request]").removeClass('disabled').addClass('green');
  }

  function updateCharts() {
    // requestCountBarChart
    requestCountBarChart.chart.data[0].value = totalNumberOfRequests;
    requestCountBarChart.chart.data[1].value = totalNumberOfCfRequests;
    requestCountBarChart.chart.data[2].value = cachedNumberOfCfRequests;
    requestCountBarChart.chart.data[3].value = unCachedNumberOfCfRequests;
    requestCountBarChart.chart.data[4].value = externalNumberOfRequests;
    requestCountBarChart.chart.invalidateRawData();

    // totalContentTypeChart
    for (let type in contentTypes) {
      let typeExists = false;
      for(let i=0; i < totalContentTypeChart.chart.data.length; i++) {
        if(totalContentTypeChart.chart.data[i].category == type) {
          typeExists = true;
          totalContentTypeChart.chart.data[i].value = contentTypes[type];
        }
      }
      if (!typeExists) {
        totalContentTypeChart.chart.data.push({
          category: type,
          value: contentTypes[type]
        })
      }
    }
    totalContentTypeChart.chart.invalidateData();

    // unCachedContentTypeChart
    for (let type in unCachedContentTypes) {
      let typeExists = false;
      for(let i=0; i < unCachedContentTypeChart.chart.data.length; i++) {
        if(unCachedContentTypeChart.chart.data[i].category == type) {
          typeExists = true;
          unCachedContentTypeChart.chart.data[i].value = unCachedContentTypes[type];
        }
      }
      if (!typeExists) {
        unCachedContentTypeChart.chart.data.push({
          category: type,
          value: contentTypes[type]
        })
      }
    }
    unCachedContentTypeChart.chart.invalidateData();

    // Http Version
    for (let version in httpVersions) {
      let versionExists = false;
      for (let i=0; i < httpVersionChart.chart.data.length; i++) {
        if (httpVersionChart.chart.data[i].category == version) {
          versionExists = true;
          httpVersionChart.chart.data[i].value = httpVersions[version];
        }
      }
      if (!versionExists) {
        httpVersionChart.chart.data.push({
          category: version,
          value: httpVersions[version]
        });
      }
    }
    httpVersionChart.chart.invalidateData();

    // Routing Colo Chart
    for (var colo in routingColo) {
      if(routingColoChart.chart.data[0][colo] == undefined) {
        routingColoChart.createSeries(colo, colo);
      }
      routingColoChart.chart.data[0][colo] = routingColo[colo];
    }
    routingColoChart.chart.invalidateData();

    // Polish Chart
    imgPolishByteSaveChart.chart.data[0].value = getArraySum(imagePolishOriginal);
    imgPolishByteSaveChart.chart.data[1].value = getArraySum(imagePolishOptimized);
    // Populate data
    for (let i = 0; i < (imgPolishByteSaveChart.chart.data.length - 1); i++) {
      imgPolishByteSaveChart.chart.data[i].valueNext = (imgPolishByteSaveChart.chart.data[i + 1].value);
    }
    imgPolishByteSaveChart.chart.invalidateData();

    // cf Proxied Byte Cached Ratio
    byteSavedByCachedRatioChart.range0.endValue = cfProxiedByteCachedRatio;
    byteSavedByCachedRatioChart.range1.value = cfProxiedByteCachedRatio;
    byteSavedByCachedRatioChart.label.text = cfProxiedByteCachedRatio + "%";
    byteSavedByCachedRatioChart.axis2.invalidateRawData();

    // Proxied Request Ratio
    proxiedRequestRatioChart.range0.endvalue = cfProxiedRequestRatio;
    proxiedRequestRatioChart.range1.value = cfProxiedRequestRatio;
    proxiedRequestRatioChart.label.text = cfProxiedRequestRatio + "%";
    proxiedRequestRatioChart.axis2.invalidateRawData(); 
  }

  return {
    updateStats: updateStats,
    updateCharts: updateCharts
  }

})(this);
