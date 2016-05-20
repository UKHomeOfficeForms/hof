'use strict';

const hof = require('hof');
const wizard = hof.wizard;
const mixins = hof.mixins;
const i18n = hof.i18n;
const router = require('express').Router();
const path = require('path');

module.exports = settings => {

  const baseUrl = settings.baseUrl || '/';

  let commonFields;
  let fields = require(settings.fields);

  if (settings.commonFields) {
    commonFields = require(path.resolve(settings.commonFields, settings.fields));
  }

  if (commonFields && fields) {
    fields = Object.assign({}, commonFields, fields);
  }

  const translate = i18n({
    path: settings.translations || path.resolve(settings.caller, settings.translations)
  }).translate;

  router.use(mixins(fields, {translate: translate}));

  const wizardConfig = {
    controller: settings.baseController,
    templatePath: settings.templates,
    translate: translate
  };

  if (settings.params) {
    settings.params = settings.params;
  }

  router.use(baseUrl, wizard(settings.steps, fields, wizardConfig));

  return router;

};
