/**
Return the appropriate configuration defaults when on aws.
*/

function* configure (baseUrl) {
  // defaults per the metadata
  return yield {
    // Since this is aws configuration after all...
    provisionerId: 'aws-provisioner',
    workerId: 'local',
    workerType: 'local',
    workerGroup: 'local',
    workerNodeType: 'local'
  };
};

module.exports = configure;
