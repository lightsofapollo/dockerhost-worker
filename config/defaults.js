module.exports = {

  server: {
    env: 'development',
    port: 60023,
    baseUrl: 'http://localhost:60023/v1'
  },

  taskcluster: {
    credentials: {
      clientId: process.env.TASKCLUSTER_CLIENT_ID,
      accessToken: process.env.TASKCLUSTER_ACCESS_TOKEN,
    },
  },

  worker: {
    statsComponent: 'dockerhost',
    // Path to the SSL related keys.
    keysPath: undefined
  },

  influx: {
    connectionString: undefined,
    maxDelay: 5 * 60,
    maxPendingPoints: 250
  }
};
