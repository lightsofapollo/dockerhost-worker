#!/usr/bin/env node
var debug = require('debug')('dockerhost:bin:server');
var base = require('taskcluster-base');
var path = require('path');
var v1 = require('../routes/v1');
var Worker = require('../lib/worker');
var co = require('co')
var loadConfig = require('../lib/config');

var Auth = require('taskcluster-client').Auth;

/** Launch server */
function* launch (profile) {
  debug("Launching with profile: %s", profile);
  var config = yield loadConfig(profile);

  var statsDrain;
  if (config.influx.connectionString) {
    statsDrain = new base.stats.Influx({
      connectionString:   config.influx.connectionString,
      maxDelay:           config.influx.maxDelay,
      maxPendingPoints:   config.influx.maxPendingPoints
    });
  } else {
    statsDrain = new base.stats.NullDrain();
  }

  // Start monitoring the process
  base.stats.startProcessUsageReporting({
    drain:      statsDrain,
    component:  config.worker.statsComponent,
    process:    'server'
  });


  // While I want a schema there is no reason to publish this.
  var validator = yield base.validator({
    folder: path.join(__dirname, '..', 'schemas'),
    constants: require('../schemas/constants'),
    publish: false,
    schemaPrefix: 'dockerhost/v1/'
  });

  // Create API router and publish reference if needed
  var routerOpts = {
    context:          config,
    validator:        validator,
    credentials:      config.taskcluster.credentials,
    baseUrl:          config.server.baseUrl,
    publish:          false,
    referencePrefix:  'dockerhost/v1/api.json',
    component:        config.worker.statsComponent,
    drain:            statsDrain
  };

  var router = yield v1.setup(routerOpts);
  var reference = v1.reference(routerOpts);

  // Create app
  var app = base.app({
    port:           Number(process.env.PORT || config.server.port),
    env:            config.server.env,
    forceSSL:       false,
    trustProxy:     true
  });

  // Mount API router
  app.use('/v1', router);
  app.get('/v1/api.json', function(req, res) {
    res.send(reference);
  });

  var worker = new Worker(config);

  yield app.createServer();
  yield worker.launch();
};

co(function* () {
  // Find configuration profile
  var profile = process.argv[2];
  if (!profile) {
    console.log("Usage: server.js [profile]")
    console.error("ERROR: No configuration profile is provided");
  }
  // Launch with given profile
  yield launch(profile);
  debug("Launched server successfully");
})(function(err) {
  if (err) {
    throw err;
  }
});
