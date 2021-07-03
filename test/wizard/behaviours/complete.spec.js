'use strict';

const BaseController = require('hof-form-controller');
const mix = require('mixwith').mix;
const Complete = require('../../../wizard/behaviours').complete;
const APPLICATION_COMPLETE = require('../../../wizard/util/constants').APPLICATION_COMPLETE;
const request = require('../helpers/request');
const response = require('../helpers/response');
const sandbox = require('mocha-sandbox');

class Controller extends mix(BaseController).with(Complete) {}

describe('Complete Behaviour', () => {
  let req;
  let res;
  let controller;

  beforeEach(() => {
    req = request();
    res = response();
  });

  describe('constructor', () => {
    it('sets the `allowPostComplete` option on the `next` step to true', () => {
      const steps = {
        '/one': {
          next: '/two'
        },
        '/two': {
        }
      };
      controller = new Controller({ steps, next: '/two' });
      steps['/two'].allowPostComplete.should.equal(true);
    });
  });

  describe('successHandler', () => {
    beforeEach(() => {
      controller = new Controller({});
      sinon.stub(BaseController.prototype, 'successHandler').yieldsAsync();
    });

    afterEach(() => {
      BaseController.prototype.successHandler.restore();
    });

    it('marks session model as complete', done => {
      controller.successHandler(req, res, sandbox(() => {
        req.sessionModel.get(APPLICATION_COMPLETE).should.equal(true);
      }, done));
    });

    it('passes through to super method', done => {
      controller.successHandler(req, res, sandbox(() => {
        BaseController.prototype.successHandler.should.have.been.calledWith(req, res);
      }, done));
    });
  });
});
