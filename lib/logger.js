'use strict';

const winston = require('winston');
const { createLogger, format, transports } = winston;
const { combine, timestamp, colorize, simple, json } = format;
const util = require('util');

module.exports = config => {
  const loggingTransports = [];
  const exceptionTransports = [];
  const notProd = config.env !== 'production';
  const isLocal = notProd && config.env !== 'development';

  loggingTransports.push(
    new transports.Console({
      format: isLocal ? combine(
        colorize(),
        simple()
      ) : json(),
      silent: config.loglevel === 'silent' || config.env === 'test',
      level: config.loglevel || 'info'
    })
  );

  exceptionTransports.push(
    new transports.Console({
      format: isLocal ? combine(
        colorize(),
        simple()
      ) : json()
    })
  );

  const loggerConfig = {
    format: combine(
      timestamp()
    ),
    exitOnError: false,
    transports: loggingTransports,
    exceptionHandlers: exceptionTransports
  };

  if (notProd) {
    delete loggerConfig.exceptionHandlers;
  }

  const logger = createLogger(loggerConfig);

  logger.stream = {
    write: message => {
      if (config.loglevel === 'debug') {
        logger.debug(message);
      } else {
        logger.info(message);
      }
    }
  };

  logger.logSession = id => (level, ...args) => {
    const msg = util.format(...args);
    return logger.log(level, `sessionId=${id} ${msg}`);
  };

  return logger;
};
