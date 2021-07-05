'use strict';

const path = require('path');
const express = require('express');
const deprecate = require('deprecate');

const mixins = require('./template-mixins');
const helpers = require('./helpers');

module.exports = (options, deprecated) => {

  if (arguments.length === 2) {
    deprecate([
      'hof-template-mixins: Passing field config to mixins is deprecated',
      'hof-template-mixins: Field config will be loaded from res.locals.options.fields'
    ]);
    options = deprecated;
  }

  options = options || {};
  options.fields = options.fields || {};

  options.viewsDirectory = options.viewsDirectory || path.resolve(__dirname, '../');
  options.viewEngine = options.viewEngine || 'html';
  options.sharedTranslationsKey = options.sharedTranslationsKey || '';

  if (options.sharedTranslationsKey && !options.sharedTranslationsKey.match(/\.$/)) {
    options.sharedTranslationsKey += '.';
  }

  const router = express.Router();

  router.use(mixins(options));
  router.use(helpers(options));

  return router;

};
