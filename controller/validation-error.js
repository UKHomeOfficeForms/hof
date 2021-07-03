'use strict';

module.exports = class ValidationError {
  constructor(key, options) {
    options = Object.assign({
      type: 'default',
      arguments: []
    }, options);
    this.key = key;
    this.type = options.type;
    this.redirect = options.redirect;
    this.arguments = options.arguments.filter(a => a);
  }
};
