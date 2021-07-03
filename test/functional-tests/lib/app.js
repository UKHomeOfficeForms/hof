'use strict';

const express = require('express');
const session = require('express-session');
const mixins = require('hof-template-mixins');
const hogan = require('hogan-express-strict');
const bodyParser = require('body-parser');
const partials = require('express-partial-templates');
const template = require('hof-govuk-template');
const cookieParser = require('cookie-parser');

const Wizard = require('../../../wizard');

module.exports = config => {
  const app = express();
  app.set('views', require('hof-template-partials').views);
  app.set('view engine', 'html');
  app.engine('html', hogan);
  template.setup(app);
  app.use((req, res, next) => {
    req.translate = a => a;
    next();
  });
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cookieParser('not a secret'));
  app.use(session({ secret: 'not a secret', resave: true, saveUninitialized: false }));
  app.use(partials(app));
  app.use(mixins());
  app.use(Wizard(config.steps, config.fields, config.options));
  return app;
};
