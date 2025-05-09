'use strict';

const _ = require('lodash');
const bodyParser = require('body-parser');


module.exports = async (app, config) => {
  app.use((req, res, next) => {
    res.locals.assetPath = '/public';
    next();
  });

  app.use(bodyParser.urlencoded({
    extended: true
  }));

  app.use(bodyParser.json());

  app.use((req, res, next) => {
    res.locals.baseUrl = req.baseUrl;
    next();
  });

  // Trust proxy for secure cookies
  app.set('trust proxy', 1);

  return app;
};
