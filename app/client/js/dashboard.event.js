// Thin abstraction on top of jQuery's event handling.
var Dashboard = Dashboard || {};
Dashboard.Event = (function () {
  var pub = {};
  var prefix = 'Dashboard.';

  pub.bind = function (eventName, callback) {
    $(window).bind(prefix + eventName, callback);
  };

  pub.trigger = function (eventName, args) {
    $(window).trigger(prefix + eventName, args);
  };

  pub.unbind = function (eventName) {
    $(window).unbind(prefix + eventName);
  };

  return pub;
}());
