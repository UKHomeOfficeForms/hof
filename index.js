'use strict';

const express = require('express');
const churchill = require('churchill');
const path = require('path');
const http = require('http');
const https = require('https');
const mixins = require('hof-template-mixins');
const hofMiddleware = require('hof-middleware');
const markdown = require('hof-middleware-markdown');
const translate = require('i18n-future').middleware;
const router = require('./lib/router');
const serveStatic = require('./lib/serve-static');
const sessionStore = require('./lib/sessions');
const settings = require('./lib/settings');
const defaults = require('./lib/defaults');
const logger = require('./lib/logger');
const helmet = require('helmet');
const _ = require('lodash');

const customConfig = {};

const getConfig = function getConfig() {
  const args = [].slice.call(arguments);
  return Object.assign.apply(null, [{}, defaults, customConfig].concat(args));
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
    debug: config.env === 'development'
  }));
};

const getContentSecurityPolicy = config => {
  let csp = config.csp;
  let directives = {
    /* eslint-disable quotes */
    defaultSrc: ["'none'"],
    styleSrc: ["'self'"],
    imgSrc: ["'self'"],
    fontSrc: ["'self'", 'data:'],
    scriptSrc: ["'self'", "'unsafe-inline'"]
    /* eslint-enable quotes */
  };

  let gaDirectives = {
    scriptSrc: 'www.google-analytics.com',
    imgSrc: 'www.google-analytics.com'
  };

  if (config.gaTagId) {
    directives.scriptSrc = directives.scriptSrc.concat(gaDirectives.scriptSrc);
    directives.imgSrc = directives.imgSrc.concat(gaDirectives.imgSrc);
  }

  if (_.isPlainObject(csp)) {
    _.each(csp, (value, name) => {
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

function bootstrap(options) {

  let config = getConfig(options);

  const app = express();
  const userMiddleware = express.Router();

  app.use(helmet());

  if (config.csp) {
    app.use(helmet.contentSecurityPolicy({
      directives: getContentSecurityPolicy(config)
    }));
  }

  // shallow health check
  app.get('/healthz/ping', require('express-healthcheck')());

  if (!config || !config.routes || !config.routes.length) {
    throw new Error('Must be called with a list of routes');
  }

  config.routes.forEach(route => {
    if (!route.steps) {
      throw new Error('Each route must define a set of one or more steps');
    }
  });

  if (config.env !== 'test' && config.env !== 'ci') {
    config.logger = logger(config);
    app.use(churchill(config.logger));
  }

  if (config.middleware) {
    config.middleware.forEach(middleware => app.use(middleware));
  }

  serveStatic(app, config);
  settings(app, config);
  sessionStore(app, config);

  app.use(translate({
    resources: require('hof-template-partials').resources(),
    path: path.resolve(config.root, config.translations) + '/__lng__/__ns__.json'
  }));
  app.use(mixins());
  if (config.getCookies === true) {
    app.get('/cookies', (req, res) => {
      res.render('cookies', req.translate('cookies'));
    });
  }
  if (config.getTerms === true) {
    app.get('/terms-and-conditions', (req, res) => {
      res.render('terms', req.translate('terms'));
    });
  }

  app.use(userMiddleware);
  app.use(hofMiddleware.cookies());
  app.use(markdown());
  loadRoutes(app, config);
  applyErrorMiddlewares(app, config);

  const instance = {

    use() {
      userMiddleware.use.apply(userMiddleware, arguments);
      return instance;
    },

    server: null,

    start: (startConfig) => {
      startConfig = getConfig(config, startConfig);

      const protocol = startConfig.protocol === 'http' ? http : https;

      instance.server = protocol.createServer(app);

      return new Promise((resolve, reject) => {
        instance.server.listen(startConfig.port, startConfig.host, err => {
          if (err) {
            reject(new Error('Unable to connect to server'));
          }
          resolve(instance);
        });
      });
    },

    stop() {
      return new Promise((resolve, reject) => instance.server.close(err => {
        if (err) {
          reject(new Error('Unable to stop server'));
        }
        resolve(instance);
      }));
    }
  };

  if (config.start !== false) {
    instance.start(config);
  }

  return instance;

}

bootstrap.configure = function configure(key, val) {
  if (arguments.length === 2 && typeof key === 'string') {
    customConfig[key] = val;
  } else if (typeof key === 'object') {
    Object.assign(customConfig, key);
  }
};

module.exports = bootstrap;
