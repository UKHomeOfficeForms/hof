/* eslint-disable */
'use strict';

const bootstrap = require('../');

bootstrap({
  translations: './apps/sandbox/translations',
  routes: [
    require('./apps/sandbox')
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
  "port": 8082
});
