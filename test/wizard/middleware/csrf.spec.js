'use strict';

const csrf = require('../../../wizard/middleware/csrf');
const request = require('../helpers/request');

describe('CSRF protection', () => {
  let req;
  let res;
  let middleware;

  beforeEach(() => {
    req = request();
    res = { locals: {} };
    middleware = csrf('/', { options: {} });
  });

  it('accepts GET requests without a token', done => {
    req.method = 'GET';
    middleware(req, res, err => {
      expect(err).to.be.undefined;
      done();
    });
  });

  it('accepts HEAD requests without a token', done => {
    req.method = 'HEAD';
    middleware(req, res, err => {
      expect(err).to.be.undefined;
      done();
    });
  });

  it('accepts OPTIONS requests without a token', done => {
    req.method = 'OPTIONS';
    middleware(req, res, err => {
      expect(err).to.be.undefined;
      done();
    });
  });

  it('generates a token on GET requests', done => {
    req.method = 'GET';
    middleware(req, res, () => {
      res.locals['csrf-token'].should.be.a('string');
      done();
    });
  });

  it('validates token in body on POST requests', done => {
    req.method = 'GET';
    middleware(req, res, () => {
      const token = res.locals['csrf-token'];
      req.method = 'POST';
      req.body['x-csrf-token'] = token;
      middleware(req, res, err => {
        expect(err).to.be.undefined;
        done();
      });
    });
  });

  it('validates token in body on PUT requests', done => {
    req.method = 'GET';
    middleware(req, res, () => {
      const token = res.locals['csrf-token'];
      req.method = 'PUT';
      req.body['x-csrf-token'] = token;
      middleware(req, res, err => {
        expect(err).to.be.undefined;
        done();
      });
    });
  });

  it('validates token in headers on DELETE requests', done => {
    req.method = 'GET';
    middleware(req, res, () => {
      const token = res.locals['csrf-token'];
      req.method = 'DELETE';
      req.headers['x-csrf-token'] = token;
      middleware(req, res, err => {
        expect(err).to.be.undefined;
        done();
      });
    });
  });

  it('validates token in headers on PATCH requests', done => {
    req.method = 'GET';
    middleware(req, res, () => {
      const token = res.locals['csrf-token'];
      req.method = 'PATCH';
      req.headers['x-csrf-token'] = token;
      middleware(req, res, err => {
        expect(err).to.be.undefined;
        done();
      });
    });
  });

  it('passes error to callback if token in body is invalid', done => {
    req.method = 'POST';
    req.body['x-csrf-token'] = 'invalidtoken';
    middleware(req, res, err => {
      err.code.should.equal('CSRF_ERROR');
      done();
    });
  });

  it('passes error to callback if token in headers is invalid', done => {
    req.method = 'POST';
    req.headers['x-csrf-token'] = 'invalidtoken';
    middleware(req, res, err => {
      err.code.should.equal('CSRF_ERROR');
      done();
    });
  });
});
