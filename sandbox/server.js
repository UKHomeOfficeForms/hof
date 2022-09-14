/* eslint-disable */
'use strict';

const bootstrap = require('../');

bootstrap({
  translations: './apps/sandbox/translations',
  routes: [
    require('./apps/sandbox')
  ],
  rateLimits: {
    requests: {
      active: true
    }
  },
  getAccessibility: true,
  "port": 8080
});
