'use strict';

const fs = require('fs');
const path = require('path');
const express = require('express');
const wizard = require('hof-form-wizard');
const mixins = require('hof-template-mixins');
const deepTranslate = require('hof-middleware').deepTranslate;
const i18nFuture = require('i18n-future');
const expressPartialTemplates = require('express-partial-templates');

const getPaths = (appPath, config) => ({
  fields: config.fields ? path.resolve(config.caller, config.fields) : config.fields,
  routeFields: path.resolve(config.caller, config.route.fields || `${appPath}/fields`),
  templates: path.resolve(config.caller, config.route.views || `${appPath}/views`),
  translations: path.resolve(config.caller, config.route.translations || `${appPath}/translations`)
});

const getFields = paths => {
  let routeFields;
  let fields;

  try {
    if (paths.fields) {
      fields = require(paths.fields);
    }
  } catch (err) {
    throw new Error(`Cannot find fields at ${paths.fields}`);
  }
  try {
    routeFields = require(paths.routeFields);
  } catch (err) {
    throw new Error(`Cannot find route fields at ${paths.routeFields}`);
  }
  return Object.assign({}, fields, routeFields);
};

module.exports = (config) => {

  const app = express();

  const baseUrl = config.route.baseUrl || '/';
  const name = config.route.name || baseUrl.replace('/', '');
  const appPath = name ? `apps/${name}` : '.';
  const paths = getPaths(appPath, config);
  const fields = getFields(paths);

  try {
    fs.accessSync(paths.templates, fs.F_OK);
  } catch (err) {
    throw new Error(`Cannot find route views at ${paths.templates}`);
  }

  const i18n = i18nFuture({
    path: paths.translations + '/__lng__/__ns__.json'
  });

  app.set('x-powered-by', false);
  app.set('view engine', config.viewEngine);
  app.set('views', [paths.templates].concat(config.sharedViews));

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
