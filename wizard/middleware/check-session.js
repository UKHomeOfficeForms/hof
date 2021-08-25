'use strict';

const secureHttps = config => config.protocol === 'https' || config.env === 'production';

module.exports = (route, controller, steps, first, settings) => (req, res, next) => {
  if (controller.options.checkSession !== false && (req.method === 'POST' || req.path !== first)) {
    if (req.cookies['hof-wizard-sc'] && req.session.exists !== true) {
      const err = new Error('Session expired');
      err.code = 'SESSION_TIMEOUT';
      return next(err);
    }
  }
  req.session.exists = true;
  // Set samesite to lax to allow setting cookies on redirects from Gov.UK
  res.cookie('hof-wizard-sc', 1, { sameSite: 'lax', secure: secureHttps(settings), httpOnly: true });
  return next();
};
