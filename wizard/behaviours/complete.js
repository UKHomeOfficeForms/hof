'use strict';

const constants = require('../util/constants');

module.exports = superclass => class extends superclass {
  constructor(options) {
    super(options);
    if (options.next && options.steps && options.steps[options.next]) {
      const nextOptions = options.steps[options.next];
      if (typeof nextOptions.allowPostComplete === 'undefined') {
        nextOptions.allowPostComplete = true;
      }
    }
  }

  successHandler(req, res, callback) {
    req.sessionModel.set(constants.APPLICATION_COMPLETE, true);
    super.successHandler(req, res, callback);
  }
};
