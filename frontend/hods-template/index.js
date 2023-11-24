'use strict';

const path = require('path');
const servestatic = require('serve-static');
const Router = require('express').Router;
const buildTemplateLayout = require('./build');

const basedir = path.dirname(require.resolve('govuk-frontend/package.json'));

const setup = (opts, router) => {
  buildTemplateLayout();
  const options = opts || {};
  options.path = options.path || '/assets';

  router.use(options.path, servestatic(path.join(basedir, './govuk/assets'), options));
  router.use((req, res, next) => {
    res.locals.govukAssetPath = req.baseUrl + options.path + '/';
    res.locals.partials = res.locals.partials || {};
    res.locals.partials['govuk-template'] = path.resolve(__dirname, './hods_template_generated');
    next();
  });

  return router;
};

module.exports = (options, app) => {
  const router = app || new Router();
  return setup(options, router);
};
