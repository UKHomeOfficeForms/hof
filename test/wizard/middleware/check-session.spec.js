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
    const middleware = checkSession('/route', { options: {} }, {}, '/first', { protocol: 'http' });
    middleware(req, res, err => {
      err.should.be.an.instanceOf(Error);
      err.code.should.equal('SESSION_TIMEOUT');
    });
  });

  it('does not throw session error if cookie does not exist', () => {
    req.cookies = {};
    const middleware = checkSession('/route', { options: {} }, {}, '/first', { protocol: 'http' });
    middleware(req, res, err => {
      expect(err).to.be.undefined;
    });
  });

  it('does not throw error on GET to first route', () => {
    const middleware = checkSession('/route', { options: {} }, {}, '/first', { protocol: 'http' });
    req.path = '/first';
    middleware(req, res, err => {
      expect(err).to.be.undefined;
    });
  });

  it('does not throw session error if controller checkSession option is false', () => {
    const middleware = checkSession('/route', { options: { checkSession: false } }, {}, '/first', { protocol: 'http' });
    middleware(req, res, err => {
      expect(err).to.be.undefined;
    });
  });

  it('calls the res cookie with insecure cookie and defaults if http', () => {
    const middleware = checkSession('/route', { options: { checkSession: false } }, {}, '/first', { protocol: 'http' });
    middleware(req, res, () => {
      res.cookie.should.have.been.calledOnce.calledWithExactly('hof-wizard-sc', 1, {
        sameSite: 'lax', secure: false, httpOnly: true
      });
    });
  });

  it('calls the res cookie with secure cookie and deafults if https', () => {
    const middleware = checkSession('/route',
      { options: { checkSession: false } },
      {},
      '/first',
      { protocol: 'https' }
    );
    middleware(req, res, () => {
      res.cookie.should.have.been.calledOnce.calledWithExactly('hof-wizard-sc', 1, {
        sameSite: 'lax', secure: true, httpOnly: true
      });
    });
  });

  it('calls the res cookie with insecure cookie and deafults if http and not production', () => {
    const middleware = checkSession('/route',
      { options: { checkSession: false } },
      {},
      '/first',
      { protocol: 'http', env: 'development' }
    );
    middleware(req, res, () => {
      res.cookie.should.have.been.calledOnce.calledWithExactly('hof-wizard-sc', 1, {
        sameSite: 'lax', secure: false, httpOnly: true
      });
    });
  });

  it('calls the res cookie with secure cookie and deafults if http and production', () => {
    const middleware = checkSession('/route',
      { options: { checkSession: false } },
      {},
      '/first',
      { protocol: 'http', env: 'production' }
    );
    middleware(req, res, () => {
      res.cookie.should.have.been.calledOnce.calledWithExactly('hof-wizard-sc', 1, {
        sameSite: 'lax', secure: true, httpOnly: true
      });
    });
  });
});
