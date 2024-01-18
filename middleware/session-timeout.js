'use strict';

const URI = require('urijs');

module.exports = (options, timers) => {
  return (req, res, next) => {
    // eslint-disable-next-line no-console
    console.log(req.url);
    console.log('SESSION TIMOUT:', options.session);
    if (timers.length >= 2) {
      // eslint-disable-next-line no-console
      console.log(timers);
      for (const t of timers) {
        clearTimeout(t);
      }
    }
    timers.push(setTimeout(() => {
      // eslint-disable-next-line no-console,no-alert
      console.log(req.originalUrl);
      const err = new Error('Session will expire soon');
      err.code = 'SESSION_TIMEOUT_WARNING';
      return next(err);
    }, 1000 * 10));
    next();
  };
};
