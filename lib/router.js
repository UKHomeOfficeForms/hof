'use strict';

const hof = require('hof');
const wizard = hof.wizard;
const mixins = hof.mixins;
const i18nFuture = hof.i18n;
const router = require('express').Router();
const path = require('path');

module.exports = (config) => {

  const baseUrl = config.route.baseUrl || '/';
  const routeFields = path.resolve(config.caller, config.route.fields || config.fields);

  let fields;

  try {
    fields = require(path.resolve(config.caller, config.fields));
  } catch (err) {
    fields = err;
  }

  if ((fields instanceof Error) === false) {
    fields = Object.assign({}, fields, routeFields);
  }

  const i18n = i18nFuture({
    path: path.resolve(config.caller, config.translations) + '/__lng__/__ns__.json'
  });

  router.use(mixins(fields, {
    translate: i18n.translate.bind(i18n)
  }));

  const wizardConfig = {
    controller: config.baseController || hof.controllers.base,
    templatePath: path.resolve(config.caller, config.route.views || config.views),
    translate: i18n.translate.bind(i18n)
  };

  if (config.route.params) {
    wizardConfig.params = config.route.params;
  }

  router.use(baseUrl, wizard(config.route.steps, fields, wizardConfig));

  return router;

};
