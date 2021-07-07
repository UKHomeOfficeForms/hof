'use strict';

const _ = require('lodash');
const express = require('express');
const wizard = require('../wizard');
const translate = require('i18n-future').middleware;
const deepTranslate = require('../middleware').deepTranslate;
const expressPartialTemplates = require('express-partial-templates');
const helpers = require('./helpers');
const deprecate = require('deprecate');

function applyBehaviours(steps, behaviours) {
  _.each(steps, step => {
    step.behaviours = [].concat(behaviours).concat(step.behaviours).filter(a => a);
  });
}

function getWizardConfig(config) {
  const wizardConfig = {
    name: config.route.name || (config.route.baseUrl || '').replace('/', '')
  };

  if (config.appConfig) {
    wizardConfig.appConfig = config.appConfig;
  }

  // whitelist properties from the route's config that should be passed into the form wizard
  const props = [
    'confirmStep',
    'params'
  ];
  Object.assign(wizardConfig, _.pick(config.route, props));

  return wizardConfig;
}

const returnBaseUrl = (url = '') => {
  const splitUrl = url.split('/');

  return splitUrl.length > 2 ? `/${splitUrl[1]}` : '/';
};

module.exports = config => {
  const app = express();
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
    resources: config.theme.translations,
    path: paths.translations + '/__lng__/__ns__.json'
  }));
  app.use(deepTranslate());

  const wizardConfig = getWizardConfig(config);

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

  Object.keys(config.route.pages || {}).forEach(path => {
    app.get(path, (req, res) => {
      let objPath = config.route.pages[path];

      if (typeof objPath === 'string') {
        objPath = {
          template: objPath,
          title: objPath
        };
      }
      res.locals = Object.assign(res.locals, {
        baseUrl: returnBaseUrl(req.originalUrl),
        refererUrl: req.headers.referer,
        title: objPath.title
      });
      return res.render(objPath.template);
    });
  });

  if (config.route.steps) {
    app.use(wizard(config.route.steps, fields, wizardConfig));
  }

  return app;
};
