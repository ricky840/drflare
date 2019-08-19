var updateStatVariable = (function(global) {

  function update(request, callback) {

    // Number of requests
    totalNumberOfRequests += 1;
    (request.rayId !== "") ? totalNumberOfCfRequests += 1 : externalNumberOfRequests += 1;
    if (request.cfCached) cachedNumberOfCfRequests += 1;
    if (!request.cfCached && request.rayId !== "") unCachedNumberOfCfRequests += 1;
    cfProxiedRequestRatio = ((totalNumberOfCfRequests/totalNumberOfRequests) * 100).toFixed();
    cfCachedRequestRatio = (totalNumberOfCfRequests !== 0) ? ((cachedNumberOfCfRequests/totalNumberOfCfRequests) * 100).toFixed() : 0;
    // cfUnCachedRequestRatio = (totalNumberOfCfRequests !== 0) ? ((unCachedNumberOfCfRequests/totalNumberOfCfRequests) * 100).toFixed() : 0;
    // externalRequestRatio = ((externalNumberOfRequests/totalNumberOfRequests) * 100).toFixed();

    // Size of requests
    totalBytes = totalBytes + request.contentLength;
    if (request.cfCached) cfProxiedByteCached = cfProxiedByteCached + request.contentLength;
    if (!request.cfCached && request.rayId !== "") cfProxiedByteUnCached = cfProxiedByteUnCached + request.contentLength;
    cfProxiedByteCachedRatio = ((cfProxiedByteCached/totalBytes) * 100).toFixed();
    if (request.rayId !== "") cfProxiedBytes = cfProxiedBytes + request.contentLength; 
    if (request.rayId == "") externalBytes = externalBytes + request.contentLength;

    // Content Type Count
    (contentTypes[request.objectType] == undefined) ? contentTypes[request.objectType] = 1 : contentTypes[request.objectType] = contentTypes[request.objectType] + 1;

    // Content Type Count Uncached
    if (!request.cfCached && request.rayId !== "") {
      (unCachedContentTypes[request.objectType] == undefined) ? unCachedContentTypes[request.objectType] = 1 : unCachedContentTypes[request.objectType] = unCachedContentTypes[request.objectType] + 1;
    }

    // HTTP Version
    httpVersions[request.httpVersion] == undefined ? httpVersions[request.httpVersion] = 1 : httpVersions[request.httpVersion] = httpVersions[request.httpVersion] + 1;

    // Routing Count
    if (request.colo) {
      (routingColo[request.colo] == undefined) ? routingColo[request.colo] = 1 : routingColo[request.colo] = routingColo[request.colo] + 1;
    }

    // TTFB
    if (request.cfCached) waitingCfCached.push(request.timingWait);
    if (!request.cfCached && request.rayId !== "") waitingCfUncached.push(request.timingWait);
    if (request.rayId == "") waitingNotProxied.push(request.timingWait);

    // Number of Connection
    if (connectionIds.indexOf(request.connectionId) == -1) connectionIds.push(request.connectionId);
    
    // Auto Minify
    if (request.minified) {
      autoMinifyNumberOfRequest += 1;
      if (request.polished) {
        autoMinifyOriginal.push(request.origSize);
        autoMinifyOptimized.push(request.contentLength);
      }
    }

    // Image Polish
    if (request.imagePolished) {
      numberOfPolishedImages += 1;
      if (!request.imagePolishOrigFmt == "") numberOfPolishedImagesFormatConverted += 1;
      if (request.origSize > 0) {
        imagePolishOriginal.push(request.origSize);
        imagePolishOptimized.push(request.contentLength);
      }
    }

    // Railgun
    if (request.railguned) {
      numberOfRailgunApplied += 1;
      if (request.railgunDirectConnected) {
        numberOfRailgunDirectConnect += 1; 
        railgunTimeToFirstByteTimesDirect.push(request.timingWait);
      }
      if (request.railgunOptimized) {
        numberOfRailgunListenerConnect += 1;
        railgunOriginTimes.push(request.railgunOptimizedFetchLatency * 1000);
        railgunTimeToFirstByteTimesListener.push(request.timingWait);
      }
    }

    // Rocket Loader
    if (request.url.match(ROCKET_LOADER_FILE)) {
      rocketLoaderApplied = true; 
    }

    // Mirage
    if (request.url.match(MIRAGE_FILE)) {
      mirageApplied = true; 
    }

    // Image Resizer
    if (request.imageResized) {
      numberOfImageResizerApplied += 1;
      imageResizerProcessingTimes.push(request.imageResizerProcessTime);
    }

	 if(typeof callback !== 'undefined') {
     callback();
   }

  }
  
  return {
    update: update
  }

})(this);
