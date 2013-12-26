var stack = require('../../server/modules/service_helper.js').stack;

var SERVICE_KEY = 'DASHBOARD_EXAMPLE_STACK';

// exports.init = function () { };

exports.jobs = [
  {
    cron: '15 0 0 * * *', // every night at midnight EST
    callback: resetCounters,
    timeZone: 'America/New_York'
  },
  {
    cron: '*/10 * * * * *', // every 10 seconds
    callback: updateStack
  },
];

// args is an object passed to the server via the `requestData` parameter.
// responseToClient sends data back to the client which gets passed
// to the `render` function.
exports.serve = function (args, responseToClient) {
  stack.serve(SERVICE_KEY, responseToClient);
};

function updateStack() {
  var stackLength = 100;
  stack.push(SERVICE_KEY, stackLength, function (callback) {
    callback({
      timestamp: new Date().getTime(),
      KEY_1: generateRandomData(),
      KEY_2: generateRandomData(),
      KEY_3: generateRandomData(),
      KEY_4: generateRandomData(),
      KEY_5: generateRandomData(),
      KEY_6: generateRandomData()
    });
  });
}

function resetCounters() {
  stack.resetLatestProperty(SERVICE_KEY, 'views');
}

function generateRandomData() {
  return {
    errors: Math.round(Math.random() * 10),
    views: Math.round(Math.random() * 100)
  }
}
