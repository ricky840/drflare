var imgPolishByteSaveChart = (function(global) {
  'use strict';

  var chart = am4core.create("image-polish-byte-saving-chart", am4charts.XYChart);

  // Add data
  chart.data = [{
    "category": "Original",
    "value": 0
  }, {
    "category": "Optimized",
    "value": 0
  }];

  // Populate data (for arrow)
  for (let i=0; i < (chart.data.length - 1); i++) {
    chart.data[i].valueNext = chart.data[i + 1].value;
  }

  // Create axes
  var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
  categoryAxis.dataFields.category = "category";
  categoryAxis.renderer.grid.template.disabled = true;
  categoryAxis.renderer.minGridDistance = 20;
  categoryAxis.renderer.labels.template.location = 0.25;
  categoryAxis.startLocation = -0.3;
  categoryAxis.endLocation = 0.9;

  var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
  valueAxis.min = 0;
  valueAxis.numberFormatter = new am4core.NumberFormatter();
  valueAxis.numberFormatter.numberFormat = "#.0b";

  // Create series
  var series = chart.series.push(new am4charts.ColumnSeries());
  series.dataFields.valueY = "value";
  series.dataFields.categoryX = "category";
  series.columns.template.width = am4core.percent(100);
  series.columns.template.fillOpacity = 0.5;
  series.columns.template.tooltipText = "[font-size:14px]{valueY} Bytes";
  series.columns.template.adapter.add("fill", function(fill, target) {
    return chart.colors.getIndex(target.dataItem.index);
  });

  // Add series label
  var labelBullet = series.bullets.push(new am4charts.LabelBullet());
  labelBullet.label.text = "{valueY}";
  labelBullet.locationY = 0.4;
  labelBullet.label.dy = 10; // To hide when it is 0, this makes the label to bottom 10px

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
  label.fill = am4core.color("#c00");
  label.strokeWidth = 0;
  label.horizontalCenter = "middle";
  label.verticalCenter = "bottom";
  label.fontWeight = "bolder";
  label.fontSize = "20px";

  // Adapter for label text which calculates change in percent
  label.adapter.add("textOutput", function(text, target) {
    var percent = getVariancePercent(target.dataItem);
    return percent ? percent + "%" : text;
  });

  // Adapter which shifts the label if it's below the variance column
  label.adapter.add("verticalCenter", function(center, target) {
    return getVariancePercent(target.dataItem) < 0 ? "top" : center;
  });

  // Adapter which changes color of label to red
  label.adapter.add("fill", function(fill, target) {
    return getVariancePercent(target.dataItem) < 0 ? am4core.color("#0c0") : fill;
  });

  var title = chart.titles.create();
  title.text = "BYTES SAVED BY IMAGE POLISH";
  title.marginBottom = 15;

  function getVariancePercent(dataItem) {
    if (dataItem) {
      var value = dataItem.valueY;
      var openValue = dataItem.openValueY;
      var change = value - openValue;
      return Math.round(change / openValue * 100);
    }
    return 0;
  }

  global.createdCharts['imgPolishByteSaveChart'] = chart;
  global.loadingIndicators.add(chart);

  return {
    chart: chart
  }

})(this);
