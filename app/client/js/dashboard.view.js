var Dashboard = Dashboard || {};
Dashboard.View = (function () {
  var pub = {};
  pub.Templates = {};

  pub.render = function (name, data) {
    if (!pub.Templates[name]) {
      pub.Templates[name] = new Hogan.Template(HoganTemplates[name]);
    }
    return pub.Templates[name].render(data);
  };

  pub.attach = function (html, target, method) {
    // Valid methods are appendTo, prependTo, insertAfter, insertBefore
    // since they return the new element, not the target
    method = method || 'appendTo';
    return $($.trim(html))[method](target);
  };

  pub.message = function (str, options) {
    options = $.extend({
      type: 'info',
      timeout: 3000
    }, options || {});

    var html = pub.render('message', { str: str, type: options.type });
    var element = pub.attach(html, '#messages').click(function () {
      $(this).fadeOut(250, function () { $(this).remove(); });
      return false;
    });

    if (options.timeout) {
      setTimeout(function () {
        element.fadeOut(1000, function () { element.remove(); });
      }, options.timeout);
    }

    return element;
  };

  pub.drawFrameLayout = function () {
    var frames = Dashboard.Workspace.parseHash();
    var html = '<table id="iframes">';
    $.each(frames, function (i, row) {
      var columns = '';
      $.each(row, function (i, column) {
        columns += '<td><iframe src="/#' + column + '" /></td>';
      });
      html += '<tr><td><table><tr>' + columns + '</tr></table></td></tr>';
    });
    html += '</table>';

    pub.attach(html, 'body');
  };

  pub.drawPageLayout = function () {
    var data = { services: Dashboard.Utils.toArray(Dashboard.Service.services) };
    pub.attach(pub.render('layout', data), 'body');

    $('#services').change(function () {
      pub.drawCurrentlySelectedService();
      setTimeout(function () {
        $('#services').blur();
      }, 100);
      return false;
    });
  };

  pub.drawCurrentlySelectedService = function () {
    var name = $('#services').val();
    var id = $('#services option').filter(function () {
      return $(this).text().trim() === name;
    }).attr('name');
    document.location.hash = encodeURI(id);
    window.parent.Dashboard.Workspace.updateParentHash();
    Dashboard.Service.start(id);
  };

  pub.setChartHeight = function () {
    pub.setElementHeight('#chart', 12);
  };

  pub.setElementHeight = function (element, offset) {
    element = $(element);
    offset = offset || $('#services').outerHeight() + 12;
    var height = $(window).height() - offset - element.offset().top;
    element.height(height);
  };

  pub.centerElement = function (element) {
    var elementHeight = $(element).outerHeight();
    var chartHeight = $('#chart').outerHeight();
    $(element).css({ position: 'relative', top: (chartHeight / 2) - (elementHeight / 2) });
  };

  pub.showChartLoader = function () {
    $('#loading').fadeIn(0);
  };

  pub.hideChartLoader = function () {
    $('#loading').fadeOut(250);
  };

  pub.isParentWindow = function () {
    return window.top === window;
  };

  pub.init = function () {
    if (pub.isParentWindow()) {
      pub.drawFrameLayout();
    } else {
      pub.drawPageLayout();
      pub.drawCurrentlySelectedService();
    }
  };

  return pub;
}());
