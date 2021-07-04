'use strict';

module.exports = class ValidationError {
  constructor(key, opts) {
    const options = Object.assign({
      type: 'default',
      arguments: []
    }, opts);
    this.key = key;
    this.type = options.type;
    this.redirect = options.redirect;
    this.arguments = options.arguments.filter(a => a);
  }
};
