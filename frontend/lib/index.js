/* eslint-disable no-param-reassign, no-undef */
'use strict';

const filters = require('./filters');
const globals = require('./globals');
const locals = require('./locals');
const mixins = require('./mixins');

module.exports = {
  setup: (app, nunjucksEnv) => {
    filters.addFilters(nunjucksEnv);
    globals.addGlobals(nunjucksEnv);
    app.use(locals.middleware(app, nunjucksEnv));
  }
};
