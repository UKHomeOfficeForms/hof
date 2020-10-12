'use strict';

const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const hoganExpressStrict = require('hogan-express-strict');
const expressPartialTemplates = require('express-partial-templates');
const bodyParser = require('body-parser');

module.exports = (app, config) => {

  const viewEngine = config.viewEngine || 'html';

  app.use((req, res, next) => {
    res.locals.assetPath = '/public';
    next();
  });

  app.use(config.theme());

  let viewPaths = [].concat(config.theme.views);
  app.set('view engine', viewEngine);
  app.enable('view cache');

  if (config.views) {
    const viewsArray = _.castArray(config.views);
    viewsArray.slice().reverse().forEach(view => {
      const customViewPath = path.resolve(config.root, view);
      try {
        fs.accessSync(customViewPath, fs.F_OK);
      } catch (err) {
        throw new Error(`Cannot find views at ${customViewPath}`);
      }
      viewPaths.unshift(customViewPath);
    });
  }

  app.set('views', viewPaths);
  app.use(expressPartialTemplates(app));

  app.engine(viewEngine, hoganExpressStrict);

  app.use(bodyParser.urlencoded({
    extended: true
  }));

  app.use(bodyParser.json());

  app.use((req, res, next) => {
    res.locals.baseUrl = req.baseUrl;
    next();
  });

  // Trust proxy for secure cookies
  app.set('trust proxy', 1);

  return app;
};
