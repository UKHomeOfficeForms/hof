'use strict';

const httpMock = require('node-mocks-http');

describe('service-unavailable', () => {
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
    it('renders service-unavailable with a default title, message and answers-saved', () => {
      middleware = require('../../middleware').serviceUnavailable();
      middleware(req, res, next);

      res.render.should.have.been.calledWith('service-unavailable', sinon.match({
        title: 'Sorry, this service is unavailable',
        message: 'This service is temporarily unavailable',
        'answers-saved': 'Your answers have not been saved',
        contact: undefined,
        alternative: undefined
      }));
    });

    it('renders a service-unavailable with a translated text when a translate function is provided', () => {
      const translate = sinon.stub().returnsArg(0);
      middleware = require('../../middleware').serviceUnavailable({translate: translate});
      middleware(req, res, next);

      translate.should.have.been.called;

      res.render.should.have.been.calledWith('service-unavailable', sinon.match({
        title: 'errors.service-unavailable.title',
        message: 'errors.service-unavailable.message',
        'answers-saved': 'errors.service-unavailable.answers-saved',
        contact: '',
        alternative: ''
      }));
    });

    it('logs a warning when a warn function is provided', () => {
      const translate = sinon.stub().returnsArg(0);
      const logger = {
        warn: sinon.stub().returnsArg(0)
      };
      middleware = require('../../middleware').serviceUnavailable({translate: translate, logger: logger});
      middleware(req, res, next);

      logger.warn.should.have.been.calledWith('Service temporarily unavailable - service paused.');
      res.render.should.have.been.called;
    });
  });
});
