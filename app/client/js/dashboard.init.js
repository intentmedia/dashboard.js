var Dashboard = Dashboard || {};
Dashboard.Init = (function () {
  var pub = {};
  var firstRun = true;

  pub.moduleExec = function (functionName) {
    $.each(Dashboard, function (moduleName, module) {
      if (moduleName !== 'Init' && Dashboard.Utils.isObject(module) &&
        Dashboard.Utils.isFunction(module[functionName])) {
        module[functionName]();
      }
    });
  };

  pub.init = function () {
    if (firstRun) {
      pub.moduleExec('initOnce');
    }

    pub.moduleExec('init');
    firstRun = false;
  };

  return pub;
}());

$(Dashboard.Init.init);
