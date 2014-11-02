/**
Return the appropriate configuration defaults when on aws.
*/

var request = require('superagent-promise');
var debug = require('debug')('dockerhost-worker:configuration:aws');

/**
AWS Metadata service endpoint.

@const
@see http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AESDG-chapter-instancedata.html
*/
var BASE_URL = 'http://169.254.169.254/2012-01-12';

function* getText(url) {
  var res = yield request.get(url).end();
  return res.text;
}

/**
Read AWS metadata and user-data to build a configuration for the worker.

@param {String} [baseUrl] optional base url override (for tests).
@return {Object} configuration values.
*/
function* configure (baseUrl) {
  baseUrl = baseUrl || BASE_URL;

  // defaults per the metadata
  var config = yield {
    host: getText(baseUrl + '/meta-data/public-hostname'),
    // Since this is aws configuration after all...
    provisionerId: 'aws-provisioner',
    workerId: getText(baseUrl + '/meta-data/instance-id'),
    workerType: getText(baseUrl + '/meta-data/ami-id'),
    workerGroup: getText(baseUrl + '/meta-data/placement/availability-zone'),
    workerNodeType: getText(baseUrl + '/meta-data/instance-type')
  };


  // query the user data for any instance specific overrides set by the
  // provisioner.
  var userdata = yield request.get(baseUrl + '/user-data').
    // Buffer entire response into the .text field of the response.
    buffer(true).
    // Issue the request...
    end();

  if (!userdata.ok || !userdata.text) {
    return config;
  }
  // parse out overrides from user data
  var overrides = JSON.parse(userdata.text);
  for (var key in overrides) config[key] = overrides[key];

  return config;
};

module.exports = configure;
