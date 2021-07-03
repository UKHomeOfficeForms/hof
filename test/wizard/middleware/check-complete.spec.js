'use strict';

const check = require('../../../wizard/middleware/check-complete');
const APPLICATION_COMPLETE = require('../../../wizard/util/constants').APPLICATION_COMPLETE;
const request = require('../helpers/request');
const response = require('../helpers/response');

describe('Check complete middleware', () => {
  let req;
  let res;
  let next;
  let middleware;

  beforeEach(() => {
    req = request();
    res = response();
    next = sinon.stub();
    middleware = check('/', { options: {} }, {}, '/first');
  });

  it('redirects to the first step if the model is marked as complete', () => {
    req.sessionModel.set(APPLICATION_COMPLETE, true);
    middleware(req, res, () => {});
    res.redirect.should.have.been.calledWith('/first');
  });

  it('does not pass through if the model is marked as complete', () => {
    req.sessionModel.set(APPLICATION_COMPLETE, true);
    middleware(req, res, next);
    next.should.not.have.been.called;
  });

  it('includes req.baseUrl in redirect', () => {
    req.baseUrl = '/foo';
    req.sessionModel.set(APPLICATION_COMPLETE, true);
    middleware(req, res, () => {});
    res.redirect.should.have.been.calledWith('/foo/first');
  });

  it('passes through if the model is not marked as complete', () => {
    req.sessionModel.unset(APPLICATION_COMPLETE);
    middleware(req, res, next);
    res.redirect.should.not.have.been.called;
    next.should.have.been.calledWithExactly();
  });

  it('passes through if the controller has an `allowPostComplete` option set to true', () => {
    middleware = check('/', { options: { allowPostComplete: true } }, {}, '/first');
    req.sessionModel.unset(APPLICATION_COMPLETE);
    middleware(req, res, next);
    res.redirect.should.not.have.been.called;
    next.should.have.been.calledWithExactly();
  });
});
