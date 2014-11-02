var path        = require('path');
var base        = require('taskcluster-base');
var taskcluster = require('taskcluster-client');
var co          = require('co');
var request     = require('superagent-promise');
var fs          = require('fs');

// Test configuration that the worker loads (note this prevents parallel
// testing!).
var TEST_CONFIG = __dirname + '/_config.json';

// Load configuration
var cfg = base.config({
  defaults:     require('../config/defaults'),
  profile:      require('../config/test'),
  filename:     'dockerhost-worker'
});

function setConfig(config) {
  return fs.writeFileSync(TEST_CONFIG, JSON.stringify(config));
}

/** Setup testing */
exports.setup = function(options) {
  options = options || {};
  var subject = {};

  // Configure server
  var server = new base.testing.LocalApp({
    command:      path.join(__dirname, '..', 'bin', 'server.js'),
    args:         ['test'],
    name:         'server.js',
    baseUrlPath:  '/v1'
  });

  // Setup server
  setup(co(function* () {
    setConfig(options);
    var baseUrl = yield server.launch();
    var reference = (yield request.get(baseUrl + '/api.json').end()).body;

    // Create client for working with API
    subject.baseUrl = baseUrl;
    var Client = taskcluster.createClient(reference);
    subject.client = new Client({
      baseUrl: baseUrl,
      credentials: cfg.get('taskcluster:credentials')
    });

    subject.listener = new taskcluster.PulseListener(cfg.get('pulse'));
    subject.queue = new taskcluster.Queue(cfg.get('taskcluster'));
  }));

  // Shutdown server
  teardown(function() {
    if (fs.existsSync(TEST_CONFIG)) {
      fs.unlinkSync(TEST_CONFIG);
    }

    // Kill server
    return server.terminate();
  });

  return subject;
};
