'use strict';

const templates = require('hof').template;
const hoganExpressStrict = require('hogan-express-strict');
const expressPartialTemplates = require('express-partial-templates');
const bodyParser = require('body-parser');
const path = require('path');

module.exports = (app, config) => {

  app.use((req, res, next) => {
    req.baseUrl = config.siteroot + req.baseUrl;
    res.locals.assetPath = config.assets;
    res.locals.gaTagId = config.ga && config.ga.tagId;
    next();
  });
  templates.setup(app);
  app.set('view engine', config.viewEngine || 'html');
  app.enable('view cache');
  if (config.views !== false) {
    app.set('views',  path.resolve(config.caller, 'views'));
    app.use(expressPartialTemplates(app));
  };
  app.engine('html', hoganExpressStrict);
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());
  app.use((req, res, next) => {
    res.locals.baseUrl = req.baseUrl;
    next();
  });

  return app;
};
