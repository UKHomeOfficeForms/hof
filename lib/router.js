'use strict';

const _ = require('lodash');
const express = require('express');
const wizard = require('hof-form-wizard');
const mixins = require('hof-template-mixins');
const translate = require('i18n-future').middleware;
const deepTranslate = require('hof-middleware').deepTranslate;
const expressPartialTemplates = require('express-partial-templates');
const helpers = require('./helpers');
const deprecate = require('deprecate');

function applyBehaviours(steps, behaviours) {
  _.each(steps, (step) => {
    step.behaviours = [].concat(behaviours).concat(step.behaviours).filter(a => a);
  });
}

module.exports = config => {

  const app = express();
  const baseUrl = config.route.baseUrl || '/';
  const name = config.route.name || baseUrl.replace('/', '');
  const paths = helpers.getPaths(config);
  const fields = helpers.getFields(paths.fields);
  const routeViews = helpers.getViews(paths.views, config.route.views);
  const sharedViews = config.sharedViews;

  const views = routeViews ? [routeViews].concat(sharedViews) : sharedViews;

  app.set('x-powered-by', false);
  app.set('view engine', config.viewEngine);
  app.set('views', views);

  app.use(expressPartialTemplates(app));

  app.use(translate({
    resources: require('hof-template-partials').resources(),
    path: paths.translations + '/__lng__/__ns__.json'
  }));
  app.use(deepTranslate());

  app.use(mixins());

  const wizardConfig = {};

  if (config.baseController) {
    deprecate(
      '`baseController` option is deprecated and may be removed in future versions.',
      'Use `behaviours` option to define global behaviours.'
    );
    wizardConfig.controller = config.baseController;
  }

  if (config.route.behaviours) {
    applyBehaviours(config.route.steps, config.route.behaviours);
  }

  if (config.behaviours) {
    applyBehaviours(config.route.steps, config.behaviours);
  }

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
