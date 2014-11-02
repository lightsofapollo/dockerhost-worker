module.exports = {
  worker: {
    host: 'test',
    keysPath: __dirname + '/../test/keys',
    createQueue: false
  },

  // For testing purge the config file..
  purge: {
    enabled: true,
    files: [__dirname + '/../test/_config.json']
  }
};
