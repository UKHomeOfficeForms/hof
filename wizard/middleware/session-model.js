'use strict';

const Model = require('../model');

module.exports = options => (req, res, next) => {
  req.sessionModel = new Model({}, {
    session: req.session,
    key: options.name
  });
  next();
};
