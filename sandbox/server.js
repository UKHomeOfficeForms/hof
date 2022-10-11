/* eslint-disable */
'use strict';

const config = require('./config');
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
  port: config.port
});

console.log(`Running on port ${config.port}`);
