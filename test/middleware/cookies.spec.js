'use strict';

const httpMock = require('node-mocks-http');

describe('cookies', () => {
  let middleware;
  let req;
  let res;
  let next;

  beforeEach(() => {
    res = httpMock.createResponse({
      eventEmitter: require('events').EventEmitter
    });
    middleware = require('../../middleware/cookies')({
      'cookie-name': 'hof_cookie',
      'param-name': 'hof_param',
      protocpl: 'http',
      env: 'development'
    });
    next = sinon.stub();
  });

  describe('middleware (testCookieSupport)', () => {
    beforeEach(() => {
      req = httpMock.createRequest({
        method: 'GET',
        url: '/my-hof-journey'
      });

      res.cookie = sinon.stub();
      res.redirect = sinon.stub();
    });

    it('passes to the next middleware when a cookie is set', () => {
      req.cookies = {
        foo: 'bar'
      };
      middleware(req, res, next);
      next.should.have.been.calledWith();
    });

    it('attempts to set a cookie if one is not available', () => {
      middleware(req, res);
      res.cookie.should.have.been.calledOnce.calledWithExactly('hof_cookie', 1, {
        sameSite: 'lax', secure: false, httpOnly: true
      });
    });

    it('creates a secure cookie if protocol https', () => {
      middleware = require('../../middleware/cookies')({
        'cookie-name': 'hof_cookie',
        'param-name': 'hof_param',
        protocol: 'https'
      });
      middleware(req, res);
      res.cookie.should.have.been.calledOnce.calledWithExactly('hof_cookie', 1, {
        sameSite: 'lax', secure: true, httpOnly: true
      });
    });

    it('creates a secure cookie if protocol https', () => {
      middleware = require('../../middleware/cookies')({
        'cookie-name': 'hof_cookie',
        'param-name': 'hof_param',
        protocol: 'http',
        env: 'production'
      });
      middleware(req, res);
      res.cookie.should.have.been.calledOnce.calledWithExactly('hof_cookie', 1, {
        sameSite: 'lax', secure: true, httpOnly: true
      });
    });

    it('redirects to self with query parameter', () => {
      middleware(req, res);
      res.redirect.should.have.been.calledWith('/my-hof-journey?' + encodeURIComponent('hof_param'));
    });

    it('preserves existing query parameters on redirect', () => {
      req = httpMock.createRequest({
        method: 'GET',
        url: '/my-hof-journey?existing-query'
      });
      middleware(req, res);
      res.redirect.should.have.been.calledWith('/my-hof-journey?existing-query&' + encodeURIComponent('hof_param'));
    });

    it('raises an error when a cookie could not be set with cookies undefined', () => {
      req.cookies = undefined;
      req.query = {
        hof_param: true
      };
      middleware(req, res, next);
      const err = new Error('Cookies required');
      err.code = 'NO_COOKIES';

      const errArg = next.firstCall.args[0];
      expect(errArg).to.be.instanceof(Error);
      expect(errArg.message).to.equal('Cookies required');
      expect(next.firstCall.args[1]).to.eql(req);
      expect(next.firstCall.args[2]).to.eql(res);
      expect(next.firstCall.args[3]).to.eql(next);
    });

    it('raises an error when a cookie could not be set with cookies empty object', () => {
      req.cookies = {};
      req.query = {
        hof_param: true
      };
      middleware(req, res, next);
      const err = new Error('Cookies required');
      err.code = 'NO_COOKIES';

      const errArg = next.firstCall.args[0];
      expect(errArg).to.be.instanceof(Error);
      expect(errArg.message).to.equal('Cookies required');
      expect(next.firstCall.args[1]).to.eql(req);
      expect(next.firstCall.args[2]).to.eql(res);
      expect(next.firstCall.args[3]).to.eql(next);
    });

    it('redirects to self with hof query when no cookies set and attempting to redirect to malicious site', () => {
      req = httpMock.createRequest({
        method: 'GET',
        url: '//bbc.co.uk'
      });
      middleware(req, res);
      res.redirect.should.have.been.calledWith('/?hof_param');
    });

    it('does not raise an error when is a default healthcheck url', () => {
      req.cookies = {};
      req.query = {
        hof_param: true
      };

      const healthcheckPaths = [
        '/healthz',
        '/readyz',
        '/livez'
      ];

      healthcheckPaths.forEach(url => {
        req.path = url;
        middleware(req, res, next);

        next.should.have.been.calledWith();

        const err = new Error();
        err.code = 'NO_COOKIES';
        next.should.not.have.been.calledWith(err, req, res, next);
      });
    });
  });
});
