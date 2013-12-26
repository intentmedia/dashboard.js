var Dashboard = Dashboard || {};
Dashboard.Workspace = (function () {
  var pub = {};

  pub.parseHash = function () {
    var frames = decodeURI(document.location.hash).replace('#', '').split('|');
    $.each(frames, function (i, row) {
      frames[i] = row.split(',');
    });

    return frames;
  };

  pub.updateParentHash = function () {
    var rows = [];
    $('#iframes table').each(function () {
      var columns = [];
      $('iframe', this).each(function () {
        var context = Dashboard.Utils.getContentWindow($(this)[0]);
        columns.push(context.document.location.hash.replace('#', ''));
      });
      rows.push(columns.join(','));
    });

    rows = rows.join('|');
    document.location.hash = rows;
    document.title = rows + ' | Dashboard.js';
  };

  return pub;
}());
