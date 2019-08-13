var byteSavedByCachedRatioChart = (function(global) {
  'use strict';

  var chart = am4core.create("byte-saved-ratio-chart", am4charts.GaugeChart);

	chart.innerRadius = am4core.percent(70);

	var axis = chart.xAxes.push(new am4charts.ValueAxis());
	axis.min = 0;
	axis.max = 100;
	axis.strictMinMax = true;
	axis.renderer.radius = am4core.percent(80);
	// axis.renderer.inside = true;
	axis.renderer.line.strokeOpacity = 0;
	axis.renderer.ticks.template.disabled = true;
	axis.renderer.ticks.template.strokeOpacity = 0.5;
	axis.renderer.ticks.template.length = 5;
	axis.renderer.grid.template.disabled = true;
	axis.renderer.labels.template.radius = 40;
	axis.renderer.labels.template.disabled = true;
	// axis.renderer.labels.template.adapter.add("text", function(text) {
	// 	return text + "%";
	// })

	var colorSet = new am4core.ColorSet();

	var axis2 = chart.xAxes.push(new am4charts.ValueAxis());
	axis2.min = 0;
	axis2.max = 100;
	axis2.renderer.innerRadius = 10
	axis2.strictMinMax = true;
	axis2.renderer.labels.template.disabled = true;
	axis2.renderer.ticks.template.disabled = true;
	axis2.renderer.grid.template.disabled = true;

	var range0 = axis2.axisRanges.create();
	range0.value = 0;
	range0.endValue = 100;
	range0.axisFill.fillOpacity = 0.5;
	range0.axisFill.fill = colorSet.getIndex(0);

	var range1 = axis2.axisRanges.create();
	range1.value = 0;
	range1.endValue = 100;
	range1.axisFill.fillOpacity = 0.5;
  // range1.axisFill.fill = am4core.color("#808080");

	var label = chart.radarContainer.createChild(am4core.Label);
	label.isMeasured = false;
	label.fontSize = 25;
	label.x = am4core.percent(50);
	label.y = am4core.percent(100);
	label.horizontalCenter = "middle";
	label.verticalCenter = "bottom";
	label.text = "0%";

  var label2 = chart.chartContainer.createChild(am4core.Label);
  label2.text = "BYTES SAVED BY CACHE";
  label2.align = "center";

  global.createdCharts['byteSavedByCachedRatioChart'] = chart;
  global.loadingIndicators.add(chart);
  
  return {
    chart: chart,
    range0: range0,
    range1: range1,
    label: label,
    axis2: axis2
  }

})(this);
