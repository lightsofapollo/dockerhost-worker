var base = require('taskcluster-base');
var co = require('co');

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
  description: 'Authenticate with taskcluster and return docker credentials.'
}, co(function(req, res) {
  console.log(req);
}));

module.exports = api;
