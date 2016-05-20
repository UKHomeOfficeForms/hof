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
      app.use(router(Object.assign({}, this.config, route)));
    });
  };

  return (config => {

    if (!config || !config.routes || !config.routes.length) {
      throw new Error('Must be called with a list of routes');
    }

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

    if (this.config.startOnInitialise === true) {
      return bootstrap.start();
    }
  }).call(null, options);

};
