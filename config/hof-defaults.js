'use strict';
/* eslint no-process-env: "off" */
const rateLimits = require('./rate-limits');

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
  port: process.env.PORT || '8081',
  env: process.env.NODE_ENV || 'development',
  gaTagId: process.env.GA_TAG || 'Test-GA-Tag',
  ga4TagId: process.env.GA_4_TAG,
  gaCrossDomainTrackingTagId: process.env.GDS_CROSS_DOMAIN_GA_TAG,
  loglevel: process.env.LOG_LEVEL || 'info',
  ignoreMiddlewareLogs: ['/healthz'],
  auth: process.env.AUTH || true,
  keycloak: {
    issuer: process.env.AUTH_ISSUER || 'http://localhost:8180/realms/sis-local',
    authorizationURL: process.env.AUTH_URL || 'http://localhost:8180/realms/sis-local/protocol/openid-connect/auth',
    tokenURL: process.env.TOKEN_URL || 'http://localhost:8180/realms/sis-local/protocol/openid-connect/token',
    userInfoURL: process.env.USER_INFO_URL || 'http://localhost:8180/realms/sis-local/protocol/openid-connect/userinfo',
    clientID: process.env.CLIENT_ID || 'sis',
    clientSecret: process.env.CLIENT_SECRET || 't8Ogzq4wQKc6gyKeTMrNvp8WbWTOmTRx',
    callbackURL: process.env.CALLBACK_URL || 'http://localhost:8081/submit-immigration-intelligence/login/callback',
    loginRoute: process.env.LOGIN_ROUTE || '/login',
    // Must be added to valid redirect URI's in Keycloak admin console
    loginCallbackRoute: process.env.LOGIN_CALLBACK_ROUTE || '/login/callback'
  },
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

module.exports = Object.assign({}, defaults, rateLimits);
