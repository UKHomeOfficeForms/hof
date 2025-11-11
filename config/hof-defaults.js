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
  getCookies: true,
  getTerms: true,
  getAccessibility: false,
  sessionTimeoutWarningContent: false,
  exitFormContent: false,
  saveExitFormContent: false,
  viewEngine: 'html',
  protocol: process.env.PROTOCOL || 'http',
  noCache: process.env.NO_CACHE || false,
  host: process.env.HOST || '0.0.0.0',
  port: process.env.PORT || '8080',
  env: process.env.NODE_ENV || 'development',
  gaTagId: process.env.GA_TAG,
  ga4TagId: process.env.GA_4_TAG,
  showCookiesBanner: parseBoolean(
    process.env.SHOW_COOKIES_BANNER,
    Boolean(process.env.GA_TAG || process.env.GA_4_TAG),
    'SHOW_COOKIES_BANNER'
  ),
  hasGoogleAnalytics: Boolean(process.env.GA_TAG || process.env.GA_4_TAG),
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
  serveStatic: process.env.SERVE_STATIC_FILES !== 'false',
  useCustomSessionTimeout: parseBoolean(process.env.USE_CUSTOM_SESSION_TIMEOUT, false, 'USE_CUSTOM_SESSION_TIMEOUT'),
  sessionTimeOutWarning: process.env.SESSION_TIMEOUT_WARNING || 300,
  serviceUnavailable: parseBoolean(process.env.SERVICE_UNAVAILABLE, false, 'SERVICE_UNAVAILABLE')
};

module.exports = Object.assign({}, defaults, rateLimits);
