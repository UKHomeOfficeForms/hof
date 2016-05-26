'use strict';

const hof = require('hof');
const wizard = hof.wizard;
const mixins = hof.mixins;
const i18n = hof.i18n;
const router = require('express').Router();
const path = require('path');
const debug = require('debug')('router');

module.exports = (routeConfig, config) => {
  const baseUrl = routeConfig.baseUrl || '/';
  debug('create %s', baseUrl);

  let commonFields;
  let fields = require(path.resolve(config.caller, routeConfig.fields));

  if (routeConfig.commonFields) {
    commonFields = require(path.resolve(config.caller, routeConfig.commonFields));
  }

  if (commonFields && fields) {
    fields = Object.assign({}, commonFields, fields);
  }

  const translate = i18n({
    path: path.resolve(config.caller, routeConfig.translations || config.translations)
  }).translate;

  router.use(mixins(fields, {translate: translate}));

  const wizardConfig = {
    controller: routeConfig.baseController || config.baseController,
    templatePath: path.resolve(config.caller, routeConfig.views || config.views),
    translate: translate
  };

  if (routeConfig.params) {
    routeConfig.params = routeConfig.params;
  }

  router.use(baseUrl, wizard(routeConfig.steps, fields, wizardConfig));

  return router;

};
