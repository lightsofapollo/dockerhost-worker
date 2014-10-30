var url = require('url');

function parseUri(env) {
  var value = process.env[env];
  if (!value) return {};

  // Parse the url if available...
  value = url.parse(value);

  var userPass = value.auth && value.auth.split(':');
  if (userPass) {
    value.username = userPass[0];
    value.password = userPass[1];
  }

  if (value.pathname && value.pathname.length) {
    value.database = value.pathname.slice(1);
  }

  return value;
}

/**
To deploy the worker we need a number of "variables" which are used to construct
various config files. This contains the list of all variables used in the deploy
process with their description and default values... This is used in the
interactive mode of the deploy process...
*/
module.exports = {
  'debug.level': {
    description: 'Debug level for worker (see debug npm module)',
    value: '*'
  },

  'taskcluster.clientId': {
    description: 'Taskcluster client id',
    value: process.env.TASKCLUSTER_CLIENT_ID
  },

  'taskcluster.accessToken': {
    description: 'Taskcluster access token',
    value: process.env.TASKCLUSTER_ACCESS_TOKEN
  },

  'papertrail': {
    description: 'Papertrail host + port'
  },

  'influxdb': {
    description: 'influx db connection string'
  },

  'pulse.username': {
    description: 'Pulse username (see https://pulse.mozilla.org/profile)',
    value: process.env.PULSE_USERNAME
  },

  'pulse.password': {
    description: 'Pulse password (see https://pulse.mozilla.org/profile)',
    value: process.env.PULSE_PASSWORD
  }
};
