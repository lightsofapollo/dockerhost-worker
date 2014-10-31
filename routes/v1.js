var base = require('taskcluster-base');
var co = require('co');
var fs = require('co-fs');
var path = require('path');

var SCHEMA_PREFIX_CONST =
  'http://schemas.taskcluster.net/dockerhost-worker/v1/';

var api = new base.API({
  title: 'Queue API Documentation',
  description: [
    'The dockerhost server only runs on a single node and deals with auth',
    'and the actual proxy work that ensures we expose the underlying docker',
    'interface to only known good clients'
  ].join('\n')
});

api.declare({
  method: 'post',
  route: '/authenticate',
  name: 'authenticate',
  idempotent: true,
  scopes: ['dockerhost:authenticate'],
  title: 'Get docker credentials',
  description: 'Authenticate with taskcluster and return docker credentials.',
  output: SCHEMA_PREFIX_CONST + 'authenticate-response.json#'
}, co(function* (req, res) {
  var keysPath = this.cfg.get('worker:keysPath');
  if (!(yield fs.exists(keysPath))) {
    return res.status(500).json({
      message: 'Mis-configured keys path!'
    });
  }

  // Note these paths come directly from: https://docs.docker.com/articles/https/
  var result = yield {
    cacert: fs.readFile(path.join(keysPath, 'ca.pem'), 'utf8'),
    cert: fs.readFile(path.join(keysPath, 'cert.pem'), 'utf8'),
    key: fs.readFile(path.join(keysPath, 'key.pem'), 'utf8'),
  }

  res.reply(result);
}));

module.exports = api;
