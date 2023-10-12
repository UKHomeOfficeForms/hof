'use strict';

const URI = require('urijs');

const isHealthcheckUrl = (path, healthcheckUrls) => healthcheckUrls.some(url => path.includes(url));
const secureHttps = config => config.protocol === 'https' || config.env === 'production';

module.exports = options => {
  const checkName = 'hof-cookie-check';
  const cookieName = (options || {})['cookie-name'] || checkName;
  const paramName = (options || {})['param-name'] || checkName;
  let healthcheckUrls;

  if (options && options.healthcheckUrls) {
    healthcheckUrls = options.healthcheckUrls;
  } else {
    healthcheckUrls = ['/healthz', '/livez', '/readyz'];
  }

  return (req, res, next) => {
    const reqIncludesCookies = req.cookies && Object.keys(req.cookies).length;
    const reqIsCookieCheckRedirect = req.query[paramName] !== undefined;

    if (reqIncludesCookies || isHealthcheckUrl(req.path, healthcheckUrls)) {
      const prefs = 'cookie_preferences' in req.cookies ? JSON.parse(req.cookies.cookie_preferences) : {};
      res.locals.cookiesAccepted = Boolean(prefs.usage);
      next();
    } else if (req.cookies === undefined || (!Object.keys(req.cookies).length && reqIsCookieCheckRedirect)) {
      const err = new Error('Cookies required');
      err.code = 'NO_COOKIES';
      next(err, req, res, next);
    } else {
      // Set samesite to lax to allow setting cookies on redirects from Gov.UK
      res.cookie(cookieName, 1, { sameSite: 'lax', secure: secureHttps(options), httpOnly: true });

      const uriClean = req.originalUrl && req.originalUrl.match(/^\/[^\/\\]/);
      const uriToRedirect = uriClean ? req.originalUrl : '/';
      const redirectURL = new URI(uriToRedirect).addQuery(encodeURIComponent(paramName));

      res.redirect(redirectURL.toString());
    }
  };
};
