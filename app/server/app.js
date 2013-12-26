var config = require('./modules/config.js');
var express = require('express');
var http = require('http');
var _ = require('underscore');
var services = require('./modules/services.js');

// Express Configuration

var app = express();

app.configure(function () {
  app.set('port', process.env.PORT || 3030);
  app.set('views', __dirname + '/../client/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('CDqHZyw4v8NPxUWoecuA'));
  app.use(express.session());
  app.use(app.router);
  app.use(express.static(config.root + '/public'));
});

app.configure('development', function () {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function () {
  app.use(express.errorHandler());
});

// Routes

require('./modules/routes')(app);

// Start Server

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});

services.startJobRunner();
