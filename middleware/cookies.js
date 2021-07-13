'use strict';

const URI = require('urijs');

const isHealthcheckUrl = (path, healthcheckUrls) => healthcheckUrls.some(url => path.includes(url));

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
      next();
    } else if (req.cookies === undefined || (!Object.keys(req.cookies).length && reqIsCookieCheckRedirect)) {
      const err = new Error('Cookies required');
      err.code = 'NO_COOKIES';
      next(err, req, res, next);
    } else {
      res.cookie(cookieName, 1);

      const redirectURL = (req.originalUrl && req.originalUrl.match(/^\/[^\/\\]/)) ?
        new URI(req.originalUrl).addQuery(encodeURIComponent(paramName)) : '/';

      res.redirect(redirectURL.toString());
    }
  };
};
