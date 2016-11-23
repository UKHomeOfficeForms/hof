'use strict';

const bootstrap = require('hof-bootstrap');

bootstrap({
  views: false,
  fields: false,
  translations: './apps/example-app/translations',
  routes: [
    require('./apps/example-app')
  ]
});
