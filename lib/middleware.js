'use strict';

var middleware = require('express').Router();

module.exports = function generateMiddleware(options) {

  options = options || {};

  options['cookie-name'] = options['cookie-name'] || 'hof-cookie-check';

  middleware.get('/cookies-required', function renderCookiesRequired(req, res) {
    res.render('cookies-required');
  });

  middleware.get('/check-cookies', function checkCookie(req, res) {
    if (Object.keys(req.cookies).length && req.cookies[options['cookie-name']]) {
      res.redirect(req.cookies[options['cookie-name']]);
    } else {
      res.redirect('/cookies-required');
    }
  });

  middleware.use(function ensureCookie(req, res, next) {
    if (Object.keys(req.cookies).length && req.cookies[options['cookie-name']]) {
      next();
    } else {
      res.cookie(options['cookie-name'], req.originalUrl);
      res.redirect('/check-cookies');
    }
  });

  return middleware;
};
