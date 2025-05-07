'use strict';

const httpMock = require('node-mocks-http');

describe.only('service-paused', () => {
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
    it('renders service-paused with a default title, message and answers-saved', () => {
      middleware = require('../../middleware/').servicePaused();
      middleware(req, res, next);

      res.render.should.have.been.calledWith('service-paused', sinon.match({
        title: 'Sorry, this service is unavailable',
        message: 'This service is temporarily unavailable',
        'answers-saved': 'Your answers have not been saved',
        contact: undefined,
        alternative: undefined
      }));
    });

    it('renders a service-paused with a translated text when a translate function is provided', () => {
      const translate = sinon.stub().returnsArg(0);
      middleware = require('../../middleware/').servicePaused({translate: translate});
      middleware(req, res, next);

      translate.should.have.been.called;

      res.render.should.have.been.calledWith('service-paused', sinon.match({
        title: 'errors.service-paused.title',
        message: 'errors.service-paused.message',
        'answers-saved': 'errors.service-paused.answers-saved',
        contact: '',
        alternative: ''
      }));
    });

    it('logs a warning when a warn function is provided', () => {
      const translate = sinon.stub().returnsArg(0);
      const logger = {
        warn: sinon.stub().returnsArg(0)
      };
      middleware = require('../../middleware/').servicePaused({translate: translate, logger: logger});
      middleware(req, res, next);

      logger.warn.should.have.been.calledWith('Service temporarily unavailable - service paused.');
      res.render.should.have.been.called;
    });
  });
});
