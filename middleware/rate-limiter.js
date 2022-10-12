
const moment = require('moment');
const redis = require('redis');
const config = require('./../config/hof-defaults');

module.exports = (options, rateLimitType) => {
  // eslint-disable-next-line no-console
  const logger = options.logger || { log: (func, msg) => console[func](msg) };
  const rateLimits = options.rateLimits[rateLimitType];
  const timestampName = `${rateLimitType}TimeStamp`;
  const countName = `${rateLimitType}Count`;

  const WINDOW_SIZE_IN_MINUTES = rateLimits.windowSizeInMinutes;
  const MAX_WINDOW_REQUEST_COUNT = rateLimits.maxWindowRequestCount;
  const WINDOW_LOG_INTERVAL_IN_MINUTES = rateLimits.windowLogIntervalInMinutes;
  const ERROR_CODE = rateLimits.errCode;

  return async (req, res, next) => {
    const redisClient = redis.createClient(config.redis);

    // check that redis client exists
    if (!redisClient) {
      logger.log('error', 'Redis client does not exist!');
      return next();
    }

    const closeConnection = async err => {
      await redisClient.v4.QUIT();
      return next(err);
    };
    redisClient.on('error', err => logger.log('error', err));
    await redisClient.connect();

    try {
      // fetch records of current user using IP address, returns null when no record is found
      return await redisClient.get(req.ip, async (err, record) => {
        if (err) {
          logger.log('error', `Error with requesting redis session for rate limiting: ${err}`);
          return await closeConnection();
        }
        const currentRequestTime = moment();
        const windowStartTimestamp = moment().subtract(WINDOW_SIZE_IN_MINUTES, 'minutes').unix();
        let oldRecord = false;
        let data;
        //  if no record is found , create a new record for user and store to redis
        if (record) {
          data = JSON.parse(record);
          oldRecord = data[data.length - 1][timestampName] < windowStartTimestamp;
        }

        if (!record || oldRecord) {
          const newRecord = [];
          const requestLog = {
            [timestampName]: currentRequestTime.unix(),
            [countName]: 1
          };
          newRecord.push(requestLog);
          await redisClient.set(req.ip, JSON.stringify(newRecord));
          return await closeConnection();
        }
        // if record is found, parse it's value and calculate number of requests users has made within the last window
        const requestsWithinWindow = data.filter(entry => entry[timestampName] > windowStartTimestamp);

        const totalWindowRequestsCount = requestsWithinWindow.reduce((accumulator, entry) => {
          return accumulator + entry[countName];
        }, 0);

        if (!options.rateLimits.env || options.rateLimits.env === 'development') {
          const requestsRemaining = MAX_WINDOW_REQUEST_COUNT - totalWindowRequestsCount;
          const msg = `Requests made by client: ${totalWindowRequestsCount}\nRequests remaining: ${requestsRemaining}`;
          logger.log('info', msg);
        }
        // if number of requests made is greater than or equal to the desired maximum, return error
        if (totalWindowRequestsCount >= MAX_WINDOW_REQUEST_COUNT) {
          return await closeConnection({ code: ERROR_CODE });
        }
        // if number of requests made is less than allowed maximum, log new entry
        const lastRequestLog = data[data.length - 1];
        const potentialCurrentWindowIntervalStartTimeStamp = currentRequestTime
          .subtract(WINDOW_LOG_INTERVAL_IN_MINUTES, 'minutes')
          .unix();
        //  if interval has not passed since last request log, increment counter
        if (lastRequestLog[timestampName] > potentialCurrentWindowIntervalStartTimeStamp) {
          lastRequestLog[countName]++;
          data[data.length - 1] = lastRequestLog;
        } else {
          //  if interval has passed, log new entry for current user and timestamp
          data.push({
            [timestampName]: currentRequestTime.unix(),
            [countName]: 1
          });
        }
        await redisClient.set(req.ip, JSON.stringify(data));
        return await closeConnection();
      });
    } catch (err) {
      return await closeConnection(err);
    }
  };
};
