'use strict';

const express = require('express');
const churchill = require('churchill');
const path = require('path');
const http = require('http');
const https = require('https');
const hofMiddleware = require('hof-middleware');
const i18nFuture = require('i18n-future');
const router = require('./lib/router');
const serveStatic = require('./lib/serve-static');
const sessionStore = require('./lib/sessions');
const settings = require('./lib/settings');
const defaults = require('./lib/defaults');
const logger = require('./lib/logger');
const helmet = require('helmet');

const getConfig = function getConfig() {
  const args = [].slice.call(arguments);
  return Object.assign.apply(null, [{}, defaults].concat(args));
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

const applyErrorMiddlewares = (app, config, i18n) => {
  app.use(hofMiddleware.notFound({
    logger: config.logger,
    translate: i18n.translate.bind(i18n),
  }));

  app.use(hofMiddleware.errors({
    translate: i18n.translate.bind(i18n),
    debug: config.env === 'development'
  }));
};

module.exports = options => {

  const app = express();
  const userMiddleware = express.Router();

  app.use(helmet());

  let config = getConfig(options);

  const i18n = i18nFuture({
    path: path.resolve(config.caller, config.translations) + '/__lng__/__ns__.json'
  });

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

  if (config.getCookies === true) {
    app.get('/cookies', (req, res) =>
      i18n.on('ready', () => res.render('cookies', i18n.translate('cookies'))));
  }
  if (config.getTerms === true) {
    app.get('/terms-and-conditions', (req, res) =>
      i18n.on('ready', () => res.render('terms', i18n.translate('terms'))));
  }

  app.use(userMiddleware);
  app.use(hofMiddleware.cookies());
  loadRoutes(app, config);
  applyErrorMiddlewares(app, config, i18n);

  const bootstrap = {

    use() {
      router.use.apply(router, arguments);
      return bootstrap;
    },

    server: null,

    start: (startConfig) => {
      startConfig = getConfig(config, startConfig);

      const protocol = startConfig.protocol === 'http' ? http : https;

      bootstrap.server = protocol.createServer(app);

      return new Promise((resolve, reject) => {
        bootstrap.server.listen(startConfig.port, startConfig.host, err => {
          if (err) {
            reject(new Error('Unable to connect to server'));
          }
          resolve(bootstrap);
        });
      });
    },

    stop() {
      return new Promise((resolve, reject) => bootstrap.server.close(err => {
        if (err) {
          reject(new Error('Unable to stop server'));
        }
        resolve(bootstrap);
      }));
    }
  };

  if (config.start !== false) {
    bootstrap.start(config);
  }

  return bootstrap;

};
