'use strict';
/* eslint no-process-env: "off" */

const defaults = {
  appName: process.env.APP_NAME || 'HOF Application',
  root: process.cwd(),
  translations: 'translations',
  start: true,
  csp: {
    disabled: process.env.DISABLE_CSP === 'true'
  },
  getCookies: true,
  getTerms: true,
  viewEngine: 'html',
  protocol: process.env.PROTOCOL || 'http',
  host: process.env.HOST || '0.0.0.0',
  port: process.env.PORT || '8080',
  env: process.env.NODE_ENV || 'development',
  gaTagId: process.env.GA_TAG,
  loglevel: process.env.LOG_LEVEL || 'info',
  redis: {
    port: process.env.REDIS_PORT || '6379',
    host: process.env.REDIS_HOST || '127.0.0.1'
  },
  session: {
    ttl: process.env.SESSION_TTL || 1800,
    secret: process.env.SESSION_SECRET || 'changethis',
    name: process.env.SESSION_NAME || 'hod.sid'
  },
  serveStatic: process.env.SERVE_STATIC_FILES !== 'false'
};

module.exports = defaults;
