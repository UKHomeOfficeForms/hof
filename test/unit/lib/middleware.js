'use strict';

var httpMock = require('node-mocks-http');

describe('lib/middleware', function () {

  var middleware = require('../../../lib/middleware');

  describe('cookies', function () {
    var req;
    var res;

    beforeEach(function () {
      res = httpMock.createResponse({
        eventEmitter: require('events').EventEmitter
      });
      middleware = require('../../../lib/middleware')({
        'cookie-name': 'hof_cookie'
      });
    });

    describe('cookie middleware (ensureCookie)', function () {

      beforeEach(function () {
        req = httpMock.createRequest({
          method: 'GET',
          url: '/my-hof-journey',
        });

        res.cookie = sinon.stub();

        res.redirect = sinon.stub();
      });

      it('attempts to set a cookie if one is not available', function () {
        middleware.handle(req, res);

        res.cookie.should.have.been.calledWith('hof_cookie', '/my-hof-journey');
      });

      it('redirects to /cookies-required', function () {
        middleware.handle(req, res);

        res.redirect.should.have.been.calledWith('/cookies-required?location=' + encodeURIComponent('/my-hof-journey'));
      });

    });

    describe('/cookies-required', function () {

      beforeEach(function () {
        req = httpMock.createRequest({
          method: 'GET',
          url: '/cookies-required',
          query: {
            location: '/my-hof-journey'
          }
        });

        res.redirect = sinon.stub();
        res.render = sinon.stub();
      });

      it('renders cookies-required if no cookies are set', function () {
        req.cookies = {};

        middleware.handle(req, res);

        res.render.should.have.been.calledWith('cookies-required');
      });

      it('renders cookies-required if no configured cookie is set', function () {
        req.cookies = {
          'hof-cookie-check': '/my-hof-journey'
        };

        middleware.handle(req, res);

        res.render.should.have.been.calledWith('cookies-required');
      });

      it('renders cookies-required if cookie does not match query string param', function () {
        req.cookies = {
          'hof_cookie': '/HaX0r'
        };

        middleware.handle(req, res);

        res.render.should.have.been.calledWith('cookies-required');
      });

      it('redirects to url set in the cookie and query string param', function () {
        req.cookies = {
          'hof_cookie': '/my-hof-journey'
        };

        middleware.handle(req, res);

        res.redirect.should.have.been.calledWith('/my-hof-journey');
      });

    });

  });

});
