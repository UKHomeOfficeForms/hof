'use strict';

const crypto = require('crypto');
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const http = require('http');
const https = require('https');
const mixins = require('hof-template-mixins');
const hofMiddleware = require('./middleware');
const markdown = require('./lib/markdown');
const translate = require('i18n-future').middleware;
const router = require('./lib/router');
const health = require('./lib/health');
const serveStatic = require('./lib/serve-static');
const gaTagSetup = require('./lib/ga-tag');
const sessionStore = require('./lib/sessions');
const settings = require('./lib/settings');
const defaults = require('./config/hof-defaults');
const logger = require('./lib/logger');
const helmet = require('helmet');
const _ = require('lodash');
const deprecate = require('deprecate');

const customConfig = {};

const getConfig = function () {
  const args = [].slice.call(arguments);
  const config = _.merge.apply(_, [{}, defaults, customConfig].concat(args));

  if (!config.theme) {
    config.theme = require('hof-theme-govuk');
  } else if (typeof config.theme === 'string') {
    config.theme = require(`hof-theme-${config.theme}`);
  }

  config.markdown = config.markdown || {};

  return config;
};

const loadRoutes = (app, config) => {
  config.routes.forEach(route => {
    const routeConfig = Object.assign({}, config, {
      route,
      sharedViews: app.get('views')
    });
    app.use(route.baseUrl || '/', router(routeConfig));
  });
};

const applyErrorMiddlewares = (app, config) => {
  app.use(hofMiddleware.notFound({
    logger: config.logger
  }));

  app.use(hofMiddleware.errors({
    logger: config.logger,
    debug: config.env === 'development'
  }));
};

const getContentSecurityPolicy = (config, res) => {
  const csp = config.csp;

  /* eslint-disable quotes */
  const directives = {
    defaultSrc: ["'none'"],
    styleSrc: ["'self'"],
    imgSrc: ["'self'"],
    fontSrc: ["'self'", 'data:'],
    scriptSrc: ["'self'", `'nonce-${res.locals.nonce}'`],
    'frame-ancestors': ["'none'"]
  };
  /* eslint-enable quotes */

  const gaDirectives = {
    scriptSrc: ['www.google-analytics.com', 'ssl.google-analytics.com'],
    imgSrc: 'www.google-analytics.com',
    connectSrc: ['www.google-analytics.com']
  };

  if (config.gaTagId) {
    directives.scriptSrc = directives.scriptSrc.concat(gaDirectives.scriptSrc);
    directives.imgSrc = directives.imgSrc.concat(gaDirectives.imgSrc);
    directives.connectSrc = gaDirectives.connectSrc;
  }

  if (csp && !csp.disabled) {
    _.each(csp, (value, name) => {
      if (name === 'disabled') {
        return;
      }
      if (directives[name] && directives[name].length) {
        // concat unique directives with existing directives
        directives[name] = _.uniq(directives[name].concat(value));
      } else {
        directives[name] = _.isArray(value) ? value : [value];
      }
    });
  }
  return directives;
};

/**
 * Creates a new HOF application
 *
 * @param options {object} Configuration options for the HOF application
 * @param options.behaviours {object | Array<object>} The HOF behaviour(s) to invoke for all sub-applications
 * @param options.translations {string} The translations path for the application
 * @param options.routes {Array<object>} The sub-applications for this app: for example; require('./apps/example-app')
 * @param options.views {Array<string>} The view template paths for the application
 * @param options.middleware {Array<function>} An array of Express middleware functions to use
 * @param options.theme {string} Optional HOF theme - defaults to govuk
 * @param options.markdown {object} Optional markdown options
 * @param options.getTerms {boolean} Optional boolean - whether to mount the /terms endpoint
 * @param options.getCookies {boolean} Optional boolean - whether to mount the /cookies endpoint
 * @param options.noCache {boolean} Optional boolean - whether to disable caching
 *
 * @returns {object} A new HOF application using the configuration supplied in options
 */
