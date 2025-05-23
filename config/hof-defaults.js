'use strict';
/* eslint no-process-env: "off" */
const rateLimits = require('./rate-limits');
const Helper = require('../utilities/helpers');
const parseBoolean = Helper.getEnvBoolean;

const defaults = {
  appName: process.env.APP_NAME || 'HOF Application',
  htmlLang: 'en',
  root: process.cwd(),
  translations: 'translations',
  start: true,
  csp: {
    disabled: parseBoolean(process.env.DISABLE_CSP, false, 'DISABLE_CSP')
  },
  getCookies: parseBoolean(process.env.GET_COOKIES, true, 'GET_COOKIES'),
  getTerms: parseBoolean(process.env.GET_TERMS, true, 'GET_TERMS'),
  getAccessibility: parseBoolean(process.env.GET_ACCESSIBILITY, false, 'GET_ACCESSIBILITY'),
  sessionTimeoutWarningContent: parseBoolean(process.env.SESSION_TIMEOUT_WARNING_CONTENT, false, 'SESSION_TIMEOUT_WARNING_CONTENT'),
  exitFormContent: parseBoolean(process.env.EXIT_FORM_CONTENT, false, 'EXIT_FORM_CONTENT'),
  saveExitFormContent: parseBoolean(process.env.SAVE_EXIT_FORM_CONTENT, false, 'SAVE_EXIT_FORM_CONTENT'),
  viewEngine: 'html',
  protocol: process.env.PROTOCOL || 'http',
  noCache: process.env.NO_CACHE || false,
  host: process.env.HOST || '0.0.0.0',
  port: process.env.PORT || '8080',
  env: process.env.NODE_ENV || 'development',
  gaTagId: process.env.GA_TAG || 'Test-GA-Tag',
  ga4TagId: process.env.GA_4_TAG,
  // added to allow support for multiple HOF forms using GTM to customize how they track page views
  gtm: {
    tagId: process.env.GTM_TAG || false,
    config: {},
    composePageName: function (page, convertPage) {
      return convertPage(page);
    }
  },
  deIndexForm: process.env.DEINDEX_FORM || 'false',
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
  serveStatic: parseBoolean(process.env.SERVE_STATIC_FILES, true, 'SERVE_STATIC_FILES'),
  sessionTimeOutWarning: process.env.SESSION_TIMEOUT_WARNING || 300,
  serviceUnavailable: parseBoolean(process.env.SERVICE_UNAVAILABLE, false, 'SERVICE_UNAVAILABLE')
};

module.exports = Object.assign({}, defaults, rateLimits);
