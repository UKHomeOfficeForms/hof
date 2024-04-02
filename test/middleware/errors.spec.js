'use strict';

const reqres = require('reqres');

describe('errors', () => {
  let middleware;
  let req;
  let res;
  let next;
  let translate;

  beforeEach(() => {
    translate = sinon.stub().returnsArg(0);
    middleware = require('../../middleware/errors')({translate: translate});
    next = sinon.stub();
  });

  describe('middleware', () => {
    const html = '<html></html>';

    beforeEach(() => {
      res = reqres.res();
      req = reqres.req({
        path: '/my-hof-journey',
        method: 'GET'
      });
      res.render = sinon.stub();
    });

    it('translates when a translate function is provided', () => {
      const err = {};
      middleware(err, req, res, next);
      translate.should.have.been.called;
    });

    it('accepts four arguments', () => {
      middleware.should.have.length(4);
    });

    describe('startLink', () => {
      beforeEach(() => {
        res.render.onCall(0).yields('error', html);
      });

      it('set to baseUrl when there is a baseUrl', () => {
        req.path = '/baseUrl/my-hof-journey';
        res.render = sinon.stub();
        res.render.onCall(0).yields('error', html);

        const err = {};
        const locals = {
          startLink: '/baseUrl'
        };
        middleware(err, req, res, next);

        res.render.should.have.been.calledWith('error', sinon.match(locals));
      });

      it('set to `/` when there is no baseUrl', () => {
        req.path = '/my-hof-journey';
        res.render = sinon.stub();
        res.render.onCall(0).yields('error', html);

        const err = {};
        const locals = {
          startLink: '/'
        };
        middleware(err, req, res, next);

        res.render.should.have.been.calledWith('error', sinon.match(locals));
      });
    });

    describe('when only the default error template is available', () => {
      beforeEach(() => {
        res.render.onCall(0).yields('error', html);
      });

      it('renders the `error` template with `408` status', () => {
        res.render = sinon.stub();
        res.render.onCall(0).yields('error', html);

        const err = {
          code: 'SESSION_TIMEOUT'
        };

        const locals = {
          content: {message: 'errors.session.message', title: 'errors.session.title'},
          error: err,
          showStack: false,
          startLink: '/'
        };

        middleware(err, req, res, next);

        res.status.should.have.been.calledWith(408);
        res.render.should.have.been.calledWith('session-timeout', sinon.match(locals));
        res.render.should.have.been.calledWith('error', sinon.match(locals));
      });

      it('renders the `error` template with `403` status', () => {
        const err = {
          code: 'NO_COOKIES'
        };

        const locals = {
          content: {message: 'errors.cookies-required.message', title: 'errors.cookies-required.title'},
          error: err,
          showStack: false,
          startLink: '/'
        };

        middleware(err, req, res, next);

        res.status.should.have.been.calledWith(403);
        res.render.should.have.been.calledWith('cookie-error', sinon.match(locals));
        res.render.should.have.been.calledWith('error', sinon.match(locals));
      });

      it('renders the `error` template with `401` status', () => {
        const err = {
          code: 'UNAUTHORISED'
        };

        const locals = {
          content: {message: 'errors.401.description', title: 'errors.401.title'},
          error: err,
          showStack: false,
          startLink: '/'
        };

        middleware(err, req, res, next);
        res.status.should.have.been.calledWith(401);
        res.render.should.have.been.calledWith('401', sinon.match(locals));
        res.render.should.have.been.calledWith('error', sinon.match(locals));
      });

      it('renders the `error` template with `500` status', () => {
        const err = {
          code: 'UNKNOWN'
        };

        const locals = {
          content: {message: 'errors.default.message', title: 'errors.default.title'},
          error: err,
          showStack: false,
          startLink: '/'
        };

        middleware(err, req, res, next);

        res.status.should.have.been.calledWith(500);
        res.render.should.have.been.calledWith('error', sinon.match(locals));
      });
    });

    describe('when specific templates are available', () => {
      it('renders the `session-timeout` template with `408` status for session timeouts', () => {
        res.render.withArgs('session-timeout').yields(null, html);

        const err = {
          code: 'SESSION_TIMEOUT'
        };

        const locals = {
          content: {message: 'errors.session.message', title: 'errors.session.title'},
          error: err,
          showStack: false,
          startLink: '/'
        };

        middleware(err, req, res, next);

        res.status.should.have.been.calledWith(408);
        res.render.should.have.been.calledWith('session-timeout', sinon.match(locals));
        res.send.should.have.been.calledWith(html);
      });

      it('renders the `cookie-error` template with `403` status for cookie errors', () => {
        res.render.withArgs('cookie-error').yields(null, html);

        const err = {
          code: 'NO_COOKIES'
        };

        const locals = {
          content: {message: 'errors.cookies-required.message', title: 'errors.cookies-required.title'},
          error: err,
          showStack: false,
          startLink: '/'
        };
        middleware(err, req, res, next);
        res.status.should.have.been.calledWith(403);
        res.render.should.have.been.calledWith('cookie-error', sinon.match(locals));
        res.send.should.have.been.calledWith(html);
      });
      it('renders the `401` template with `401` status for unauthorised', () => {
        res.render.withArgs('401').yields(null, html);

        const err = {
          code: 'UNAUTHORISED'
        };

        const locals = {
          content: {message: 'errors.401.description', title: 'errors.401.title'},
          error: err,
          showStack: false,
          startLink: '/'
        };
        middleware(err, req, res, next);
        res.status.should.have.been.calledWith(401);
        res.render.should.have.been.calledWith('401', sinon.match(locals));
        res.send.should.have.been.calledWith(html);
      });
      it('renders the `error` template with `500` status for unknown errors', () => {
        res.render.withArgs('error').yields(null, html);

        const err = new Error('unknown');

        const locals = {
          content: {message: 'errors.default.message', title: 'errors.default.title'},
          error: err,
          showStack: false,
          startLink: '/'
        };

        middleware(err, req, res, next);

        res.status.should.have.been.calledWith(500);
        res.render.should.have.been.calledWith('error', sinon.match(locals));
        res.send.should.have.been.calledWith(html);
      });
    });
  });

  describe('without a translator', () => {
    beforeEach(() => {
      res = reqres.res();
      translate = sinon.stub().returnsArg(0);
      middleware = require('../../middleware/errors')();
      next = sinon.stub();
    });

    describe('middleware', () => {
      beforeEach(() => {
        req = reqres.req({
          path: '/my-hof-journey',
          method: 'GET'
        });
        res.render = sinon.spy();
      });

      it('uses a default title and message', () => {
        const err = {
          code: 'SESSION_TIMEOUT'
        };

        const locals = {
          content: {message: 'There is a SESSION_TIMEOUT_ERROR', title: 'SESSION_TIMEOUT_ERROR'}
        };

        middleware(err, req, res, next);

        translate.should.have.not.been.called;
        res.render.should.have.been.calledWith('session-timeout', sinon.match(locals));
      });

      it('uses a default UNKNOWN title and message when error code is not SESSION_TIMEOUT or NO_COOKIES', () => {
        const err = new Error('unknown');

        const locals = {
          content: {message: 'There is a UNKNOWN_ERROR', title: 'UNKNOWN_ERROR'}
        };

        middleware(err, req, res, next);

        res.render.should.have.been.calledWith('error', sinon.match(locals));
      });
    });
  });

  describe('with a logger', () => {
    const logger = {};

    beforeEach(() => {
      res = reqres.res();
      translate = sinon.stub().returnsArg(0);
      logger.error = sinon.spy();
      middleware = require('../../middleware/errors')({logger: logger});
      next = sinon.stub();
    });

    describe('the middleware', () => {
      beforeEach(() => {
        req = reqres.req({
          path: '/my-hof-journey',
          method: 'GET'
        });
        res.render = sinon.spy();
      });

      it('logs the error', () => {
        const err = {
          error: 'Error'
        };

        middleware(err, req, res, next);

        logger.error.should.have.been.calledWith('Error');
      });
    });
  });

  describe('when debug is true', () => {
    const logger = {};

    beforeEach(() => {
      res = reqres.res();
      translate = sinon.stub().returnsArg(0);
      logger.error = sinon.spy();
      middleware = require('../../middleware/errors')({debug: true});
      next = sinon.stub();
    });

    describe('the middleware', () => {
      beforeEach(() => {
        req = reqres.req({
          path: '/my-hof-journey',
          method: 'GET'
        });
        res.render = sinon.spy();
      });

      it('shows the stack trace', () => {
        const err = new Error('unknown');

        const locals = {
          showStack: true
        };

        middleware(err, req, res, next);
        res.render.should.have.been.calledWith('error', sinon.match(locals));
      });

      it('assigns err to content', () => {
        const err = new Error('unknown');

        const locals = {
          error: err
        };

        middleware(err, req, res, next);

        res.render.should.have.been.calledWith('error', sinon.match(locals));
      });
    });
  });

  describe('defaults to debug false', () => {
    const logger = {};

    beforeEach(() => {
      res = reqres.res();
      translate = sinon.stub().returnsArg(0);
      logger.error = sinon.spy();
      middleware = require('../../middleware/errors')(translate);
      next = sinon.stub();
    });

    describe('the middleware', () => {
      beforeEach(() => {
        req = reqres.req({
          path: '/my-hof-journey',
          method: 'GET'
        });
        res.render = sinon.spy();
      });

      it('does not show the stack trace', () => {
        const err = new Error('unknown');

        const locals = {
          showStack: false
        };

        middleware(err, req, res, next);

        res.render.should.have.been.calledWith('error', sinon.match(locals));
      });
    });
  });
});
