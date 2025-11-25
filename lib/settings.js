'use strict';

const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const nunjucks = require('nunjucks');
const expressPartialTemplates = require('express-partial-templates');
const bodyParser = require('body-parser');

const dirExists = dir => {
  try {
    if (fs.existsSync(dir)) {
      return true;
    }
    return false;
  } catch(err) {
    throw new Error(`${err}: Cannot check if the directory path exists`);
  }
};

const filterEmptyViews = views => {
  return views.filter(view => dirExists(view));
};

module.exports = async (app, config) => {
  const viewEngine = config.viewEngine || 'html';

  app.use((req, res, next) => {
    res.locals.assetPath = '/public';
    next();
  });

  app.use(config.theme());

  const filteredViews = filterEmptyViews(config.theme.views);
  const viewPaths = [].concat(filteredViews);
  app.set('view engine', viewEngine);
  app.enable('view cache');

  if (config.views) {
    const viewsArray = _.castArray(config.views);
    viewsArray.slice().reverse().forEach(view => {
      const customViewPath = path.resolve(config.root, view);
      try {
        fs.accessSync(customViewPath, fs.constants.F_OK);
      } catch (err) {
        throw new Error(`Cannot find views at ${customViewPath}`);
      }
      viewPaths.unshift(customViewPath);
    });
  }

  app.set('views', viewPaths);
  app.use(expressPartialTemplates(app));

 
  nunjucks.configure([path.resolve(__dirname, '../node_modules', 'govuk-frontend'),
    path.resolve(viewPaths.toString())], {
    autoescape: true,
    express: app,
    watch: process.env.NODE_ENV === 'development',
    noCache: process.env.NODE_ENV === 'development'
  });

  // set view engine (use .njk or .html; nunjucks will render either)
  app.set('view engine', '.html');
  app.engine('html', nunjucks.render);

  app.use(bodyParser.urlencoded({
    extended: true
  }));

  app.use(bodyParser.json());

  app.use((req, res, next) => {
    res.locals.baseUrl = req.baseUrl;
    res.locals.showCookiesBanner = config.showCookiesBanner;
    res.locals.hasGoogleAnalytics = config.hasGoogleAnalytics;
    next();
  });

  // Trust proxy for secure cookies
  app.set('trust proxy', 1);

  return app;
};
