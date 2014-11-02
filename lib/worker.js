var assert = require('assert');
var taskcluster = require('taskcluster-client');
var format = require('util').format;
var debug = require('debug')('dockerhost:worker');
var co = require('co');

var QUEUE_PREFIX = 'worker/v1/';

function Worker(runtime) {
  this.runtime = runtime;
  this.listener = null;
}

Worker.prototype = {

  /**
  Begin listening for tasks over amqp/pulse.
  */
  launch: function* () {
    var queueEvents = new taskcluster.QueueEvents();

    var queueName;
    if (this.runtime.worker.createQueue) {
      queueName = format(
        '%s/%s/%s',
        QUEUE_PREFIX,
        this.runtime.provisionerId,
        this.runtime.workerType
      );
    }

    var listener = new taskcluster.PulseListener({
      queueName: queueName,
      credentials: this.runtime.pulse.credentials,
      // Since we only intend to serve one request ever we _must_ only have a
      // prefetch of one.
      prefetch: 1,
    });

    yield listener.bind(queueEvents.taskPending({
      workerType: this.runtime.workerType,
      provisionerId: this.runtime.provisionerId
    }));

    debug('bind task pending', {
      workerType: this.runtime.workerType,
      provisionerId: this.runtime.provisionerId
    });

    debug('listen', {
      queueName: listener._queueName, capacity: this.runtime.capacity
    });

    var channel = yield listener.connect();

    // Rather then use `.consume` on the listener directly we use the channel
    // directly for greater control over the flow of messages.
    yield channel.consume(listener._queueName, co(function* (msg) {
      debug('consume message');
      var content;
      try {
        // All content from taskcluster should be a json payload.
        content = JSON.parse(msg.content);
        yield this.handleMessage(content);
        channel.ack(msg);
        // All we need to do is let clients know where we are then stop
        // listening for new tasks. This is so each user gets one dockerhost.
        yield listener.close();
      } catch (e) {
        if (content) {
          debug('task error', {
            taskId: content.status.taskId,
            runId: content.runId,
            message: e.toString(),
            stack: e.stack,
            err: e
          });
        } else {
          debug('task error', {
            message: e.toString(),
            err: e
          });
        }
        channel.nack(msg);
      }
    }).bind(this));
  },

  /**
  Handle pending task message.
  */
  handleMessage: function* (payload) {
    // Current task status.
    var runId = payload.runId;
    var status = payload.status;
    var taskId = status.taskId;

    var task = yield this.runtime.queue.getTask(taskId);

    console.log(this.runtime.workerGroup, this.runtime.workerId);

    yield this.runtime.queue.claimTask(taskId, runId, {
      workerGroup: this.runtime.workerGroup,
      workerId: this.runtime.workerId
    });

    // Clients do not know which node we are on so create a task with a url
    // pointing to this server's client reference.
    yield this.runtime.queue.createArtifact(taskId, runId, 'public/api.json', {
      storageType: 'reference',
      contentType: 'application/json',
      url: this.runtime.server.baseUrl + '/api.json',
      expires: task.deadline
    });

    yield this.runtime.queue.reportCompleted(taskId, runId, {
      success: true
    });
  }
};

module.exports = Worker;
