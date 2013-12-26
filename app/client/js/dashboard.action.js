var Dashboard = Dashboard || {};
Dashboard.Action = (function () {
  var pub = {};

  pub.initBodyEventHandlers = function () {
    var strToFunction = function (functionName, context) {
      context = context || window;
      var namespaces = functionName.split('.');
      var func = namespaces.pop();
      for (var i = 0; i < namespaces.length; i++) {
        if (!context[namespaces[i]]) {
          return false;
        }
        context = context[namespaces[i]];
      }
      return context[func];
    };

    var handleEvent = function (event, eventType) {
      var target = $(event.target).closest('[data-' + eventType + '-handler]');
      var handler = target.data(eventType + '-handler');
      if (handler) {
        handler = strToFunction(handler);
        if (Dashboard.Utils.isFunction(handler)) {
          return handler.call(target[0], event);
        }
      }
    };

    $('body').click(function (event) {
      // Handle links in textareas
      var target = $(event.target);
      if (target.is('a') && target.attr('href') !== '#' && !target.data('click-handler')) {
        return;
      }
      return handleEvent(event, 'click');
    }).mousemove(function (event) {
      clearTimeout(pub.hoverTimeout);
      pub.hoverTimeout = setTimeout(function () {
        return handleEvent(event, 'hover');
      }, 50);
    }).on('dragstart', function (event) {
      return handleEvent(event, 'dragstart');
    }).on('dragover dragenter', function (event) {
      return false;
    }).on('drop', function (event) {
      return handleEvent(event, 'drop');
    });
  };

  pub.initOnce = function () {
    pub.initBodyEventHandlers();
  };

  return pub;
}());
