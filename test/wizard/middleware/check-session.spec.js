'use strict';

const checkSession = require('../../../wizard/middleware/check-session');

describe('middleware/check-session', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      path: '/test',
      method: 'GET',
      session: {},
      cookies: {
        'hof-wizard-sc': 1
      }
    };
    res = {
      cookie: sinon.stub()
    };
  });

  it('throws session error if cookie exists, but session flag does not', () => {
    const middleware = checkSession('/route', { options: {} }, {}, '/first');
    middleware(req, res, err => {
      err.should.be.an.instanceOf(Error);
      err.code.should.equal('SESSION_TIMEOUT');
    });
  });

  it('does not throw session error if cookie does not exist', () => {
    req.cookies = {};
    const middleware = checkSession('/route', { options: {} }, {}, '/first');
    middleware(req, res, err => {
      expect(err).to.be.undefined;
    });
  });

  it('does not throw error on GET to first route', () => {
    const middleware = checkSession('/route', { options: {} }, {}, '/first');
    req.path = '/first';
    middleware(req, res, err => {
      expect(err).to.be.undefined;
    });
  });

  it('does not throw session error if controller checkSession option is false', () => {
    const middleware = checkSession('/route', { options: { checkSession: false } }, {}, '/first');
    middleware(req, res, err => {
      expect(err).to.be.undefined;
    });
  });
});
