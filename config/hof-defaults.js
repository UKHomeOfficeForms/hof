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
    name: process.env.SESSION_NAME || 'hod.sid'
  },
  apis: {
    pdfConverter: process.env.PDF_CONVERTER_URL
  },
  serveStatic: process.env.SERVE_STATIC_FILES !== 'false',
  sanitisationBlacklistArray: {
    // Input will be sanitised using the below rules
    // The key is what we're sanitising out
    // The regex is the rule we used to find them (note some dictate repeating characters)
    // And the replace is what we're replacing that pattern with. Usually nothing sometimes a
    // single character or sometimes a single character followed by a "-"
    '/*': { regex: '\/\\*', replace: '' },
    '*/': { regex: '\\*\\/', replace: '' },
    '|': { regex: '\\|', replace: '' },
    '&&': { regex: '&&+', replace: '&' },
    '@@': { regex: '@@+', replace: '@' },
    '/..;/': { regex: '/\\.\\.;/', replace: '' }, // Purposely input before ".." as they conflict
    '..': { regex: '\\.\\.+', replace: '.' },
    '/etc/passwd': { regex: '\/etc\/passwd', replace: '' },
    'c:\\': { regex: 'c:\\\\', replace: '' },
    'cmd.exe': { regex: 'cmd\\.exe', replace: '' },
    '<': { regex: '<', replace: '<-' },
    '>': { regex: '>', replace: '>-' },
    '[': { regex: '\\[+', replace: '[-' },
    ']': { regex: '\\]+', replace: ']-' },
    '~': { regex: '~', replace: '~-' },
    '&#': { regex: '&#', replace: '&#-' },
    '%U': { regex: '%U', replace: '%U-' }
  }
};

module.exports = defaults;
