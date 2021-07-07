'use strict';

const csrf = require('csrf')();

module.exports = (route, controller) => {
  if (controller.options.csrf !== false) {
    return (req, res, next) => {
      const verify = () => {
        const secret = req.sessionModel.get('csrf-secret');
        const safeMethods = ['GET', 'HEAD', 'OPTIONS'];

        if (!secret) {
          csrf.secret((err, sec) => {
            if (err) {
              next(err);
            }
            req.sessionModel.set('csrf-secret', sec);
            verify();
          });
        } else if (safeMethods.indexOf(req.method) > -1) {
          // The HTTP method is safe. No need to verify a
          // token. Instead, provide a new one for future
          // verification.
          res.locals['csrf-token'] = csrf.create(secret);
          next();
        } else {
          // The HTTP method is assumed to be unsafe so
          // require verification.

          // Token can be provided in either the request body
          // or the headers. Preference is given to the body.
          const token = req.body['x-csrf-token']
          || req.headers['x-csrf-token'];

          if (!csrf.verify(secret, token)) {
            next({ code: 'CSRF_ERROR' });
          } else {
            next();
          }
        }
      };

      verify();
    };
  }
  return (req, res, next) => next();
};
