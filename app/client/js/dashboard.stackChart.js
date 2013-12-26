var Dashboard = Dashboard || {};
Dashboard.StackChart = (function () {
  var pub = {};

  var plainDateFormatter = d3.time.format('%b %d');
  var timeFormatter = d3.time.format('%H:%M');
  var dateTimeFormatter = d3.time.format('%b %d %H:%M');

  function getClickRange(data) {
    var max = d3.max(data, function (site) {
      return d3.max(site.values, function (d) {
        return d.x;
      });
    });
    var min = d3.min(data, function (site) {
      return d3.min(site.values, function (d) {
        return d.x;
      });
    });

    return [min, max];
  }

  function compileLayersUsingLookback(options) {
    var layers = [];
    var sites = d3.keys(options.data[options.data.length - 1]);
    var lookback = Dashboard.Service.option(options.id, 'lookback');

    $.each(sites, function (i, siteName) {
      if (siteName === 'timestamp') {
        return;
      }

      var layer = {
        name: siteName,
        values: []
      };

      $.each(options.data, function (i, snapshot) {
        if (i < lookback) {
          return;
        }
        var cell = {
          x: snapshot.timestamp,
          y: (options.data[i][siteName] || {})[options.key] - (options.data[i - lookback][siteName] || {})[options.key] || 0
        };
        layer.values.push(cell);
      });

      layers.push(layer);
    });

    return layers;
  }

  function compileLayers(options) {
    var layers = [];
    var sites = d3.keys(options.data[options.data.length - 1]);

    $.each(sites, function (i, siteName) {
      if (siteName === 'timestamp') {
        return;
      }

      var layer = {
        name: siteName,
        values: []
      };

      $.each(options.data, function (i, snapshot) {
        var cell = {
          x: snapshot.timestamp,
          y: (snapshot[siteName] || {})[options.key] || 0
        };
        layer.values.push(cell);
      });

      layers.push(layer);
    });

    return layers;
  }

  pub.getTotals = function (data, slice) {
    var total = 0;
    $.each(data, function (i, site) {
      $.each(site, function (i, values) {
        if (i !== 'values') {
          return;
        }
        total += values[slice || values.length - 1].y;
      });
    });

    return total;
  };

  pub.onTearDown = function () {
    $(window).unbind('mousemove.stackChart');
  };

  pub.filterData = function (options, data) {
    var query = Dashboard.Service.option(options.id, 'filter');
    var filterKey = Dashboard.Service.options(options.id, 'filter').key;
    if (query && filterKey) {
      data = data.filter(function (obj) {
        var match = false;
        $.each(query.toLowerCase().split(' '), function (i, query) {
          query = Dashboard.Utils.trim(query);
          if (query && !match) {
            match = Dashboard.Utils.includes(obj[filterKey].toLowerCase(), query);
          }
        });

        return match;
      });
    }

    return data;
  };

  pub.render = function (options) {
    var data = options.lookback ? compileLayersUsingLookback(options) : compileLayers(options);
    var chartHeight = $(window).height() - 35 - $('#chart').offset().top;
    var domain = getClickRange(data);
    var range = [0, $('#chart').width() - 215];
    var x = d3.time.scale().domain(domain).range(range);
    var palette = Dashboard.Utils.getPalette();
    var lookback = Dashboard.Service.option(options.id, 'lookback') || 0;
    var offsetType = Dashboard.Service.option(options.id, 'offsetType') || 'zero';
    var stack = d3.layout.stack()
      .offset(offsetType) // zero, expand, wiggle, silhouette
      .values(function (d) { return d.values; });

    if (options.lookback) {
      data.sort(function (a, b) {
        return a.values[lookback].y - b.values[lookback].y;
      });
    } else {
      data.sort(function (a, b) {
        return a.values[a.values.length - 1].y - b.values[b.values.length - 1].y;
      });
    }

    data = pub.filterData(options, data);
    var layers = stack(data);

    var maxY = d3.max(layers, function (layer) {
      return d3.max(layer.values, function (d) {
        return d.y0 + d.y;
      });
    });

    var scaleType = Dashboard.Service.option(options.id, 'scaleType') || 'linear';
    var y = d3.scale[scaleType]()
      .domain([maxY, 0])
      .range([0, chartHeight]);

    var area = d3.svg.area()
      .interpolate('basis') // step, basis
      .x(function (d) { return x(d.x); })
      .y0(function (d) { return y(d.y0); })
      .y1(function (d) { return y(d.y0 + d.y); });

    $('#chart').html('<div id="stackChart"></div>');
    $('#stackChart').height(chartHeight);

    var container = d3.select('#stackChart');
    var svg = container.append('svg');
    var autoColor = d3.scale.category10();

    svg.selectAll('path')
      .data(layers)
      .enter().append('path')
      .attr('d', function (d) {
        return area(d.values);
      })
      .style('fill', function (d) {
        return palette[d.name] || autoColor(d.name);
      })
      .style('stroke-width', function (d) {
        return '1px';
      })
      .style('stroke', function (d) {
        return palette[d.name] || autoColor(d.name);
      });

    var y2 = d3.scale[scaleType]()
      .domain([maxY, 0])
      .range([-6, chartHeight]);

    var mouseoverScale = d3.scale.linear()
      .domain([10, $(window).width() - 222])
      .range([0, data[0].values.length - 1]);

    $('<div class="current_y_axis"></div>').appendTo('#stackChart');

    function renderYAxis(column) {
      $('#stackChart div.y_axis').remove();
      var yAxisRight = container.append('div')
        .attr('class', 'y_axis');

      var lastTop = chartHeight;
      yAxisRight.selectAll('.tick')
        .data(data)
        .enter().append('div')
        .attr('class', 'tick')
        .style('top', function (d) {
          var top = d.values[column || d.values.length - 1].y0 + (d.values[column || d.values.length - 1].y / 2);
          top = Math.min(y2(top), lastTop - 14);
          lastTop = top;
          return top + 'px';
        })
        .html(function (d) {
          var color = palette[d.name] || autoColor(d.name);
          var format = options.amountFormat || '0.0a';
          var amount = offsetType === 'expand' ?
            numeral(d.values[column || d.values.length - 1].y).format('0.0%') :
            numeral(d.values[column || d.values.length - 1].y).format(format);
          return '<span style="color: ' + color + ';">' + d.name.toLowerCase().replace(/_/g, ' ') +
            '<span class="amount">' + amount + '</span></span>';
        });

      if (options.showTotal) {
        $('#stackChartTotal').remove();
        $('#chart').append('<div id="stackChartTotal"></div>');
        var totalRevenue = '100%';
        if (offsetType === 'zero') {
          totalRevenue = Dashboard.StackChart.getTotals(data, column);
          totalRevenue = numeral(totalRevenue).format(options.totalFormat || '$0.0a');
        }
        var totalTimestamp = dateTimeFormatter(new Date(data[0].values[column || data[0].values.length - 1].x));

        var html = 'total <span class="amount">' + totalRevenue + '</span>' +
          '<div class="timestamp">as of <strong>' + totalTimestamp + '</strong></div>';
        $('#stackChartTotal').html(html);
      }

      var currentYAxis = Math.round(x(data[0].values[column || data[0].values.length - 1].x));
      $('.current_y_axis').css({ left: currentYAxis });

      if (column) {
        $('#stackChart div.y_axis').css({ left: currentYAxis + 5 });
      }
    }

    renderYAxis();

    $(window).unbind('mousemove.stackChart').bind('mousemove.stackChart', function (e) {
      if (e.pageX < 10 || e.pageX > $(window).width() - 222 || e.pageY < 55) {
        return renderYAxis();
      }
      renderYAxis(Math.round(mouseoverScale(e.pageX)));
    });

    var xAxis = container.append('div')
      .attr('class', 'x_axis');

    xAxis.selectAll('.tick')
      .data(function () {
        return x.ticks(15);
      })
      .enter().append('div')
      .attr('class', 'tick')
      .style('height', chartHeight + 'px')
      .style('left', function (d) {
        return Math.round(x(d)) + 'px';
      })
      .html(function (d) {
        var t = timeFormatter(d);
        var spanClass = '';
        if (t === '00:00') {
          t = plainDateFormatter(d);
          spanClass = 'bright';
        }
        return '<span class="' + spanClass + '">' + t + '</span>';
      });

    if (options.afterRender) {
      options.afterRender(data, options);
    }
  };

  return pub;
}());
