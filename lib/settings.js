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
  } catch (err) {
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

  const nunjucksRoots = [];

  // add the app views to the Nunjucks roots, so that the resolved path can be found by the Nunjucks loader
  const appsDirectory = path.resolve(config.root, 'apps')
  const appViewPaths = fs.readdirSync(appsDirectory)
    .map(appName => path.join(appsDirectory, appName, 'views'))
    .filter(p => fs.existsSync(p))

  nunjucksRoots.push(...viewPaths, ...appViewPaths);

  // include project node_modules so imports like "govuk/..." can be resolved
  nunjucksRoots.push(path.resolve(config.root || process.cwd(), 'node_modules'));

  try {
    const govukPkg = require.resolve('govuk-frontend/package.json', { paths: [config.root || process.cwd()] });
    const govukRoot = path.dirname(govukPkg);
    nunjucksRoots.push(govukRoot);
    nunjucksRoots.push(path.join(govukRoot, 'components'));
    nunjucksRoots.push(path.join(govukRoot, 'packages', 'govuk-frontend', 'components'));
    nunjucksRoots.push(path.join(govukRoot, 'templates'));

  } catch (e) {
    console.debug('govuk-frontend not resolved via require.resolve; ensure package is installed if needed');
  }
  try {
    const mixinsDirectory = path.resolve(config.root || process.cwd(), 'frontend', 'template-mixins', 'partials');
    nunjucksRoots.push(mixinsDirectory);
  } catch (e) {
    console.debug('govuk-frontend not resolved via require.resolve; ensure package is installed if needed');
  }

  // dedupe and keep only existing directories
  const uniqueRoots = Array.from(new Set(nunjucksRoots)).filter(p => {
    try { return fs.existsSync(p) && fs.lstatSync(p).isDirectory(); } catch (e) { return false; }
  });

  // configure nunjucks and keep the env for other modules if needed
  const nunjucksEnv = nunjucks.configure(uniqueRoots, {
    autoescape: true,
    express: app,
    watch: process.env.NODE_ENV === 'development',
    noCache: process.env.NODE_ENV === 'development'
  });

  // expose the same env so other modules/middlewares can reuse it
  app.locals.nunjucksEnv = nunjucksEnv;

  app.engine('html', nunjucksEnv.render.bind(nunjucksEnv));
  app.set('view engine', viewEngine);

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
