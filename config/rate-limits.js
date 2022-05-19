
module.exports = {
  rateLimits: {
    env: process.env.NODE_ENV,
    requests: {
      active: false,
      windowSizeInMinutes: 5,
      maxWindowRequestCount: 100,
      windowLogIntervalInMinutes: 1,
      errCode: 'DDOS_RATE_LIMIT'
    },
    submissions: {
      active: false,
      windowSizeInMinutes: 10,
      maxWindowRequestCount: 1,
      windowLogIntervalInMinutes: 1,
      errCode: 'SUBMISSION_RATE_LIMIT'
    }
  }
};
