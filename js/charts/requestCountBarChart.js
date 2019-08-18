var requestCountBarChart = (function(global) {
  'use strict';

  let chart = am4core.create("request-count-bar-chart", am4charts.XYChart);

  chart.data = [{
      "category": "Total Requests",
      "value": global.totalNumberOfRequests
    }, {
      "category": "Cloudflare Proxied",
      "value": global.totalNumberOfCfRequests
    }, {
      "category": "Cloudflare Cached",
      "value": global.cachedNumberOfCfRequests
    }, {
      "category": "Cloudflare Uncached",
      "value": global.unCachedNumberOfCfRequests
    }, {
      "category": "None Proxied",
      "value": global.externalNumberOfRequests
    }
  ];

  // create category axis
  let categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
  categoryAxis.dataFields.category = "category";
  categoryAxis.renderer.inversed = true;
  categoryAxis.renderer.grid.template.location = 0;
  // categoryAxis.renderer.grid.template.disabled = true;
  // categoryAxis.renderer.cellStartLocation = 0.1;
  // categoryAxis.renderer.cellEndLocation = 0.9;

  // create value axis
  let valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
  valueAxis.renderer.opposite = true;
  valueAxis.renderer.labels.template.disabled = true;
  // valueAxis.renderer.grid.template.disabled = true;
  valueAxis.cursorTooltipEnabled = false;
  valueAxis.min = 0;

  //create columns
  let series = chart.series.push(new am4charts.ColumnSeries());
  series.dataFields.categoryY = "category";
  series.dataFields.valueX = "value";
  series.name = "NUMBER OF REQUESTS";
  series.columns.template.fillOpacity = 0.5;
  series.columns.template.strokeOpacity = 0;
  series.tooltipText = "# of Request: {valueX.value}";
  series.columns.template.adapter.add("fill", function(fill, target) {
    return chart.colors.getIndex(target.dataItem.index);
  });

  // Add label
  var labelBullet = series.bullets.push(new am4charts.LabelBullet());
  labelBullet.label.text = "{valueX.value}";
  labelBullet.locationX = 0.2;
  labelBullet.label.dx = -10; // To hide when it is 0, this makes the label to go to left 10px

  chart.colors.list = [
    am4core.color("#845EC2"),
    am4core.color("#D65DB1"),
    am4core.color("#FF6F91"),
    am4core.color("#FF9671"),
    am4core.color("#FFC75F"),
    am4core.color("#F9F871"),
  ];

  //add chart cursor
  chart.cursor = new am4charts.XYCursor();
  chart.cursor.behavior = "none";

  //add legend
  chart.legend = new am4charts.Legend();
  chart.legend.markers.template.disabled = true;

  global.createdCharts['requestCountBarChart'] = chart;
  global.loadingIndicators.add(chart);


  return {
    chart: chart
  }

})(this);
