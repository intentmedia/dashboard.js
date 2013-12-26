var _ = require('underscore');
var http = require('http');
var redis = require('redis');
var redisClient = redis.createClient();

exports.getJSONfromURL = function (url, callback) {
  http.get(url, function (res) {
    var body = '';

    res.on('data', function (chunk) {
      body += chunk;
    });

    res.on('end', function () {
      callback(body ? JSON.parse(body) : body);
    });
  });
};

exports.getFromURL = function (url, callback) {
  http.get(url, function (res) {
    var body = '';

    res.on('data', function (chunk) {
      body += chunk;
    });

    res.on('end', function () {
      callback(body);
    });
  });
};

exports.stack = {};

exports.stack.serve = function (key, callback) {
  redisClient.get(key, function (err, data) {
    callback(data || []);
  });
};

exports.stack.push = function (key, maxLength, fetchLatest) {
  redisClient.get(key, function (err, existing) {
    existing = existing ? JSON.parse(existing) : [];
    fetchLatest(function (latest) {
      if (!latest) {
        return console.log('no latest data returned!');
      }
      var changes = JSON.stringify(existing[existing.length - 1] || {}) !== JSON.stringify(latest);
      if (existing.length === 0 || changes) {
        existing.push(latest);
        while (existing.length > maxLength) {
          existing.shift();
        }
        redisClient.set(key, JSON.stringify(existing));
      }
    });
  });
};

exports.stack.fetchLatest = function (key, callback) {
  redisClient.get(key, function (err, data) {
    data = data ? JSON.parse(data) : {};
    data.timestamp = new Date().getTime();
    callback(data);
  });
};

exports.stack.resetLatestProperty = function (key, property, newValue) {
  redisClient.get(key, function (err, data) {
    data = data ? JSON.parse(data) : {};
    _.each(data, function (d) {
      d[property] = newValue || 0;
    });
    redisClient.set(key, JSON.stringify(data));
  });
};

exports.stack.resetProperty = function (key, property, newValue) {
  redisClient.get(key, function (err, data) {
    data = data ? JSON.parse(data) : {};
    _.each(data, function (slice) {
      _.each(slice, function (d) {
        d[property] = newValue || 0;
      });
    });
    redisClient.set(key, JSON.stringify(data));
  });
};
