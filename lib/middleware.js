'use strict';

var middleware = require('express').Router();

module.exports = function generateMiddleware(options) {

  options = options || {};

  var cookieName = options['cookie-name'] || 'hof-cookie-check';

  middleware.get('/cookies-required', function checkCookie(req, res) {
    var location = req.query.location;

    if (Object.keys(req.cookies).length &&
        req.cookies[cookieName] &&
        req.cookies[cookieName] === location) {
      res.redirect(location);
    } else {
      res.render('cookies-required');
    }
  });

  middleware.use(function ensureCookie(req, res, next) {
    if (Object.keys(req.cookies).length && req.cookies[options['cookie-name']]) {
      next();
    } else {
      res.cookie(options['cookie-name'], req.originalUrl);
      res.redirect('/cookies-required?location=' + encodeURIComponent(req.originalUrl));
    }
  });

  return middleware;
};
