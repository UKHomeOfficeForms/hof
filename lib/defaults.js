'use strict';

const controllers = require('hof-controllers');
const path = require('path');

const testPath = path.resolve(__dirname, '../test/');
const realPath = path.dirname(module.parent.parent.filename);
/* eslint no-process-env: "off" */
const caller = process.env.NODE_ENV === 'test' ? testPath : realPath;

const defaults = {
  translations: 'translations',
  caller: caller,
  start: true,
  getCookies: true,
  getTerms: true,
  viewEngine: 'html',
  baseController: controllers.base,
  protocol: process.env.PROTOCOL || 'http',
  host: process.env.HOST || '0.0.0.0',
  port: process.env.PORT || '8080',
  env: process.env.NODE_ENV || 'development',
  gaTagId: process.env.GA_TAG,
  redis: {
    port: process.env.REDIS_PORT || '6379',
    host: process.env.REDIS_HOST || '127.0.0.1'
  },
  session: {
    ttl: process.env.SESSION_TTL || 1800,
    secret: process.env.SESSION_SECRET || 'changethis',
    name: process.env.SESSION_NAME || 'hod.sid'
  }
};

module.exports = defaults;
