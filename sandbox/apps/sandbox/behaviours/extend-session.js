'use strict';

module.exports = SuperClass => class extends SuperClass {
  getValues(req, res, next) {
    // eslint-disable-next-line no-console
    console.log(req.sessionModel);
    next();
  }
};
