var base = require('taskcluster-base');
var Auth = require('taskcluster-client').Auth;
var Queue = require('taskcluster-client').Queue;
var format = require('util').format;
var _ = require('lodash');

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

  // Note how here we restrict scopes this is not enough you also need to use a
  // client with a minimal set of scopes but we use this method to ensure that
  // the scopes we _think_ we need are enough and this can be used as a
  // reference when creating new clients.

  config.auth = new Auth(_.defaults({}, config.taskcluster, {
    authorizedScopes: [
      'auth:inspect'
    ]
  }));

  config.queue = new Queue(_.defaults({}, config.taskcluster, {
    authorizedScopes: [
      'queue:create-artifact:public/api.json',
      'queue:claim-task',
      'queue:resolve-task',
      'queue:report-task-completed',
      format(
        'assume:worker-type:%s/%s', config.provisionerId, config.workerType
      ),
      format(
        'assume:worker-id:%s/%s', config.workerGroup, config.workerId
      )
    ]
  }));

  // Base url for the client specifically for this server.
  config.server.baseUrl = format(
    'http://%s:%d/v1',
    config.host,
    config.server.port
  );

  return config;
}

module.exports = load;
