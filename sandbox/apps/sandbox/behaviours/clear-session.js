'use strict';

module.exports = SuperClass => class extends SuperClass {
  getValues(req, res, next) {
    req.sessionModel.reset();
    this.successHandler(req, res, next);
  }
};
