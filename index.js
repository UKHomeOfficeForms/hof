'use strict';

const app = require('express')();
// const churchill = require('churchill');
const hof = require('hof');
const router = require('./lib/router');
const statics = require('./lib/statics');
const sessions = require('./lib/sessions');
const settings = require('./lib/settings');
const defaults = require('./lib/defaults');

const getConfig = options =>
  Object.assign({}, defaults, options);

module.exports = options => {

  const bootstrap = {

    use: middleware => {
      app.use(middleware);
    },

    start: config => {
      if (!this.config) {
        this.config = getConfig(config);
      }
      return new Promise((resolve, reject) => {
        if (this.config.startOnInitialise === false) {
          return resolve(bootstrap);
        }
        bootstrap.server = require(this.config.protocol).createServer(app);
        try {
          bootstrap.server.listen(this.config.port, this.config.host, () => {
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

  const load = () => {
    this.config.routes.forEach((route) => {
      app.use(router(route, this.config));
    });
  };

  return (config => {

    if (!config || !config.routes || !config.routes.length) {
      throw new Error('Must be called with a list of routes');
    }

    config.routes.forEach(route => {
      if (!route.fields) {
        throw new Error('Each route must define a relative path to its fields');
      }
      if (!route.templates) {
        throw new Error('Each route must define a relative path to its templates');
      }
      if (!route.steps) {
        throw new Error('Each route must define a set of one or more steps');
      }
    })

    this.config = getConfig(config);

    statics(app, this.config);
    settings(app, this.config);
    sessions(app, this.config);

    load();

    if (this.config.getCookies === true) {
      app.get('/cookies', (req, res) => res.render('cookies'));
    }

    if (this.config.getTerms === true) {
      app.get('/terms-and-conditions', (req, res) => res.render('terms'));
    }

    bootstrap.use(this.config.errorHandler || hof.middleware.errors);

    return bootstrap.start();

  }).call(null, options);

};
