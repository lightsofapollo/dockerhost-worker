var co = require('co');
var taskcluster = require('taskcluster-client');
var request = require('superagent-promise');

co(function* () {

  var body = (yield request.get('http://localhost:60023/v1/api.json').end()).body;
  console.log(body);
  var Client = taskcluster.createClient(body);
  var client = new Client();

  var content = yield client.authenticate();
  console.log(content, '<<!');

})(function(err) {
  if (err) throw err;
});
