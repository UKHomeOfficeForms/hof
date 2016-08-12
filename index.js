'use strict';

const app = require('express')();
const hof = require('hof');
const churchill = require('churchill');
const path = require('path');
const http = require('http');
const https = require('https');
const router = require('./lib/router');
const serveStatic = require('./lib/serve-static');
const sessionStore = require('./lib/sessions');
const settings = require('./lib/settings');
const defaults = require('./lib/defaults');
const logger = require('./lib/logger');

const getConfig = function getConfig() {
  const args = [].slice.call(arguments);
  return Object.assign.apply(null, [{}, defaults].concat(args));
};

const loadRoutes = config => {
  config.routes.forEach(route => {
    const routeConfig = Object.assign({}, {route}, config);
    app.use(router(routeConfig));
  });
};

const applyErrorMiddlewares = (config, i18n) => {
  app.use(hof.middleware.notFound({
    logger: config.logger,
    translate: i18n.translate.bind(i18n),
  }));

  app.use(hof.middleware.errors({
    translate: i18n.translate.bind(i18n),
    debug: config.env === 'development'
  }));
};

const getI18n = (config) =>
  hof.i18n({
    path: path.resolve(config.caller, config.translations) + '/__lng__/__ns__.json'
  });

module.exports = options => {

  const bootstrap = {

    server: null,

    use: middleware => {
      app.use(middleware);
      return bootstrap;
    },

    start: config => {
      if (!config) {
        config = getConfig(options, config);
      }

      const protocol = config.protocol === 'http' ? http : https;

      bootstrap.server = protocol.createServer(app);

      applyErrorMiddlewares(config, getI18n(config));

      bootstrap.server.listen(config.port, config.port);
      return bootstrap;
    },

    stop: (callback) => {
      const interval = setInterval(() => {
        bootstrap.server.close(() => {
          clearInterval(interval);
        });
      }, 0);

      if (callback) {
        callback(bootstrap.server);
      }
      return bootstrap;
    }

  };

  const config = getConfig(options);
  const i18n = getI18n(config);

  i18n.on('ready', () => {
    if (config.getCookies === true) {
      app.get('/cookies', (req, res) =>
        res.render('cookies', i18n.translate('cookies')));
    }
    if (config.getTerms === true) {
      app.get('/terms-and-conditions', (req, res) =>
        res.render('terms', i18n.translate('terms')));
    }
  });

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

  serveStatic(app, config);
  settings(app, config);
  sessionStore(app, config);

  app.use(hof.middleware.cookies());

  loadRoutes(config);

  if (config.start !== false) {
    bootstrap.start(config);
  }

  return bootstrap;

};
