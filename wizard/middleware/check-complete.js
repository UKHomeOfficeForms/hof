'use strict';

const constants = require('../util/constants');
const path = require('path');

module.exports = (route, controller, steps, start) => (req, res, next) => {
  if (req.sessionModel.get(constants.APPLICATION_COMPLETE) && !controller.options.allowPostComplete) {
    req.sessionModel.reset();
    res.redirect(path.join(req.baseUrl, start));
    return;
  }
  next();
};
