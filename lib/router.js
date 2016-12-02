'use strict';

const express = require('express');
const wizard = require('hof-form-wizard');
const mixins = require('hof-template-mixins');
const deepTranslate = require('hof-middleware').deepTranslate;
const i18nFuture = require('i18n-future');
const expressPartialTemplates = require('express-partial-templates');
const helpers = require('./helpers');

module.exports = (config) => {

  const app = express();
  const baseUrl = config.route.baseUrl || '/';
  const name = config.route.name || baseUrl.replace('/', '');
  const paths = helpers.getPaths(config);
  const fields = helpers.getFields(paths.fields);
  const views = helpers.getViews(paths.views);
  const i18n = i18nFuture({
    path: paths.translations + '/__lng__/__ns__.json'
  });

  app.set('x-powered-by', false);
  app.set('view engine', config.viewEngine);
  app.set('views', views.concat(config.sharedViews));

  app.use(expressPartialTemplates(app));

  app.use(deepTranslate({
    translate: i18n.translate.bind(i18n)
  }));

  app.use(mixins(fields));

  const wizardConfig = {
    controller: config.baseController
  };

  if (name) {
    wizardConfig.name = name;
  }

  if (config.route.params) {
    wizardConfig.params = config.route.params;
  }

  if (config.appConfig) {
    wizardConfig.appConfig = config.appConfig;
  }

  app.use(wizard(config.route.steps, fields, wizardConfig));

  return app;

};
