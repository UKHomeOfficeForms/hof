'use strict'

const axios = require('axios');
const baseUrl = 'http://localhost:3000/session'

module.exports = superclass => class extends superclass{
  locals(req, res) {
    const superlocals = super.locals(req, res);
    const locals = Object.assign({}, superlocals, {
      id: req.sessionModel.get('id'),
      hideChangeLink: true
    });
    return locals;
  }

  saveValues(req, res, next){
    super.saveValues(req, res, err => {
      console.log('id', req.sessionModel.get('id'))
      if (err) {
        next(err);
      }
      next();
    });
  }
}


