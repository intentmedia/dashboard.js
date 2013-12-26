(function () {

  Dashboard.Service.add({
    id: 'Stack',
    name: 'Stack Chart Example',
    interval: 5000,
    tearDown: Dashboard.StackChart.onTearDown,
    url: '/service/stack',
    options: {
      offsetType: {
        name: 'Offset Type',
        control: 'dropdown', // dropdown, slider, filter
        value: 'expand',
        values: [
          { name: 'Zero', value: 'zero' },
          { name: 'Expand', value: 'expand' }
        ]
      },
      scaleType: {
        name: 'Scale Type',
        control: 'dropdown', // dropdown, slider, filter
        value: 'linear',
        values: [
          { name: 'Linear', value: 'linear' },
          { name: 'Square Root', value: 'sqrt' }
        ]
      },
      filter: {
        name: 'Filter',
        control: 'filter', // dropdown, slider, filter
        key: 'name'
      }
    },
    render: render
  });

  function render(data) {
    Dashboard.StackChart.render({
      data: data,
      id: 'Stack',
      key: 'views',
      totalFormat: '0.0a',
      amountFormat: '0.0a',
      showTotal: true
    });
  }

}());
