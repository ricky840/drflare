var routingColoChart = (function(global) {
  'use strict';

  var chart = am4core.create("routing-colo-chart", am4charts.XYChart);

  chart.data = [{"colo": "Routed Datacenters"}];

  // Legend
  chart.legend = new am4charts.Legend();

  // Create axes
  var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
  categoryAxis.dataFields.category = "colo";
  categoryAxis.renderer.grid.template.location = 0;

  var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
  valueAxis.renderer.inside = true;
  valueAxis.renderer.labels.template.disabled = true;
  valueAxis.min = 0;

  // Create series
  function createSeries(field, name) {
    
    // Set up series
    var series = chart.series.push(new am4charts.ColumnSeries());
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

  global.createdCharts['routingColoChart'] = chart;
  global.loadingIndicators.add(chart);

  return {
    chart: chart,
    createSeries, createSeries
  }

})(this);

