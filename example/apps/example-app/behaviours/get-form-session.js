'use strict';

const axios = require('axios');
const { response } = require('express');
const { functions } = require('lodash');
const baseUrl = 'http://localhost:3000/session'
const moment = require('moment')
const _ = require('lodash');
const { error } = require('winston');

module.exports = superclass => class extends superclass{
  locals(req, res) {
    const superlocals = super.locals(req, res);
    const data = Object.assign({}, {
      sessionResults: _.sortBy(req.sessionResults, 'id').reverse(),
    });
    const locals = Object.assign({}, superlocals, data);
    return locals;
  }

  getValues(req, res, next) {
    super.getValues(req, res, err => {
      if (err) {
        next(err)
      }
      axios.get(baseUrl)
      .then(function(response){
        const resBody = response.data
        if (resBody && resBody.length && resBody[0].session){
          req.sessionResults = [];
          resBody.forEach(form => {
            const created = moment(form.created_at)
            const updated = moment(form.updated_at)

            const formSession = {
              id: form.id,
              session: JSON.stringify(form.session),
              createdAt: created.format('DD MMMM YYYY'),
              updatedAt: updated.format('DD MMMM YYYY')
            }
            req.sessionResults.push(formSession)
          })
          console.log('session results', req.sessionResults)
        }
      })
      .catch((err) => {
        console.log(err)
      })
      .then(function(){
        next()
      })     
    })
  }  
}
