'use strict';

const hof = require('hof');
const expressPartialTemplates = require('express-partial-templates');
const wizard = hof.wizard;
const mixins = hof.mixins;
const i18nFuture = hof.i18n;
const express = require('express');
const path = require('path');
const fs = require('fs');
const parser = require('busboy-body-parser');

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

  app.use(hof.middleware.deepTranslate({
    translate: i18n.translate.bind(i18n)
  }));

  app.use(mixins(fields));

  app.use(parser(Object.assign({}, {
      limit: config.file.limit,
      multi: config.file.multiple
    }, {
      limit: config.route.file && config.route.file.limit,
      multi: config.route.file && config.route.file.multiple
    })
  ));

  const wizardConfig = {
    controller: config.baseController
  };

  if (name) {
    wizardConfig.name = name;
  }

  if (config.route.params) {
    wizardConfig.params = config.route.params;
  }

  app.use(wizard(config.route.steps, fields, wizardConfig));

  return app;

};
