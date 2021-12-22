'use strict';

module.exports = superclass => class extends superclass {
  locals(req, res) {
    const superlocals = super.locals(req, res);
    const locals = Object.assign({}, superlocals, {
      id: req.sessionModel.get('id'),
      hideChangeLink: true
    });
    return locals;
  }

  saveValues(req, res, next) {
    super.saveValues(req, res, err => {
      if (err) {
        next(err);
      }
      next();
    });
  }
};
