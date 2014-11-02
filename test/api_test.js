suite('api', function() {
  var assert      = require('assert');
  var helper      = require('./helper');
  var subject     = helper.setup();
  var co          = require('co');
  var fs          = require('fs');

  test('purges file on start', function() {
    assert.ok(fs.existsSync(__dirname + '/_config.json'));
  });

  test('authenticate', co(function* () {
    var auth = yield subject.client.authenticate();
    assert.deepEqual(auth, {
      cacert: 'ca.pem\n',
      cert: 'cert.pem\n',
      key: 'key.pem\n',
    });
  }));
});
