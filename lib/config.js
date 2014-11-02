var base = require('taskcluster-base');
var Auth = require('taskcluster-client').Auth;
var Queue = require('taskcluster-client').Queue;
var format = require('util').format;

function* load(mode) {
  var serverConf = base.config({
    defaults:     require('../config/defaults'),
    profile:      require('../config/' + mode),
    envs: [],
    filename:     'dockerhost'
  });

  var config = yield serverConf.load.bind(serverConf);
  var host = require('../lib/host/' + config.worker.host);
  var hostOverrides = yield host();

  for (var key in hostOverrides) {
    config[key] = hostOverrides[key];
  }

  // Initialize classes...
  config.auth = new Auth(config.taskcluster);
  config.queue = new Queue(config.taskcluster);

  // Base url for the client specifically for this server.
  config.server.baseUrl = format(
    'http://%s:%d/v1',
    config.host,
    config.server.port
  );

  return config;
}

module.exports = load;
