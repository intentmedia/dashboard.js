var Dashboard = Dashboard || {};
Dashboard.Utils = (function () {
  var pub = {};

  pub.pad = function (n) {
    return n < 10 ? '0' + n : n;
  };

  pub.noop = function () {};

  pub.returnFalse = function () {
    return false;
  };

  pub.fuzzyBoolean = function (val) {
    return val === 'true' || val === true;
  };

  pub.log = function (str) {
    if (window.console && window.console.log) {
      window.console.log(str);
    } else {
      window.alert(str);
    }
  };

  pub.error = function (str) {
    if (window.console && window.console.error) {
      window.console.error(str);
    } else {
      window.alert(str);
    }
  };

  pub.keyPressed = function (e, key) {
    var keys = {
      'LEFT_CLICK': 1,
      'MIDDLE_CLICK': 2,
      'RIGHT_CLICK': 3,
      'TAB': 9,
      'ENTER': 13,
      'ESCAPE': 27,
      'SPACEBAR': 32,
      'LEFT_ARROW': 37,
      'UP_ARROW': 38,
      'RIGHT_ARROW': 39,
      'DOWN_ARROW': 40
    };

    return e && e.which === keys[key];
  };

  pub.exists = function (obj) {
    return typeof obj !== 'undefined' && obj !== null;
  };

  // from underscore
  pub.isObject = function (obj) {
    return obj === Object(obj);
  };

  pub.isDomElement = function (obj) {
    return !!(obj && obj.nodeType === 1);
  };

  $.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Array'], function (index, type) {
    pub['is' + type] = function (obj) {
      return Object.prototype.toString.call(obj) === '[object ' + type + ']';
    };
  });

  function localStorageWarning() {
    Dashboard.View.message('This browser does not support localStorage. You should use the latest version of Chrome, Firefox, or Safari.');
  }

  pub.localStorage = function (key, value) {
    try {
      if (window.localStorage) {
        key = 'Dashboard.' + key;

        if (pub.exists(value)) {
          if (!pub.isString(value)) {
            value = JSON.stringify(value);
          }
          window.localStorage[key] = value;
        }

        if (value === null) {
          window.localStorage.removeItem(key);
        }

        return window.localStorage[key];
      }
    } catch (e) {
      localStorageWarning();
    }
  };

  pub.clearLocalStorage = function () {
    try {
      if (window.localStorage) {
        // need to iterate in reverse since window.localStorage.length changes after removing an item
        for (var i = window.localStorage.length - 1; i >= 0; i--) {
          var key = window.localStorage.key(i);
          if (key.indexOf('Dashboard.') === 0) {
            window.localStorage.removeItem(key);
          }
        }
      }
    } catch (e) {
      localStorageWarning();
    }
  };

  pub.addColorsToPalette = function (newPaletteColors) {
    Dashboard.Palette = $.extend(Dashboard.Palette || {}, newPaletteColors);
  };

  pub.getPalette = function () {
    return Dashboard.Palette || {};
  };

  pub.cssify = function (str) {
    return str.toLowerCase().replace(/[^a-z0-9\-\_]/g, '');
  };

  pub.trim = function (str) {
    return str.replace(/^\s+/, '').replace(/\s+$/, '');
  };

  pub.includes = function (str, match) {
    return str.indexOf(match) !== -1;
  };

  pub.startsWith = function (str, match) {
    return str.indexOf(match) === 0;
  };

  pub.toArray = function (obj) {
    var values = [];
    $.each(obj, function (key, value) {
      values.push(value);
    });
    return values;
  };

  pub.removeFromArray = function (arr, val) {
    $.each(arr, function (index, item) {
      if (val === item) {
        arr.splice(index, 1);
      }
    });
    return arr;
  };

  pub.sortByProperty = function (arr, prop) {
    return arr.sort(function (a, b) {
      return a[prop] > b[prop] ? 1 : a[prop] === b[prop] ? 0 : -1;
    });
  };

  pub.objectLength = function (obj) {
    return obj ? $.map(obj, function (n, i) { return i; }).length : 0;
  };

  pub.objectSum = function (obj) {
    var sum = 0;
    $.each(obj, function (index, name) {
      sum += (parseInt(name, 10) || 0);
    });

    return sum;
  };

  pub.first = function (obj) {
    var output;
    $.each(obj, function (i, item) {
      if (!output) {
        output = item;
      }
    });

    return output;
  };

  pub.last = function (obj) {
    var output;
    $.each(obj, function (i, item) {
      output = item;
    });

    return output;
  };

  pub.formatDate = function (d, format) {
    format = format || '%M/%D/%Y %H:%i:%s';

    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var syntax = {
      d: function (d) { return d.getDate(); },
      D: function (d) { return pub.pad(d.getDate()); },
      m: function (d) { return d.getMonth() + 1; },
      M: function (d) { return pub.pad(d.getMonth() + 1); },
      Mon: function (d) { return months[d.getMonth()].substring(0, 3); },
      Month: function (d) { return months[d.getMonth()]; },
      Z: function (d) { return pub.pad(d.getMonth()); },
      y: function (d) { return d.getFullYear().toString().substring(2, 4); },
      Y: function (d) { return d.getFullYear(); },
      h: function (d) { return d.getHours(); },
      H: function (d) { return pub.pad(d.getHours()); },
      i: function (d) { return pub.pad(d.getMinutes()); },
      s: function (d) { return pub.pad(d.getSeconds()); }
    };

    $.each(syntax, function (code, macro) {
      format = format.replace(new RegExp('%' + code, 'g'), macro(d));
    });

    return format;
  };

  pub.getContentWindow = function (element) {
    return element.contentWindow ? element.contentWindow : element.contentDocument.defaultView;
  };

  pub.sample = function (array) {
    return array[Math.floor(Math.random()*array.length)];
  };

  pub.animateText = function (options) {
    var difference = (parseFloat(options.data) - parseFloat(options.oldData)) / options.frames;

    var animated = options.oldData;
    function update() {
      animated += difference;
      options.element.text(numeral(animated).format(options.format));
    }

    for (var i = 0; i < options.frames - 1; i++) {
      setTimeout(update, i * options.interval);
    }
  };

  return pub;
}());
