'use strict';

module.exports = (route, controller, steps, first) => (req, res, next) => {
  if (controller.options.checkSession !== false && (req.method === 'POST' || req.path !== first)) {
    if (req.cookies['hof-wizard-sc'] && req.session.exists !== true) {
      const err = new Error('Session expired');
      err.code = 'SESSION_TIMEOUT';
      return next(err);
    }
  }
  req.session.exists = true;
  res.cookie('hof-wizard-sc', 1);
  return next();
};
