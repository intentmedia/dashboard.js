var fs = require('fs');
var _ = require('underscore');
var cronJob = require('cron').CronJob;
var config = require('./config.js');

var services = {};

var servicePublicDestParent = config.root + '/public/services';
if (!fs.existsSync(servicePublicDestParent)) {
  console.log('Creating public/services directory...');
  fs.mkdirSync(servicePublicDestParent);
}

fs.readdirSync('app/services').forEach(function(service) {
  var filename = config.services_dir + '/' + service + '/server.js';
  if (fs.existsSync(filename)) {
    console.log('Loading ' + service + ' service');
    services[service] = require(filename);
    exports[service] = services[service];
  }

  var servicePublicDir = config.services_dir + '/' + service + '/public';
  var servicePublicDestDir = servicePublicDestParent + '/' + service;
  if (fs.existsSync(servicePublicDir)) {
    if (!fs.existsSync(servicePublicDestDir)) {
      console.log('Creating symlink between', servicePublicDir, 'and', servicePublicDestDir);
      fs.symlinkSync(servicePublicDir, servicePublicDestDir);
    }
  }
});

exports.startJobRunner = function () {
  _.each(services, function (service, name) {
    if (service.disabled) {
      return;
    }
    if (service.init) {
        service.init();
    }
    if (service.jobs) {
      service.runningJobs = [];
      _.each(service.jobs, function (options) {
        var job = new cronJob({
          cronTime: options.cron,
          onTick: options.callback,
          start: options.start || false,
          timeZone: options.timeZone || 'America/New_York'
        });
        job.start();
        service.runningJobs.push(job);
      });
    }
  });
};
