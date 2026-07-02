'use strict';

const Model = require('../model');
const unsafeSessionModelKeys = new Set(['__proto__', 'prototype', 'constructor']);

module.exports = class SessionModel extends Model {
  constructor(props, options) {
    const session = options.session;
    const key = options.key;

    if (!key || typeof key !== 'string') {
      throw new Error('session-model - key must be defined');
    }

    if (unsafeSessionModelKeys.has(key)) {
      throw new Error('session-model - key must not be __proto__, prototype, or constructor');
    }

    session[key] = session[key] || {};

    // include session values on initialized attributes
    const attrs = Object.assign({}, session[key], props);

    super(attrs, options);

    // write changes back to the session
    this.on('change', changes => {
      Object.assign(session[key], changes);
    });
    this.on('reset', () => {
      session[key] = {};
    });
  }
};
