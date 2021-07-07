'use strict';

module.exports = (req, res, next) => {
  if (typeof req.session === 'undefined') {
    throw new Error('Session is undefined');
  } else {
    next();
  }
};
