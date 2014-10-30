module.exports = {

  server: {
    env: 'development',
    port: 60023,
    baseUrl: 'http://localhost'
  },

  taskcluster: {
    credentials: {
      clientId: process.env.TASKCLUSTER_CLIENT_ID,
      accessToken: process.env.TASKCLUSTER_ACCESS_TOKEN,
    },
  },

  worker: {
    statsComponent: 'dockerhost'
  },

  influx: {
    connectionString: undefined,
    maxDelay: 5 * 60,
    maxPendingPoints: 250
  }
};