function bootstrap(options) {
  const config = getConfig(options);

  const app = express();
  const userMiddleware = express.Router();

  app.use(helmet());

  app.use((req, res, next) => {
    res.locals.nonce = crypto.randomBytes(16).toString('hex');
    next();
  });

  if (config.csp !== false && !config.csp.disabled) {
    app.use((req, res, next) => {
      helmet.contentSecurityPolicy({
        directives: getContentSecurityPolicy(config, res)
      })(req, res, next);
    });
  }

  app.use(helmet.noSniff());

  if (config.noCache && config.noCache !== 'false') {
    app.use((req, res, next) => {
      res.setHeader('cache-control', ['no-store', 'no-cache', 'must-revalidate', 'proxy-revalidate']);
      res.setHeader('pragma', 'no-cache');
      next();
    });
  }

  if (!config || !config.routes || !config.routes.length) {
    throw new Error('Must be called with a list of routes');
  }

  config.routes.forEach(route => {
    if (!route.steps && !route.pages) {
      throw new Error('Each app must have steps and/or pages');
    }
  });

  if (config.middleware) {
    config.middleware.forEach(middleware => app.use(middleware));
  }

  config.logger = logger(config);

  morgan.token('id', req => _.get(req, 'session.id', 'N/A'));

  app.use(morgan('sessionId=:id ' + morgan.combined, {
    stream: config.logger.stream,
    skip: (req, res) => config.loglevel !== 'debug' &&
        (
          res.statusCode >= 300 || !_.get(req, 'session.id') ||
          config.ignoreMiddlewareLogs.some(v => req.originalUrl.includes(v))
        )
  }));

  serveStatic(app, config);
  settings(app, config);
  gaTagSetup(app, config);

  const sessions = sessionStore(app, config);
  app.use('/healthz', health(sessions));

  app.use((req, res, next) => {
    const id = _.get(req, 'session.id', 'N/A');
    req.log = config.logger.logSession(id);
    next();
  });

  app.use(translate({
    resources: config.theme.translations,
    path: path.resolve(config.root, config.translations) + '/__lng__/__ns__.json'
  }));
  app.use(mixins());
  app.use(markdown(config.markdown));

  if (config.getCookies === true) {
    deprecate(
      '`getCookies` option is deprecated and may be removed in future versions.',
      'Use `pages` to define static cookies page.'
    );
    app.get('/cookies', (req, res) => {
      res.render('cookies', req.translate('cookies'));
    });
  }
  if (config.getTerms === true) {
    deprecate(
      '`getTerms` option is deprecated and may be removed in future versions.',
      'Use `pages` to define static terms and conditions page.'
    );
    app.get('/terms-and-conditions', (req, res) => {
      res.render('terms', req.translate('terms'));
    });
  }

  app.use(userMiddleware);
  app.use(hofMiddleware.cookies());
  loadRoutes(app, config);
  applyErrorMiddlewares(app, config);

  const instance = {
    use() {
      userMiddleware.use.apply(userMiddleware, arguments);
      return instance;
    },

    server: null,

    start: sConfig => {
      let startConfig = sConfig;
      startConfig = getConfig(config, startConfig);

      const protocol = startConfig.protocol === 'http' ? http : https;

      instance.server = protocol.createServer(app);

      return new Promise((resolve, reject) => {
        instance.server.listen(startConfig.port, startConfig.host, err => {
          if (err) {
            reject(new Error('Unable to connect to server'));
          }
          config.logger.log('info', `${config.appName} started!`);
          resolve(instance);
        });
      });
    },

    stop() {
      return new Promise((resolve, reject) => instance.server.close(err => {
        if (err) {
          reject(new Error('Unable to stop server'));
        }
        config.logger.log('info', `${config.appName} stopped!`);
        resolve(instance);
      }));
    }
  };

  if (config.start !== false) {
    instance.start(config);
  }

  return instance;
}

bootstrap.configure = function (key, val) {
  if (arguments.length === 2 && typeof key === 'string') {
    customConfig[key] = val;
  } else if (typeof key === 'object') {
    Object.assign(customConfig, key);
  }
};

module.exports = bootstrap;
module.exports.build = require('./build/');
module.exports.transpiler = require('./transpiler/');
module.exports.middleware = require('./middleware');
module.exports.controller = require('./controller');
module.exports.model = require('./model');
module.exports.wizard = require('./wizard');
module.exports.components = require('./components');
module.exports.utils = require('./utilities');
