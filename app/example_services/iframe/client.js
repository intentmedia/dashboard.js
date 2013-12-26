(function () {

  Dashboard.Service.add({
    id: 'iframe',
    name: 'Example iFrame',
    render: function () {
      var html = Dashboard.View.render('example_iframe');
      $('#chart').html(html);
      Dashboard.View.setElementHeight('#example_iframe');
    }
  });

}());
