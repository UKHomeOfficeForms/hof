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

  // const isLocalDev = process.env.NODE_ENV === 'local';

  // const govukPkg = require.resolve('govuk-frontend/package.json', {
  //   paths: [config.root || process.cwd()]
  // });
  // const govukRoot = path.dirname(govukPkg);

  // const envCache = new Map();

  // function getEnvForRoute(routeName) {
  //   const key = routeName || 'common';

  //   if (envCache.has(key)) {
  //     return envCache.get(key);
  //   }

  //   const paths = [];

  //   if (routeName) {
  //     paths.push(path.join(process.cwd(), 'apps', routeName, 'views'));
  //   }

  //   paths.push(path.join(process.cwd(), 'apps/common/views'));
  //   paths.push(...viewPaths);
  //   paths.push(govukRoot);
  //   paths.push(path.join(govukRoot, 'dist'));

  //   const loader = new nunjucks.FileSystemLoader(paths, {
  //     noCache: isLocalDev
  //   });

  //   const env = new nunjucks.Environment(loader, {
  //     autoescape: true,
  //     watch: isLocalDev,
  //     noCache: isLocalDev
  //   });

  //   envCache.set(key, env);
  //   return env;
  // }

  // app.use((req, res, next) => {
  //   res.locals.req = req;
  //   res.locals.nunjucksEnv = getEnvForRoute(res.locals.routeName);
  //   next();
  // });

  // const matchBaseUrlRoute = (url, routes) => {
  //   return routes.find(r =>
  //     r.baseUrl &&
  //     (
  //       url === r.baseUrl ||
  //       url.startsWith(r.baseUrl + '/')
  //     )
  //   );
  // };

  // const matchRootStepRoute = (url, routes) => {
  //   const segments = url.split('/').filter(Boolean);

  //   // only root-level URLs
  //   if (segments.length !== 1) return null;

  //   const first = `/${segments[0]}`;

  //   return routes.find(r =>
  //     !r.baseUrl &&
  //     r.steps &&
  //     r.steps[first]
  //   );
  // };

  // const matchRoute = (req, routes) => {
  //   const url = req.originalUrl;

  //   const baseUrlMatch = matchBaseUrlRoute(url, routes);
  //   if (baseUrlMatch) return baseUrlMatch;

  //   const rootStepMatch = matchRootStepRoute(url, routes);
  //   if (rootStepMatch) return rootStepMatch;

  //   return null;
  // };

  // app.set('view engine', viewEngine);
  // app.engine(viewEngine, (filePath, context, callback) => {
  //   const req = context.req;

  //   const matchedRoute = matchRoute(req, config.routes);
  //   const routeName = matchedRoute?.name;

  //   const env = getEnvForRoute(routeName);
  //   app.locals.nunjucksEnv = env;

  //   env.render(filePath, context, callback);
  // });




  const isLocalDev = process.env.NODE_ENV === 'local';

  const govukPkg = require.resolve('govuk-frontend/package.json', {
    paths: [config.root || process.cwd()]
  });
  const govukRoot = path.dirname(govukPkg);


  const nunjucksEnv = nunjucks.configure([], {
    autoescape: true,
    express: app,
    watch: isLocalDev,
    noCache: isLocalDev
  });

  const loader = new nunjucks.FileSystemLoader([], {
    noCache: isLocalDev
  });

  nunjucksEnv.loaders = [loader];

  const matchBaseUrlRoute = (url, routes) => {
    return routes.find(r =>
      r.baseUrl &&
      (url === r.baseUrl || url.startsWith(r.baseUrl + '/'))
    );
  };

  const matchRootStepRoute = (url, routes) => {
    const segments = url.split('/').filter(Boolean);

    if (segments.length !== 1) return null;

    const first = `/${segments[0]}`;

    return routes.find(r =>
      !r.baseUrl &&
      r.steps &&
      r.steps[first]
    );
  };

  const matchRoute = (req, routes) => {
    const url = req.originalUrl;

    return (
      matchBaseUrlRoute(url, routes) ||
      matchRootStepRoute(url, routes) ||
      null
    );
  };

  app.use((req, res, next) => {
    const matchedRoute = matchRoute(req, config.routes);
    const routeName = matchedRoute?.name;

    const paths = [];

    // 1. route-specific views (highest priority)
    if (routeName) {
      paths.push(
        path.join(process.cwd(), 'apps', routeName, 'views')
      );
    }

    // 2. shared app views
    paths.push(
      path.join(process.cwd(), 'apps/common/views')
    );

    // 3. framework views
    paths.push(...viewPaths);

    // 4. GOV.UK fallback
    paths.push(govukRoot);
    paths.push(path.join(govukRoot, 'dist'));

    // apply to loader (safe dynamic override)
    loader.searchPaths = paths;

    // expose route for templates if needed
    res.locals.routeName = routeName || 'common';
    res.locals.req = req;

    next();
  });

  app.set('view engine', viewEngine);

  app.engine(viewEngine, nunjucksEnv.render.bind(nunjucksEnv));

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
