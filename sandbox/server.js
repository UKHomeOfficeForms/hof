/* eslint-disable */
'use strict';

const bootstrap = require('../');

bootstrap({
  translations: './apps/sandbox/translations',
  routes: [
    require('./apps/sandbox'),
    require('./apps/config-driven-navigation'),
    require('./apps/task-driven-navigation')
  ],
  behaviours: [
    require('../').components.sessionTimeoutWarning
  ],
  rateLimits: {
    requests: {
      active: true
    }
  },
  getAccessibility: true,
  sessionTimeoutWarningContent: true,
  exitFormContent: true,
  "port": 8082,
  session: {
    secret: require('crypto').randomBytes(16).toString('hex')
  }
});
