/**
Return the appropriate configuration defaults when on aws.
*/

var fs = require('fs');

function* configure (baseUrl) {
  return require(__dirname + '/../../test/_config.json');
};

module.exports = configure;

