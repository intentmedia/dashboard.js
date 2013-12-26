var Dashboard = Dashboard || {};
Dashboard.Service = (function () {
  var pub = {};

  pub.services = {};

  pub.add = function (config) {
    if (config.disabled) {
      return false;
    }
    pub.services[config.id] = config;
  };

  pub.get = function (id) {
    var service = pub.services[id];
    if (!service) {
      Dashboard.Utils.error('Service "' + id + '" not found.');
      service = Dashboard.Utils.first(pub.services);
    }

    return service;
  };

  pub.getActiveService = function () {
    var activeService;
    $.each(pub.services, function (i, service) {
      if (service.active) {
        activeService = service;
      }
    });
    return activeService;
  };

  pub.option = function (id, key) {
    var service = pub.services[id];
    return (service.options[key] || {}).value;
  };

  pub.options = function (id, key) {
    var service = pub.services[id];
    return service.options[key] || {};
  };

  pub.start = function (id) {
    Dashboard.View.showChartLoader();
    $.map(pub.services, pub.stop);

    var service = pub.get(id);
    service.active = true;
    Dashboard.Utils.localStorage('activeService', id);
    pub.resetControls();
    $('body').addClass(id);

    function updateFn() {
      var requestData = {};
      if (Dashboard.Utils.isFunction(service.requestData)) {
        requestData = service.requestData();
      } else if (Dashboard.Utils.isObject(service.requestData)) {
        requestData = service.requestData;
      }
      $.ajax({
        url: service.url,
        data: requestData,
        success: function (data) {
          service.data = data ? JSON.parse(data) : {};
          service.render(service.data);
          Dashboard.View.hideChartLoader();
        }
      });
    }

    if (service.init) {
      service.init();
    }
    if (service.url) {
      service.intervalID = setInterval(updateFn, service.interval);
      pub.drawControls(service, service.render || updateFn);
      if (service.render && service.data) {
        service.render(service.data);
        Dashboard.View.hideChartLoader();
      } else {
        updateFn();
      }
    } else if (service.render) {
      service.render();
      Dashboard.View.hideChartLoader();
    }
    Dashboard.View.setChartHeight();
  };

  pub.stop = function (service) {
    if (service.active) {
      if (service.intervalID) {
        clearInterval(service.intervalID);
      }
      $('body').removeClass(service.id);
      (service.tearDown || Dashboard.Utils.noop)();
      service.active = false;
    }
  };

  pub.resetControls = function () {
    $('#controls input, #controls select').off('.DashboardService');
    $('#controls').html('');
  };

  pub.getSavedOptionValue = function (service, option) {
    return Dashboard.Utils.localStorage(service.id + '.option.' + option.id) || option.value;
  };

  pub.saveOptionValue = function (service, option, value) {
    Dashboard.Utils.localStorage(service.id + '.option.' + option.id, value);
    option.value = value;
  };

  pub.removeFilter = function () {
    $(this).closest('.option').find('input').val('').trigger('keyup');
  };

  pub.drawControls = function (service, updateFn) {
    var html = '';
    $.each(service.options || {}, function (optionKey, option) {
      option.id = option.id || Dashboard.Utils.cssify(option.control + '-' + option.name);
      option.value = pub.getSavedOptionValue(service, option);

      var html = Dashboard.View.render('option_' + option.control, option);
      var element = Dashboard.View.attach(html, '#controls');

      if (option.control === 'slider') {
        var sliderTimeout;
        element.find('.slider .gutter').slider({
          min: option.min,
          max: option.max,
          value: option.value,
          slide: function (e, ui) {
            clearTimeout(sliderTimeout);
            sliderTimeout = setTimeout(function () {
              pub.saveOptionValue(service, option, ui.value);
              updateFn(service.data);
            }, 25);
          }
        });
      } else if (option.control === 'dropdown') {
        var select = element.find('select');
        $.each(option.values, function (i, o) {
          if (o.value === option.value) {
            select.val(o.value);
          }
        });
        select.on('change.DashboardService', function () {
          pub.saveOptionValue(service, option, $(this).val());
          updateFn(service.data);
        });
      } else if (option.control === 'filter') {
        var input = element.find('input');
        var filterTimeout;
        input.on('keyup.DashboardService', function (e) {
          if (Dashboard.Utils.keyPressed(e, 'ESCAPE')) {
            $(this).val('');
          }
          var query = $(this).val();
          var iconRemoveDisplay = query ? 'inline-block' : 'none';
          $(this).closest('.option').find('.icon-remove').css({ display: iconRemoveDisplay });
          clearTimeout(filterTimeout);
          filterTimeout = setTimeout(function () {
            pub.saveOptionValue(service, option, query);
            updateFn(service.data);
          }, 100);
        });

        var iconRemoveDisplay = input.val() ? 'inline-block' : 'none';
        element.find('.icon-remove').css({ display: iconRemoveDisplay });
      }
    });
  };

  pub.initResizeHandler = function () {
    var timeoutID;
    $(window).resize(function () {
      clearTimeout(timeoutID);
      timeoutID = setTimeout(function () {
        Dashboard.View.setChartHeight();
        var service = pub.getActiveService();
        if (service && service.render) {
          service.render(service.data);
        }
      }, 250);
    });
  };

  pub.initOnce = function () {
    if (!Dashboard.View.isParentWindow()) {
      var hash = decodeURI(document.location.hash).replace('#', '');
      var activeService = hash || Dashboard.Utils.localStorage('activeService');
      if (activeService) {
        pub.get(activeService).active = true;
      }
      pub.initResizeHandler();
    }
  };

  return pub;
}());
