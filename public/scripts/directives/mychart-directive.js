// mychart-directive.js | requires AngularJs, D3, UnderscoreJS, d3-tip.js | created by Rajat Sharma
// created July 31, 2015 | last updated August 03, 2015

(function () {

    "use strict";

    /* mychart MODULE*/
    var myChartModule = angular.module('mychart', []);

    /* mychart DIRECTIVE */
    myChartModule.directive('mychart', [
      '$window', '$timeout', '$interval', function ($window, $timeout, $interval) {

          function link(scope, elem, attrs, ctrl) {

              var myChart = MyChart({
                  elem: elem,
                  data: scope.data,
                  options: scope.options
              });

              myChart();

              scope.$watch(function () {
                  return {
                      width: elem.parent().width(),
                      height: elem.parent().height()
                  };
              },
               myChart.redraw, //listener
               true //deep watch
               );

              // to refresh chart, when data/options are refreshed.
              scope.$watch('data',
                  function (newValue, oldValue) {
                      myChart.dataChange(newValue, scope.options)
                  });
              scope.$watch('options',
                function (newValue, oldValue) {
                    myChart.dataChange(scope.data, newValue);
                });

              scope.$on('menuExpanedCollapse', function (event, isMenuOpen) {
                  // timeout is set to 500 so as to wait for the nav-bar collapse/expand animation to end.
                  $timeout(myChart.redraw, 500);
              });

          };
          return {
              replace: true,
              restrict: 'E',
              scope: {
                  data: '=',
                  options: '='
              },
              template: '<div></div>',
              link: link
          };
      }
    ]);

    /* MyChart Component */
    var MyChart = function (args) {

        args = args || {};
        var data = args.data;
        var tempData;
        var varNames; // this is an array of the variable names of variables in the bar-chart only! (doesnt include candlestick variables)
        var options = args.options;
        var elem = args.elem;
        var containerWidth = getPixelCssProp(elem[0].parentElement, 'width') || 900;
        var containerHeight = getPixelCssProp(elem[0].parentElement, 'height') || 500;
        var margin = {
            top: 20,
            right: 40,
            bottom: 30,
            left: 40
        };
        var width = containerWidth - margin.left - margin.right;
        var height = containerHeight - margin.top - margin.bottom;

        var xScale0 = d3.scale.ordinal();
        var xScale1 = d3.scale.ordinal();
        var yScale0 = d3.scale.linear();
        var yScale1 = d3.scale.linear();

        var colorScale = d3.scale.ordinal();

        var xAxis = d3.svg.axis()
                        .scale(xScale0)
                        .orient("bottom");

        var yAxis0 = d3.svg.axis()
                        .scale(yScale0)
                        .orient("left");

        var yAxis1 = d3.svg.axis()
                    .scale(yScale1)
                    .orient("right");


        var svg = d3.select(elem[0]).append("svg");

        var container = svg.append("g")
                            .attr("class", "container");

        var plottingArea = container
                                .append('rect')
                                .classed('plotting-area', true);

        var xAxisElm = container.append("g")
                            .attr("class", "x axis")

        var yAxisElm0 = container.append("g")
                            .attr("class", "y0 axis");

        var yAxisElm1 = container.append("g")
                            .attr("class", "y1 axis");


        /* INITIALIZE TOOLTIPS (1 tooltip for bargraph type, 1 for candelstick )  // using d3-tip. */

        var bartip = d3.tip().offset([-10, 0]).attr('class', 'd3-tip').html(function (d, i) {
            return d.value;
        });

        container.call(bartip); /* Invoke the tip in the context of your visualization */

        var candlesticktip = d3.tip().offset([-10, 0]).attr('class', 'd3-tip').html(function (d) {

            var str = "<div style='margin-bottom:4px'> High: " + d.high + "</div>"
					 +"<div style='margin-bottom:4px'> Low: " + d.low + "</div>"
					 +"<div style='margin-bottom:4px'> Open: " + d.open + "</div>"
					 +"<div style='margin-bottom:4px'> Close: " + d.close + "</div>"
            return str;
        });

        container.call(candlesticktip); /* Invoke the tip in the context of your visualization */

        /* CREATING TWO TYPES OF SERIES. ( GroupedBarGraph AND Candlestick )   */
        var series1 = groupedBarGraph({
            tooltip: bartip
        });

        var series2 = ohlc({
            tooltip: candlesticktip
        })

        function chart() { // this function is working like an init function.

            container.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            chart.dataChange(data, options);

            return chart;
        }

        function getVarDetailsFromOptions(options, varName) {

            var varDetails = options.series.filter(function (item) {
                return item.y == varName
            })[0];

            return varDetails;
        }

        chart.dataChange = function (argData, argOptions) {

            if (argData == null) {
                return;
            }

            data = argData;
            options = argOptions;

            varNames = options.series.filter(function (d) {
                return d.type == 'column'; // filtering out only the bargraph variables.
            })
                .map(function (d) {
                    return d.y; //d.y contains the variable name.
                });

            tempData = data.map(function (d) {
                var barVariables = [],
                    candlestickVariables = [];
                var temp = _.omit(d, 'x');

                //temp['y_VAR_BATTERY_SOC_65535'] = {    //"'y_VAR_BATTERY_VOLTS_65535'"
                //    open: 50,
                //    close: 60,
                //    high: 63,
                //    low: 47
                //}; // we wont need this condition once we get proper values from server.

                for (var propName in temp) {

                    if (_.has(temp, propName)) {

                        var varDetails = getVarDetailsFromOptions(options, propName); //TODO: not used, but usefull function, might be used later?

                        if (!_.isObject(temp[propName])) {
                            barVariables.push({
                                name: propName,
                                value: temp[propName]
                            });
                        }
                        else {
                            candlestickVariables.push({
                                name: propName,
                                value: temp[propName]
                            });

                        }

                    }
                }

                return {
                    x: d.x,
                    variables: {
                        barType: barVariables,
                        candleStickType: candlestickVariables
                    }
                }
            });

            // setting xScale0, xScale1, yScale0 scale domains.
            xScale0.domain(data.map(function (d) { return d.x; }));
            xScale1.domain(varNames);
            colorScale.domain(varNames);

            var maxY0Value = d3.max(tempData, function (d) {
                return d3.max(d.variables.barType, function (variable) {
                    return +variable.value; // "+" helps converting string to numeric values.
                });
            }) || 0; // "||0" is done, so as to deal with variables having null values.

            var maxY1Value = d3.max(tempData, function (d) {
                return d3.max(d.variables.candleStickType, function (variable) {
                    return +variable.value.high; // "+" helps converting string to numeric values.
                });
            }) || 0; // "||0" is done, so as to deal with variables having null values.

            yScale0.domain([0, maxY0Value]).nice(); // nice() : Extends the domain so that it starts and ends on nice round values.
            yScale1.domain([0, maxY1Value]).nice();

            /* Logic to decide the total number of ticks on the x-axis */
            if (data.length == 31) { // MONTH
                xAxis.tickValues(d3.range(0, 31, 5));
            }
            else if (data.length == 72) { // 3 days of
                xAxis.tickValues(d3.range(12, 72, 24));
            }
            else if (data.length == 24) { // 1 day
                xAxis.tickValues(d3.range(0, 24, 1));
            }
            else if (data.length == 7) { // week
                xAxis.tickValues(d3.range(0, 7, 1));
            }
            else if (data.length == 12) { //year
                xAxis.tickValues(d3.range(0, 12, 1));
            }
            else if (data.length == 5) { // 5 years of 
                xAxis.tickValues(d3.range(0, 5, 1));
            }

            xAxis.tickFormat(options.axes.x.labelFunction);

            // setting bar graph colors.
            colorScale.range(options.series.filter(function (d, i) {
                return d.type != 'line';
            }).map(function (item) {
                return item.color;
            }));

            chart.redraw();
        }

        chart.width = function (value) {

            if (!arguments.length) {
                return width;
            }

            width = value - margin.left - margin.right;
            svg = svg.attr("width", width + margin.left + margin.right);
            yAxisElm1.attr("transform", "translate(" + width + ",0)");

            plottingArea.attr('width', width);
            plottingArea.attr('x', 0);

            return chart;
        };

        chart.height = function (value) {

            if (!arguments.length) {
                return height;
            }

            height = value - margin.top - margin.bottom;
            svg.attr("height", height + margin.top + margin.bottom);
            xAxisElm.attr("transform", "translate(0," + height + ")");

            plottingArea.attr('height', height);
            plottingArea.attr('y', 0);

            return chart;
        };

        chart.redraw = function () {
            recalculateDimensions.call(this);
        }

        chart.update = function () {
            updateScales();
            updateAxes();
            updateSeries();
        }

        function recalculateDimensions() {
            containerWidth = getPixelCssProp(elem[0].parentElement, 'width') || 900;
            containerHeight = getPixelCssProp(elem[0].parentElement, 'height') || 500;
            chart.width(containerWidth);
            chart.height(containerHeight);
            chart.update();
        }

        function updateScales() {
            xScale0.rangeRoundBands([0, width], 0.1, 0); // Use this := xScale0.rangeRoundBands([0, width], 0.1) If you need spaces betweeen each grp.
            xScale1.rangeRoundBands([0, xScale0.rangeBand()]);
            yScale0.range([height, 0]);
            yScale1.range([height, 0]);
        }

        function updateAxes() {
            xAxisElm.transition().call(xAxis);
            yAxisElm0.transition().call(yAxis0);
            yAxisElm1.transition().call(yAxis1);
        }

        function IsCandleStickDataExists(graphData) {

            var candleStickDataExists = _.any(graphData, function (obj) {
                return obj.variables.candleStickType.length > 0;
            });

            return candleStickDataExists;
        }

        function updateSeries() {

            if (tempData == null) {
                return;
            }

            var candleStickDataExists = IsCandleStickDataExists(tempData);
            var candeStickRefinedData = [];

            if (candleStickDataExists) {
                candeStickRefinedData = tempData.map(function (d) {
                    return d.variables.candleStickType[0].value;
                });
            }

            series1
                   .xScale0(xScale0)
                   .xScale1(xScale1)
                   .yScale0(yScale0)
                   .yScale1(yScale1)
                   .colorScale(colorScale)
                   .height(height);

            d3.select(elem[0]).select('svg g.container')
                   .datum(tempData)
                   .call(series1);

            series2
                  .xScale(xScale0)
                  .yScale(yScale1);

            d3.select(elem[0]).select('svg g.container')
                .datum(candeStickRefinedData)
                .call(series2);
        }

        return chart;

    }

    /* Grouped Bar Graph Component */
    var groupedBarGraph = function (options) {

        var tooltip = options.tooltip;

        var xScale0 = d3.scale.ordinal(),
            xScale1 = d3.scale.ordinal(),
            yScale0 = d3.scale.linear(),
            yScale1 = d3.scale.linear(),
            colorScale = d3.scale.ordinal(),
            height = null;

        var groupedBarGraph = function (selection) {
            var series, states, bars;

            selection.each(function (data) {

                series = d3.select(this).selectAll('.grouped-bar-graph-series').data([data]);
                series.enter().append('g').classed('grouped-bar-graph-series', true);

                // STATES
                states = series.selectAll('.state')
                              .data(data, function (d, i) {
                                  return i;
                              });
                states.enter()
                        .append('g')
                        .classed('state', true);


                states.exit()
                       .remove();

                states.transition()
                    .attr("transform", function (d) {
                        return "translate(" + xScale0(d.x) + ",0)";
                    });

                // BARS
                bars = states.selectAll("rect")
                 .data(function (d) {
                     return d.variables.barType;
                 });

                bars.enter()
                    .append("rect")
                    .classed('bar', true);

                bars.exit()
                    .remove();

                bars.transition()
                        .attr("width", xScale1.rangeBand())
                        .attr("x", function (d) {
                            return xScale1(d.name);
                        })
                        .attr("y", function (d) {
                            return yScale0(d.value);
                        })
                        .attr("height", function (d) {
                            return height - yScale0(d.value);
                        })
                        .style("fill", function (d) {
                            return colorScale(d.name);
                        });

                bars
                .on('mouseover', tooltip.show)
                .on('mouseout', tooltip.hide);

            });

        };

        groupedBarGraph.xScale0 = function (value) {
            if (!arguments.length) {
                return xScale0;
            }
            xScale0 = value;
            return groupedBarGraph;
        };

        groupedBarGraph.xScale1 = function (value) {
            if (!arguments.length) {
                return xScale1;
            }
            xScale1 = value;
            return groupedBarGraph;
        };

        groupedBarGraph.yScale0 = function (value) {
            if (!arguments.length) {
                return yScale0;
            }
            yScale0 = value;
            return groupedBarGraph;
        };

        groupedBarGraph.yScale1 = function (value) {
            if (!arguments.length) {
                return yScale1;
            }
            yScale1 = value;
            return groupedBarGraph;
        };

        groupedBarGraph.colorScale = function (value) {
            if (!arguments.length) {
                return colorScale;
            }
            colorScale = value;
            return groupedBarGraph;
        };

        groupedBarGraph.height = function (value) {
            if (!arguments.length) {
                return height;
            }
            height = value;
            return groupedBarGraph;
        };

        return groupedBarGraph;

    }

    /* OHLC component */
    var ohlc = function (options) {

        var tooltip = options.tooltip;

        var xScale = d3.scale.ordinal(),
            yScale = d3.scale.linear();

        var isUpDay = function (d) {
            return d.close > d.open;
        };
        var isDownDay = function (d) {
            return !isUpDay(d);
        };

        var tickWidth = 5;

        var line = d3.svg.line()
            .x(function (d) {
                return d.x;
            })
            .y(function (d) {
                return d.y;
            }).defined(function (d) { return !isNaN(d.y) });

        var highLowLines = function (bars) {

            var paths = bars.selectAll('.high-low-line').data(function (d) {
                return [d];
            });

            paths.enter().append('path');

            paths.classed('high-low-line', true)
                .transition()
                .attr('d', function (d, j, i) {
                    return line([
                        { x: xScale(i) + xScale.rangeBand() / 2, y: yScale(d.high) },
                        { x: xScale(i) + xScale.rangeBand() / 2, y: yScale(d.low) }
                    ]);
                });

            paths

            .on('mouseover', tooltip.show)
            .on('mouseout', tooltip.hide);

        };

        var openCloseTicks = function (bars) {
            var open,
                close;

            open = bars.selectAll('.open-tick').data(function (d) {
                return [d];
            });

            close = bars.selectAll('.close-tick').data(function (d) {
                return [d];
            });

            open.enter().append('path');
            close.enter().append('path');

            open.classed('open-tick', true)
                .transition()
                .attr('d', function (d, j, i) {
                    return line([
                        { x: xScale(i) + xScale.rangeBand() / 2 - tickWidth, y: yScale(d.open) },
                        { x: xScale(i) + xScale.rangeBand() / 2, y: yScale(d.open) }
                    ]);
                });

            close.classed('close-tick', true)
                .transition()
                .attr('d', function (d, j, i) {
                    return line([
                        { x: xScale(i) + xScale.rangeBand() / 2, y: yScale(d.close) },
                        { x: xScale(i) + xScale.rangeBand() / 2 + tickWidth, y: yScale(d.close) }
                    ]);
                });

            open
                .on('mouseover', tooltip.show)
                .on('mouseout', tooltip.hide);

            close
                .on('mouseover', tooltip.show)
                .on('mouseout', tooltip.hide);

            open.exit().remove();
            close.exit().remove();
        };

        var ohlc = function (selection) {
            var series, bars;

            selection.each(function (data) {
                // series = d3.select(this);

                series = d3.select(this).selectAll('.ohlc-series').data([data]);
                series.enter().append('g').classed('ohlc-series', true);

                bars = series.selectAll('.bar')
                    .data(data, function (d, i) {
                            return i;
                    });

                bars.enter()
                    .append('g')
                    .classed('bar', true);

                bars.classed({
                    'up-day': isUpDay,
                    'down-day': isDownDay
                });
                highLowLines(bars);
                openCloseTicks(bars);

                bars.exit().remove();

            });
        };

        ohlc.xScale = function (value) {
            if (!arguments.length) {
                return xScale;
            }
            xScale = value;
            return ohlc;
        };

        ohlc.yScale = function (value) {
            if (!arguments.length) {
                return yScale;
            }
            yScale = value;
            return ohlc;
        };

        ohlc.tickWidth = function (value) {
            if (!arguments.length) {
                return tickWidth;
            }
            tickWidth = value;
            return ohlc;
        };

        return ohlc;

    };

    /* helper functions */
    var getPixelCssProp = function (element, propertyName) {
        var string;
        string = window.getComputedStyle(element, null).getPropertyValue(propertyName);
        return +string.replace(/px$/, '');
    }
}());