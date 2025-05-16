'use strict';

module.exports = (req, res, next) => {
  if (process.env.REDIRECT_TO_PAGE === 'true' && !['/healthz', '/readyz', '/livez'].includes(req.path)) {
    return res.status(503).render('service-down');
  }
  next();
};
