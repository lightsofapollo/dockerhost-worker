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

  /**
  We make a modest effort to sensitive purge files after booting. Note this is
  not actually sure more a reminder that if this pans out we should actually use
  shred and be more careful about how things are provisioned.
  */
  purge: {
    enabled: false,
    files: []
  },

  worker: {
    host: 'local',
    statsComponent: 'dockerhost',
    // Path to the SSL related keys.
    keysPath: undefined,
    createQueue: true,
    purgeConfig: false
  },

  influx: {
    connectionString: undefined,
    maxDelay: 5 * 60,
    maxPendingPoints: 250
  }
};
