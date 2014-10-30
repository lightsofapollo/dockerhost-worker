#!/usr/bin/env node
var debug = require('debug')('dockerhost:bin:server');
var base = require('taskcluster-base');
var path = require('path');
var v1 = require('../routes/v1');
var co = require('co')

var Auth = require('taskcluster-client').Auth;

/** Launch server */
function* launch (profile) {
  debug("Launching with profile: %s", profile);

  // Load configuration
  var cfg = base.config({
    defaults:     require('../config/defaults'),
    profile:      require('../config/' + profile),
    envs: [],
    filename:     'dockerhost'
  });


  var statsDrain;
  if (cfg.get('influx:connectionString')) {
    statsDrain = new base.stats.Influx({
      connectionString:   cfg.get('influx:connectionString'),
      maxDelay:           cfg.get('influx:maxDelay'),
      maxPendingPoints:   cfg.get('influx:maxPendingPoints')
    });
  } else {
    statsDrain = new base.stats.NullDrain();
  }

  // Start monitoring the process
  base.stats.startProcessUsageReporting({
    drain:      statsDrain,
    component:  cfg.get('worker:statsComponent'),
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
    context: {
      auth: new Auth(cfg.get('taskcluster')),
      cfg: cfg
    },
    validator:        validator,
    credentials:      cfg.get('taskcluster:credentials'),
    baseUrl:          cfg.get('server:baseUrl'),
    publish:          false,
    referencePrefix:  'dockerhost/v1/api.json',
    component:        cfg.get('worker:statsComponent'),
    drain:            statsDrain
  };

  var router = yield v1.setup(routerOpts);
  var reference = v1.reference(routerOpts);

  // Create app
  var app = base.app({
    port:           Number(process.env.PORT || cfg.get('server:port')),
    env:            cfg.get('server:env'),
    forceSSL:       false,
    trustProxy:     true
  });

  // Mount API router
  app.use('/v1', router);
  app.get('/v1/api.json', function(req, res) {
    res.send(reference);
  });

  // Create server
  return yield app.createServer();
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
