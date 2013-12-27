# Dashboard.js

A Node.js dashboard framework.

![Screenshot](http://i.imgur.com/nEDTuC6.png)

### Why does this exist?

This was written to display real-time company metrics using portable hardware and a couple large plasma displays. We originally tried using [Dashing](https://github.com/Shopify/dashing), which is nice for displaying many simple data points on one page, but we wanted to display complicated data on many pages. Another major difference is that Dashing uses Ruby, Sinatra and Batman.js (and Coffeescript), whereas Dashboard.js uses Node, Express, and a custom JavaScript framework (and no Coffeescript).

### OS X Installation

If you haven't installed [Homebrew](http://brew.sh) already, do that:

```sh
ruby -e "$(curl -fsSL https://raw.github.com/Homebrew/homebrew/go/install)"
```

If you haven't installed [Node.js](http://nodejs.org/), [Redis](http://redis.io/), and [Grunt](http://gruntjs.com/) already, do that:

```sh
brew install node redis
npm -g install grunt-cli
```

Install Dashboard.js:

```sh
git clone git@github.com:intentmedia/dashboard.js.git
cd dashboard.js
# Install node dependencies
npm install
# Create the services directory and copy over the example services to get started:
cp -R app/example_services app/services
```

### Starting the Application

In terminal window #1, start Redis, if it isn't already running:

```sh
redis-server
```

In terminal window #2, run Grunt and start the Node app:

```sh
grunt
node app/server/app.js
```

### Service Design

Dashboard.js services are encapsulated in the sense that server-side code, client-side code, templates, CSS, and static assets all live in the same directory. The only required file is `client.js`, but dashboards that have a server-side component require a `server.js` file.

```
app/
  services/
    service_id/
      public/            # static assets, available at
                         # /services/[service_id]/blah.jpg
      client.js          # all client-side service code
      server.js          # all server-side service code
      [foo].css          # bundled and loaded after the framework CSS
      [template_id].html # hogan template, available to any service
```

A service involves both client-side and server-side polling. The server is continually updating its data, and the client is continually asking the server for the most recent copy.

The easiest way to understand how a service works is by looking at the example services included. There are a number of examples included that demonstrate the basic concepts and what's possible out of the box.

#### Server-side Code Example

```js
var redis = require('redis');
var redisClient = redis.createClient();

var SERVICE_KEY = 'DASHBOARD_COUNTER';

// Set to true to disable the service's server-side component.
exports.disabled = false;

// Jobs are simply functions that are executed at some date or time interval.
exports.jobs = [
  {
    cron: '1 0 0 * * *', // every night at midnight EST
    callback: resetCounter,
    timeZone: 'America/New_York'
  },
  {
    cron: '* * * * * *', // every second
    callback: updateCounter
  }
];

// args is an object passed to the server via the `requestData` parameter.
// responseToClient sends data back to the client which gets passed
// to the `render` function.
exports.serve = function (args, responseToClient) {
  redisClient.get(SERVICE_KEY, function (err, data) {
    responseToClient(data ? data : 0);
  });
};

function resetCounter() {
  redisClient.set(SERVICE_KEY, 0);
}

function updateCounter() {
  updateKey(SERVICE_KEY, function (count) {
    count = parseFloat(count) || 0;
    count += (Math.random() * 10);
    return count;
  });
}

function updateKey(key, updateFn) {
  redisClient.get(key, function (err, data) {
    data = updateFn(data);
    redisClient.set(key, data);
  });
}
```

#### Client-side Code Example

There is one client-side function used to register and configure a service.

```js
Dashboard.Service.add({
  // The unique id of this service.
  id: 'Counter',
  // The name in the service selector.
  name: 'Counter',
  // Disabled services don't show up in the service selector.
  disabled: false,
  // The url to ask for data. The URL should map to the service name (i.e. app/services/counter).
  url: '/service/counter',
  // How often to poll the server for new data, in milliseconds.
  interval: 1000,
  // Data to be sent to the server. Can be an object or a function.
  requestData: function () { },
  // Function called once, during service init.
  init: function () { },
  // Function called before a different service is initialized.
  tearDown: function () { },
  // Function called when we get data from the server.
  render: function (data) {
    // Assumes a my_template.html file exists in this or another service directory.
    Dashboard.View.render('my_template', data);
  },
  // Options that can be used to interact with the rendered data.
  // Use Dashboard.Service.option(service_id, option_key) to get the selected value.
  options: {
    lookback: {
      name: 'Granularity',
      control: 'slider',
      value: 15,
      min: 1,
      max: 30
    },
    scaleType: {
      name: 'Scale Type',
      control: 'dropdown',
      value: 'linear',
      values: [
        { name: 'Linear', value: 'linear' },
        { name: 'Square Root', value: 'sqrt' }
      ]
    },
    filter: {
      name: 'Filter',
      control: 'filter',
      key: 'name'
    }
  }
});
```

### Project Status

This is beta software, use at your own risk. If you have any issues or feature requests, we would love to know, please open a GitHub issue. Contributions and pull requests are also very welcome - we would especially like to include more out-of-the-box example services.

### Author

Dashboard.js was created by [Andrew Childs](https://github.com/andrewchilds).
