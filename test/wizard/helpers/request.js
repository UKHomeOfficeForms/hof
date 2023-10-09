'use strict';

const reqres = require('axios');
const SessionModel = require('../../../wizard/model');

module.exports = settings => {
  const req = reqres.req(settings);
  req.sessionModel = req.sessionModel || new SessionModel({}, {
    session: req.session,
    key: 'hof-wizard-test'
  });
  return req;
};
