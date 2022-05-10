'use strict';
/* eslint no-process-env: "off" */

const defaults = {
  appName: process.env.APP_NAME || 'HOF Application',
  htmlLang: 'en',
  root: process.cwd(),
  translations: 'translations',
  start: true,
  csp: {
    disabled: process.env.DISABLE_CSP === 'true'
  },
  getCookies: true,
  getTerms: true,
  getAccessibility: false,
  viewEngine: 'html',
  protocol: process.env.PROTOCOL || 'http',
  noCache: process.env.NO_CACHE || false,
  host: process.env.HOST || '0.0.0.0',
  port: process.env.PORT || '8080',
  env: process.env.NODE_ENV || 'development',
  gaTagId: process.env.GA_TAG,
  ga4TagId: process.env.GA_4_TAG,
  gaCrossDomainTrackingTagId: process.env.GDS_CROSS_DOMAIN_GA_TAG,
  loglevel: process.env.LOG_LEVEL || 'info',
  ignoreMiddlewareLogs: ['/healthz'],
  redis: {
    port: process.env.REDIS_PORT || '6379',
    host: process.env.REDIS_HOST || '127.0.0.1'
  },
  session: {
    ttl: process.env.SESSION_TTL || 1800,
    secret: process.env.SESSION_SECRET || 'changethis',
    name: process.env.SESSION_NAME || 'hod.sid',
    sanitiseInputs: false
  },
  apis: {
    pdfConverter: process.env.PDF_CONVERTER_URL
  },
  serveStatic: process.env.SERVE_STATIC_FILES !== 'false'
};

module.exports = defaults;
