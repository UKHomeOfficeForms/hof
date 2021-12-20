'use strict';

const axios = require('axios');
const { response } = require('express');
const { functions } = require('lodash');
const baseUrl = 'http://localhost:3000/session'

module.exports = superclass => class extends superclass{
  saveValues(req, res, next){
    super.saveValues(req, res, err => {
      if (err) {
        next(err)
      }
      // initially just try get it talking 
      const session = req.sessionModel.toJSON();
      const options = {
        headers: {'content-type': 'application/json'} 
      }

      if (req.body['save-and-exit']) {
        axios.post( baseUrl, {
          id: req.sessionModel.get('id'), 
          session: JSON.stringify(session)
        }, options)
        .then (function(response){
            req.sessionModel.reset();
            return res.redirect('/sessions');
        })
        .catch((err) => {
          console.log(err)
        })
      } else {
        next();
      }
    })   
  }
}
