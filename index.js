'use strict';

const app = require('express')();
const churchill = require('churchill');
const path = require('path');
const router = require('./lib/router');
const serveStatic = require('./lib/serve-static');
const sessionStore = require('./lib/sessions');
const settings = require('./lib/settings');
const defaults = require('./lib/defaults');

const getConfig = function getConfig() {
  const args = [].slice.call(arguments);
  return Object.assign.apply(null, [{}, defaults].concat(args));
};

module.exports = options => {

  const load = (config) => {
    config.routes.forEach((route) => {
      const routeConfig = Object.assign({}, {route}, config);
      app.use(router(routeConfig));
    });
  };

  const config = getConfig(options);

  const i18n = require('hof').i18n({
    path: path.resolve(config.caller, config.translations) + '/__lng__/__ns__.json'
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
    config.logger = require('./lib/logger')(config);
    app.use(churchill(config.logger));
  }

  serveStatic(app, config);
  settings(app, config);
  sessionStore(app, config);

  load(config);

  return new Promise((resolve) => {
    i18n.on('ready', () => {
      if (config.getCookies === true) {
        app.get('/cookies', (req, res) => res.render('cookies', i18n.translate('cookies')));
      }
      if (config.getTerms === true) {
        app.get('/terms-and-conditions', (req, res) => res.render('terms', i18n.translate('terms')));
      }
      app.use(require('hof').middleware.errors({
        translate: i18n.translate.bind(i18n),
        debug: config.env === 'development'
      }));
      resolve(app);
    });
  });
};
