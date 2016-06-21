'use strict';

const hof = require('hof');
const app = require('express')();
const churchill = require('churchill');

const router = require('./lib/router');
const serveStatic = require('./lib/serve-static');
const sessionStore = require('./lib/sessions');
const settings = require('./lib/settings');
const defaults = require('./lib/defaults');

const getConfig = config => Object.assign({}, defaults, config);

module.exports = options => {

  const load = (config) => {
    config.routes.forEach((route) => {
      app.use(router(route, config));
    });
  };

  const bootstrap = {

    use: middleware => {
      app.use(middleware);
    },

    start: config => {
      if (!config) {
        let config = getConfig(options);
      }
      return new Promise((resolve, reject) => {
        if (config.startOnInitialise === false) {
          return resolve(bootstrap);
        }
        bootstrap.server = require(config.protocol).createServer(app);
        try {
          bootstrap.server.listen(config.port, config.host, () => {
            resolve(bootstrap);
          });
        } catch (err) {
          reject(err);
        }
      });
    },

    stop: () => {
      bootstrap.server.close();
    }

  };

  const config = getConfig(options);

  if (!config || !config.routes || !config.routes.length) {
    throw new Error('Must be called with a list of routes');
  }

  config.routes.forEach(route => {
    if (!route.fields) {
      throw new Error('Each route must define a relative path to its fields');
    }
    if (!route.views) {
      throw new Error('Each route must define a relative path to its views');
    }
    if (!route.steps) {
      throw new Error('Each route must define a set of one or more steps');
    }
  })

  const logger = config.logger = require('./lib/logger')(config);

  if (config.env !== 'ci') {
    bootstrap.use(churchill(logger));
  }

  serveStatic(app, config);
  settings(app, config);
  sessionStore(app, config)

  load(config);

  if (config.getCookies === true) {
    app.get('/cookies', (req, res) => res.render('cookies'));
  }

  if (config.getTerms === true) {
    app.get('/terms-and-conditions', (req, res) => res.render('terms'));
  }

  bootstrap.use(config.errorHandler);

  return bootstrap.start(config);

};
