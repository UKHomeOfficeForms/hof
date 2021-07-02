'use strict';

const httpMock = require('node-mocks-http');

describe('not-found', () => {
  let middleware;
  let req;
  let res;
  let next;

  beforeEach(() => {
    res = httpMock.createResponse({
      eventEmitter: require('events').EventEmitter
    });
    req = httpMock.createRequest({
      method: 'GET',
      url: '/foo/bar'
    });
    next = sinon.stub();
    res.render = sinon.spy();
  });

  describe('middleware', () => {
    it('renders 404 with a default title and description', () => {
      middleware = require('../../middleware/').notFound();
      middleware(req, res, next);

      res.render.should.have.been.calledWith('404', sinon.match({
        title: 'Not found',
        description: 'There is nothing here',
        startLink: 'foo'
      }));
    });

    it('renders a 404 with a translated title and description when a translate function is provided', () => {
      const translate = sinon.stub().returnsArg(0);
      middleware = require('../../middleware/').notFound({translate: translate});
      middleware(req, res, next);

      translate.should.have.been.called;

      res.render.should.have.been.calledWith('404', sinon.match({
        title: 'errors.404.title',
        description: 'errors.404.description',
        startLink: 'foo'
      }));
    });

    it('logs a warning when a warn function is provided', () => {
      const logger = {
        warn: sinon.stub().returnsArg(0)
      };
      middleware = require('../../middleware/').notFound({logger: logger});
      middleware(req, res, next);

      logger.warn.should.have.been.calledWith('Cannot find: /foo/bar');
      res.render.should.have.been.called;
    });

    it('sets the first part of the url path as `startLink` to the locals', () => {
      req = httpMock.createRequest({
        method: 'GET',
        url: '/foo/bar/baz'
      });

      middleware = require('../../middleware/').notFound();
      middleware(req, res, next);

      res.render.should.have.been.calledWith('404', sinon.match({
        title: 'Not found',
        description: 'There is nothing here',
        startLink: 'foo'
      }));
    });
  });
});
