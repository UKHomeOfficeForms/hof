/* eslint-disable */
'use strict';

const bootstrap = require('../');

bootstrap({
  translations: './apps/example-app/translations',
  routes: [
    require('./apps/example-app')
  ],
  getAccessibility: true
});
