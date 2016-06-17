'use strict';

const hof = require('hof');
const wizard = hof.wizard;
const mixins = hof.mixins;
const i18nFuture = hof.i18n;
const router = require('express').Router();
const path = require('path');
const debug = require('debug')('router');

module.exports = (routeConfig, config) => {
  const baseUrl = routeConfig.baseUrl || '/';
  debug('create %s', baseUrl);

  let commonFields;
  let fields = require(path.resolve(config.caller, routeConfig.fields));
  const translations = path.resolve(config.caller, routeConfig.translations ? path.resolve(routeConfig.translations, config.translations) : config.translations)

  if (routeConfig.commonFields) {
    commonFields = require(path.resolve(config.caller, routeConfig.commonFields));
  }

  if (commonFields && fields) {
    fields = Object.assign({}, commonFields, fields);
  }

  const i18n = i18nFuture({
    path: translations
  });

  router.use(mixins(fields, {
    translate: i18n.translate.bind(i18n)
  }));

  const wizardConfig = {
    controller: routeConfig.baseController || config.baseController,
    templatePath: path.resolve(config.caller, routeConfig.views || config.views),
    translate: i18n.translate.bind(i18n)
  };

  if (routeConfig.params) {
    routeConfig.params = routeConfig.params;
  }

  router.use(baseUrl, wizard(routeConfig.steps, fields, wizardConfig));

  return router;

};
