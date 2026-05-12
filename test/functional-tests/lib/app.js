'use strict';

const fs = require('fs');
const path = require('path');
const express = require('express');
const session = require('express-session');
const mixins = require('../../../frontend').mixins;
const nunjucks = require('nunjucks');
const bodyParser = require('body-parser');
const partials = require('express-partial-templates');
const template = require('../../../frontend').govUKTemplate;
const cookieParser = require('cookie-parser');
const mockPostcode = require('./mock-postcode');

const Wizard = require('../../../wizard');

module.exports = config => {
  const app = express();
  const views = require('../../../frontend').partials.views;
  const govukRoot = path.dirname(require.resolve('govuk-frontend/package.json'));
  const nunjucksEnv = new nunjucks.Environment(
    new nunjucks.FileSystemLoader([
      views,
      govukRoot,
      path.join(govukRoot, 'dist')
    ]),
    {
      autoescape: true,
      noCache: true
    }
  );
  app.set('views', views);
  app.set('view engine', 'njk');
  app.engine('njk', (filePath, context, callback) => {
    const env = context && context.nunjucksEnv ? context.nunjucksEnv : nunjucksEnv;
    if (path.isAbsolute(filePath) && fs.existsSync(filePath)) {
      const source = fs.readFileSync(filePath, 'utf8');
      return env.renderString(source, context, callback);
    }
    return env.render(filePath, context, callback);
  });
  template({}, app);
  app.use((req, res, next) => {
    res.locals.nunjucksEnv = nunjucksEnv;
    next();
  });
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
  app.use(mockPostcode);
  return app;
};
