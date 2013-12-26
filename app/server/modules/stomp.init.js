var Stomp = require('stompjs');

exports.init = function (url, topic, onMessage) {
  var client;
  var RECONNECT_DELAY = 1000 * 30;
  var timeoutID;

  function onConnect() {
    console.log('Subscribing to ' + topic);
    client.subscribe(topic, topicHandler);
  }

  function onError(error) {
    console.log('Error:', error.code);
    clearTimeout(timeoutID);
    setTimeout(connect, RECONNECT_DELAY);
  }

  function topicHandler(data) {
    if (data.command === 'MESSAGE') {
      onMessage(data.body);
      clearTimeout(timeoutID);
      timeoutID = setTimeout(connect, RECONNECT_DELAY);
    }
  }

  function connect() {
    client = Stomp.overWS(url);
    client.debug = function (message) {
      // console.log(message);
    };
    console.log('Connecting to ' + url);
    client.connect(null, null, onConnect, onError);
    clearTimeout(timeoutID);
    timeoutID = setTimeout(connect, RECONNECT_DELAY);
  }

  connect();
};
