'use strict';

const axios = require('axios');
const baseUrl = 'http://localhost:3000/session';


module.exports = superclass => class extends superclass {
  locals(req, res) {
    const superlocals = super.locals(req, res);
    const data = Object.assign({}, {
      id: req.sessionModel.get('toDelete').id
    });
    const locals = Object.assign({}, superlocals, data);

    return locals;
  }

  getValues(req, res, next) {
    if (!req.sessionModel.get('toDelete')) {
      res.redirect('/sessions');
    }
    super.getValues(req, res, next);
  }

  saveValues(req, res, next) {
    super.saveValues(req, res, err => {
      if (err) {
        next(err);
      }
      if (req.body.confirm) {
        const id = req.sessionModel.get('toDelete').id;
        axios.delete(baseUrl + '/' + id)
          .then(function () {
            req.sessionModel.unset('toDelete');
            res.redirect('/sessions');
          });
      } else {
        req.sessionModel.unset('toDelete');
        res.redirect('/sessions');
      }
    });
  }
};
