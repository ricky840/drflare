var httpVersionChart = (function(global) {
  'use strict';

  let chart = am4core.create("http-version-chart", am4charts.PieChart);

  // Add data
  chart.data = [{
    "category": "No data",
    "value": 1
  }];


  // Add and configure Series
  let pieSeries = chart.series.push(new am4charts.PieSeries());
  pieSeries.dataFields.value = "value";
  pieSeries.dataFields.category = "category";
  pieSeries.slices.template.stroke = am4core.color("#fff");
  pieSeries.slices.template.strokeWidth = 2;
  pieSeries.slices.template.strokeOpacity = 0.5;
  pieSeries.slices.template.fillOpacity = 0.5; 
  pieSeries.labels.template.text = "{category}: {value.value}";

  pieSeries.colors.list = [
    am4core.color("#FF9671"),
    am4core.color("#FFC75F"),
    am4core.color("#F9F871"),
    am4core.color("#845EC2"),
    am4core.color("#D65DB1"),
    am4core.color("#FF6F91"),
  ];

  // This creates initial animation
  pieSeries.hiddenState.properties.opacity = 1;
  pieSeries.hiddenState.properties.endAngle = -90;
  pieSeries.hiddenState.properties.startAngle = -90;

  global.createdCharts['httpVersionChart'] = chart;
  global.loadingIndicators.add(chart);

  return {
    chart: chart
  }

})(this);
