(function () {

  Dashboard.Service.add({
    id: 'Counter',
    name: 'Counter',
    url: '/service/counter',
    interval: 2500,
    render: render
  });

  var oldData;
  var numeralFormat = '0,0.00';

  function render(data) {
    var html = Dashboard.View.render('counter', {
      title: 'Example Counter Title',
      prefix: '$',
      number: numeral(data).format(numeralFormat),
      note: 'This is an example of a server-side counter.'
    });

    $('#chart').html(html);
    Dashboard.View.centerElement($('#counter'));

    if (!oldData) {
      oldData = data;
    }
    Dashboard.Utils.animateText({
      element: $('#counter .raw_number'),
      format: numeralFormat,
      oldData: oldData,
      data: data,
      frames: 100,
      interval: 25
    });
    oldData = data;
  }

}());
