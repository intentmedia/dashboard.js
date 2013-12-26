var redis = require('redis');
var redisClient = redis.createClient();

var SERVICE_KEY = 'DASHBOARD_COUNTER';

// Set to true to disable the service's server-side component.
exports.disabled = false;

// Jobs are simply functions that are executed at some date or time interval.
exports.jobs = [
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
