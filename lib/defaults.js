'use strict';

const hof = require('hof');

/* eslint no-process-env:0 */
let caller = process.env.NODE_ENV === 'test' ? 'test/integration/fixtures' : module.parent.filename;

module.exports = {
  commonFields: false,
  caller: caller,
  startOnInitialise: true,
  getCookies: true,
  getTerms: true,
  fields: 'fields',
  translations: 'translations/__lng__/__ns__.json',
  baseController: hof.controllers.base,
  logger: require('hof').logger,
  errorHandler: require('hof').middleware.errors,
  protocol: process.env.PROTOCOL || 'http',
  host: process.env.HOST || 'localhost',
  port: process.env.PORT || '8080',
  env: process.env.NODE_ENV || 'development',
  redis: {
    port: process.env.REDIS_PORT || '6379',
    host: process.env.REDIS_HOST || '127.0.0.1'
  },
  session: {
    ttl: process.env.SESSION_TTL || 1800,
    secret: process.env.SESSION_SECRET || 'changethis'
  }
};
