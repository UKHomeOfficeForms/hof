'use strict';

const bootstrap = require('hof-bootstrap');

bootstrap({
  translations: './apps/example-app/translations',
  routes: [
    require('./apps/example-app')
  ]
});
