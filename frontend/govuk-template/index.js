'use strict';

const path = require('path');
const servestatic = require('serve-static');
const Router = require('express').Router;
const build_template_layout = require('./build');

const basedir = path.dirname(require.resolve('govuk_template_mustache/package.json'));

module.exports = options => {
  build_template_layout();
  const router = new Router();
  options = options || {};
  options.path = options.path || '/govuk-assets';

  router.use(options.path, servestatic(path.join(basedir, './assets'), options));
  router.use((req, res, next) => {
    res.locals.govukAssetPath = req.baseUrl + options.path + '/';
    res.locals.partials = res.locals.partials || {};
    res.locals.partials['govuk-template'] = path.resolve(__dirname, './govuk_template');
    next();
  });

  return router;
};
