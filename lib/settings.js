'use strict';

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
  const viewEngine = config.viewEngine || 'njk';

  app.use((req, res, next) => {
    res.locals.assetPath = '/public';
    next();
  });

  app.use(config.theme());

  const filteredViews = filterEmptyViews(config.theme.views);
  const viewPaths = [].concat(filteredViews);
  app.enable('view cache');

  if (config.views) {
    const viewsArray = Array.isArray(config.views)
      ? config.views
      : [config.views];

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

  const isLocalDev = process.env.NODE_ENV === 'local';

  const govukPkg = require.resolve('govuk-frontend/package.json', {
    paths: [config.root || process.cwd()]
  });
  const govukRoot = path.dirname(govukPkg);

  const envCache = new Map();

  const absoluteViewPath = viewPath => {
    return path.isAbsolute(viewPath)
      ? viewPath
      : path.resolve(config.root || process.cwd(), viewPath);
  };

  const getRouteViewPaths = route => {
    if (!route) {
      return [];
    }

    if (route.views) {
      return (Array.isArray(route.views) ? route.views : [route.views])
        .filter(Boolean)
        .map(absoluteViewPath);
    }

    if (route.name) {
      return [path.resolve(config.root || process.cwd(), 'apps', route.name, 'views')];
    }

    return [];
  };

  const matchBaseUrlRoute = (url, routes) => {
    return routes.find(r =>
      r.baseUrl &&
      (
        url === r.baseUrl ||
        url.startsWith(r.baseUrl + '/')
      )
    );
  };

  const matchRootRoute = (url, routes) => {
    const segments = url.split('/').filter(Boolean);

    if (!segments.length) return null;

    const first = `/${segments[0]}`;

    return routes.find(r =>
      !r.baseUrl &&
      (
        (r.steps && r.steps[first]) ||
        (r.pages && r.pages[first])
      )
    );
  };

  const matchRoute = (req, routes) => {
    if (!req || !routes) {
      return null;
    }

    if (req.baseUrl) {
      const baseUrlRoute = routes.find(r => r.baseUrl && r.baseUrl === req.baseUrl);
      if (baseUrlRoute) {
        return baseUrlRoute;
      }
    }

    const url = (req.originalUrl || req.url || req.path || '').split('?')[0];

    const baseUrlMatch = matchBaseUrlRoute(url, routes);
    if (baseUrlMatch) return baseUrlMatch;

    const rootMatch = matchRootRoute(url, routes);
    if (rootMatch) return rootMatch;

    return null;
  };

  function getEnvForRoute(route) {
    const routeViews = getRouteViewPaths(route);
    const key = routeViews.length ? routeViews.join('|') : 'common';

    if (envCache.has(key)) {
      return envCache.get(key);
    }

    const paths = [];

    paths.push(...routeViews);
    paths.push(path.join(config.root || process.cwd(), 'apps/common/views'));
    paths.push(...viewPaths);
    paths.push(govukRoot);
    paths.push(path.join(govukRoot, 'dist'));

    // dedupe and keep only existing directories
    const uniquePaths = Array.from(new Set(paths)).filter(viewPath => {
      try {
        return fs.existsSync(viewPath) && fs.lstatSync(viewPath).isDirectory();
      } catch (e) {
        return false;
      }
    });

    const loader = new nunjucks.FileSystemLoader(uniquePaths, {
      noCache: isLocalDev
    });

    const env = new nunjucks.Environment(loader, {
      autoescape: true,
      watch: isLocalDev,
      noCache: isLocalDev
    });

    envCache.set(key, env);
    return env;
  }

  app.use((req, res, next) => {
    res.locals.req = req;
    const matchedRoute = matchRoute(req, config.routes);
    res.locals.nunjucksEnv = getEnvForRoute(res.locals.routeConfig || matchedRoute);
    next();
  });

  app.set('view engine', viewEngine);
  app.engine(viewEngine, (filePath, context, callback) => {
    const req = context && context.req;
    let env = context && context.nunjucksEnv;

    if (context && context.routeConfig) {
      env = getEnvForRoute(context.routeConfig);
      app.locals.nunjucksEnv = env;
    } else if (!env && req) {
      const matchedRoute = matchRoute(req, config.routes);
      env = getEnvForRoute(matchedRoute);
      app.locals.nunjucksEnv = env;
    }

    if (!env) {
      env = app.locals.nunjucksEnv || getEnvForRoute(null);
    }

    env.render(filePath, context, callback);
  });

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
