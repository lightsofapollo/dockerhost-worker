suite('worker', function() {
  var assert = require('assert');
  var helper = require('./helper');
  var co = require('co');
  var slugid = require('slugid');
  var queueEvents = new (require('taskcluster-client').QueueEvents)();
  var waitForEvent = require('../lib/wait_for_event');

  // Worker conf is the workerType, etc.. set for this specific worker.
  var workerConf = {
    workerType: slugid.v4(),
    workerId: slugid.v4(),
    workerGroup: slugid.v4(),
    provisionerId: 'localtesting'
  };

  var subject = helper.setup(workerConf);

  var created = new Date();
  var deadline = new Date(created.valueOf() + 3600 * 1000);

  var task = {
    provisionerId:    workerConf.provisionerId,
    workerType:       workerConf.workerType,
    schedulerId:      'my-scheduler',
    taskGroupId:      slugid.v4(),
    created:          created.toJSON(),
    deadline:         deadline.toJSON(),
    payload:          {},
    metadata: {
      name:           'Unit testing task',
      description:    'Task created during unit tests',
      owner:          'jlal@mozilla.com',
      source:         'https://github.com/lightsofapollo/dockerhost-worker'
    }
  }

  setup(co(function* () {
    // We only really care about task completed here...
    yield subject.listener.bind(queueEvents.taskCompleted({
      workerId: workerConf.workerId
    }));
    yield subject.listener.resume();
  }));

  teardown(co(function* () {
    yield subject.listener.close();
  }));

  test('request a worker', co(function* () {
    var taskId = slugid.v4();
    yield [
      subject.queue.createTask(taskId, task),
      waitForEvent(subject.listener, 'message')
    ];

    var artifact =
      yield subject.queue.getLatestArtifact(taskId, 'public/api.json');

    assert.ok(artifact.version, 'is client schema');
  }));
});

