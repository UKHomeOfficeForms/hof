'use strict';

const reqres = require('reqres');
const Model = require('../model');

process.env.NODE_ENV = 'test';

global.chai = require('chai').use(require('sinon-chai'));
global.should = chai.should();
global.expect = chai.expect;
global.sinon = require('sinon');
global.proxyquire = require('proxyquire');
global.request = reqres.req;
global.response = reqres.res;
global.reqres = reqres;
global.sandbox = require('mocha-sandbox');

global.hof_request = options => {
  const opts = options || {};
  const req = reqres.req(opts);
  req.form = req.form || {};
  req.form.values = req.form.values || {};
  req.form.options = req.form.options || {};
  req.sessionModel = new Model(opts.session);
  req.translate = key => key;
  req.log = () => {};
  return req;
};

process.setMaxListeners(0);
process.stdout.setMaxListeners(0);
