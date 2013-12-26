var fs = require('fs');
var _ = require('underscore');
var services = require('./services.js');

module.exports = function (app) {

  app.get('/', function (req, res) {
    fs.readFile('./.fingerprint', function (err, data) {
      if (err) {
        console.log('Fingerprint file not found, using current timestamp instead.');
      }
      res.render('index', { timestamp: data || new Date().getTime() });
    });
  });

  app.get('/services', function (req, res) {
    res.json(_.keys(services));
  });

  app.get('/service/:service', function (req, res) {
    var service = services[req.param('service')];
    if (service) {
      service.serve(req.query, function (data) {
        res.json(data);
      });
    } else {
      res.json({ error: 'Service not found.' });
    }
  });

};
