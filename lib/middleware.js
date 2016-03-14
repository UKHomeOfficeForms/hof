'use strict';

module.exports = function generateMiddleware(options) {
  var checkName = 'hof-cookie-check';

  options = options || {};

  var cookieName = options['cookie-name'] || checkName;
  var paramName = options['param-name'] || checkName;

  var middleware = function testCookieSupport(req, res, next) {
    if (req.cookies && Object.keys(req.cookies).length) {
      // Cookies are supported; Continue
      next();
    } else if (req.query[paramName] !== undefined) {
      // Cookies are NOT supported; Raise an error
      var err = new Error('Cookies required');

      err.code = 'NO_COOKIES';

      next(err, req, res, next);
    } else {
      // Test whether cookies are supported
      res.cookie(cookieName, 1);
      res.redirect(req.originalUrl + '?' + encodeURIComponent(paramName));
    }
  };

  return middleware;
};
