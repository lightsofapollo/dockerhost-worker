module.exports = {

  /** Config normally fetched from AWS */
  host: 'localhost',
  provisionerId: undefined,
  workerType: undefined,
  workerGroup: undefined,
  workerNodeType: undefined,

  server: {
    env: 'development',
    port: 60023
  },

  pulse: {
    credentials: {
      username: process.env.PULSE_USERNAME,
      password: process.env.PULSE_PASSWORD
    }
  },

  taskcluster: {
    credentials: {
      clientId: process.env.TASKCLUSTER_CLIENT_ID,
      accessToken: process.env.TASKCLUSTER_ACCESS_TOKEN,
    },
  },

  worker: {
    host: 'local',
    statsComponent: 'dockerhost',
    // Path to the SSL related keys.
    keysPath: undefined,
    createQueue: true,
  },

  influx: {
    connectionString: undefined,
    maxDelay: 5 * 60,
    maxPendingPoints: 250
  }
};
