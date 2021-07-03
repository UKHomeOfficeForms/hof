'use strict';

const deprecate = require('deprecate');

module.exports = (superclass) => class DeprecatedError extends superclass {
  constructor(options) {
    deprecate('this.Error is deprecated in favour of this.ValidationError');
    super(options);
  }
};
