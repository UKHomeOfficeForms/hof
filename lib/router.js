'use strict';

const hof = require('hof');
const wizard = hof.wizard;
const mixins = hof.mixins;
const i18nFuture = hof.i18n;
const router = require('express').Router();
const path = require('path');
const fs = require('fs');

const getPaths = (appPath, config) => ({
  fields: config.fields ? path.resolve(config.caller, config.fields) : config.fields,
  routeFields: path.resolve(config.caller, config.route.fields || `${appPath}/fields`),
  templates: path.resolve(config.caller, config.route.views || `${appPath}/views`),
  translations: path.resolve(config.caller, config.route.translations || `${appPath}/translations`)
});

module.exports = (config) => {

  const baseUrl = config.route.baseUrl || '/';
  const name = config.route.name || baseUrl.replace('/', '');
  const appPath = name ? `apps/${name}` : '.';
  const paths = getPaths(appPath, config);

  let fields = {};
  let routeFields = {};

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

  fields = Object.assign({}, fields, routeFields);

  try {
    fs.accessSync(paths.templates, fs.F_OK);
  } catch (err) {
    throw new Error(`Cannot find route views at ${paths.templates}`);
  }

  const i18n = i18nFuture({
    path: paths.translations + '/__lng__/__ns__.json'
  });

  router.use(mixins(fields, {
    translate: i18n.translate.bind(i18n)
  }));

  const wizardConfig = {
    controller: config.baseController || hof.controllers.base,
    templatePath: paths.templates,
    translate: i18n.translate.bind(i18n)
  };

  if (config.route.params) {
    wizardConfig.params = config.route.params;
  }

  router.use(baseUrl, wizard(config.route.steps, fields, wizardConfig));

  return router;

};
