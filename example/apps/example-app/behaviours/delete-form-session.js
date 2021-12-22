'use strict';

const axios = require('axios');
const baseUrl = 'http://localhost:3000/session';

module.exports = superclass => class extends superclass {
  saveValues(req, res, next) {
    super.saveValues(req, res, err => {
      if (err) {
        next(err);
      }
      if (req.sessionModel.get('id')) {
        const id = req.sessionModel.get('id');
        axios.delete(baseUrl + '/' + id)
          .then(function () {
            next;
          });
      }
      next();
    });
  }
};
