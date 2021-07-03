'use strict';

const EventEmitter = require('events').EventEmitter;
const backLinks = require('../../../wizard/middleware/back-links');
const helpers = require('../../../wizard/util/helpers');
const request = require('../helpers/request');

describe('Back Links', () => {
  class StubController extends EventEmitter {
    constructor(options) {
      super(options);
      this.options = {};
    }
  }
  let controller;
  let steps;
  let req;
  let res;
  let next;

  beforeEach(() => {
    steps = {
      '/step1': {
        next: '/step2'
      },
      '/step2': {
        next: '/step3',
        fields: {
          photo: {
            invalidates: ['name']
          }
        }
      },
      '/step3': {
        next: '/step4',
        fields: {
          name: {
            invalidates: []
          }
        }
      },
      '/step3a': {
        next: '/step4'
      },
      '/step4': {
        next: '/step5'
      },
      '/step5': {}
    };

    controller = new StubController();

    req = request({
      method: 'GET',
      session: {
        user: {
          steps: [],
          photo: 'aaa111',
          name: 'John'
        }
      }
    });
    res = {
      locals: {},
      redirect: sinon.stub()
    };
    next = sinon.stub();

    sinon.stub(helpers, 'getRouteSteps').returns([]);
  });

  afterEach(() => {
    helpers.getRouteSteps.restore();
  });

  it('calls getRouteSteps helper with route and steps', () => {
    backLinks('/', controller, steps);
    helpers.getRouteSteps.should.have.been.calledWithExactly('/', steps);
  });

  it('is only set on a GET request', () => {
    req.method = 'POST';
    req.sessionModel.set('steps', ['/step1']);
    backLinks('/', controller, steps)(req, res, next);
    expect(res.locals.backLink).to.be.undefined;
  });

  it('adds the previous step to res.locals.backLink', () => {
    req.get.withArgs('referrer').returns('http://example.com/referrer/step2');
    req.baseUrl = '/referrer';
    req.sessionModel.set('steps', ['/step1']);
    helpers.getRouteSteps.returns(['/step1']);
    backLinks('/step2', controller, steps)(req, res, next);
    res.locals.backLink.should.equal('step1');
  });

  it('is not defined for first step of journey', () => {
    backLinks('/', controller, steps)(req, res, next);
    expect(res.locals.backLink).to.be.undefined;
  });

  it('adds the most recently visited previous step if there are multiple options', () => {
    req.get.withArgs('referrer').returns('http://example.com/referrer');
    req.baseUrl = '/referrer';
    helpers.getRouteSteps.returns(['/step3', '/step3a']);
    req.sessionModel.set('steps', ['/step1', '/step3', '/step3a']);
    backLinks('/step4', controller, steps)(req, res, next);
    res.locals.backLink.should.equal('step3a');

    req.sessionModel.set('steps', ['/step1', '/step3a', '/step3']);
    backLinks('/step4', controller, steps)(req, res, next);
    res.locals.backLink.should.equal('step3');
  });

  it('uses configured backLink property if it exists', () => {
    controller.options.backLink = '/back';
    backLinks('/', controller, steps)(req, res, next);
    res.locals.backLink.should.equal('/back');
  });

  it('sets backLink to falsy value if it is configured', () => {
    controller.options.backLink = null;
    backLinks('/', controller, steps)(req, res, next);
    expect(res.locals.backLink).to.be.null;
  });

  it('whitelists referrer header if no configured backwards route', () => {
    req.get.withArgs('referrer').returns('http://example.com/whitelist');
    req.baseUrl = '/whitelist';
    req.sessionModel.set('steps', ['/step1', '/step2']);
    controller.options.backLinks = ['whitelist'];
    backLinks('/step3', controller, steps)(req, res, next);
    res.locals.backLink.should.equal('whitelist');
  });

  it('supports links prefixed with `./`', () => {
    req.get.withArgs('referrer').returns('http://example.com/whitelist');
    req.baseUrl = '/whitelist';
    req.sessionModel.set('steps', ['/step1', '/step2']);
    controller.options.backLinks = ['./whitelist'];
    backLinks('/step3', controller, steps)(req, res, next);
    res.locals.backLink.should.equal('whitelist');
  });

  it('strips baseUrl before checking whitelist', () => {
    req.get.withArgs('referrer').returns('http://example.com/base/whitelist');
    req.baseUrl = '/base';
    req.sessionModel.set('steps', ['/step1', '/step2']);
    controller.options.backLinks = ['whitelist'];
    backLinks('/step3', controller, steps)(req, res, next);
    res.locals.backLink.should.equal('whitelist');
  });

  it('supports absolute paths in whitelist', () => {
    req.get.withArgs('referrer').returns('http://example.com/whitelist');
    req.baseUrl = '/base';
    req.sessionModel.set('steps', ['/step1', '/step2']);
    controller.options.backLinks = ['/whitelist'];
    backLinks('/step3', controller, steps)(req, res, next);
    res.locals.backLink.should.equal('/whitelist');
  });

  it('permits whitelisting of steps in history', () => {
    req.get.withArgs('referrer').returns('http://example.com/base/step4');
    req.baseUrl = '/base';
    req.sessionModel.set('steps', ['/step1', '/step2', '/step3a', '/step4']);
    controller.options.backLinks = ['/step2'];
    backLinks('/step3a', controller, steps)(req, res, next);
    res.locals.backLink.should.equal('step2');
  });

  it('returns most recent of whitelisted steps in history', () => {
    req.get.withArgs('referrer').returns('http://example.com/base/step4');
    req.baseUrl = '/base';
    req.sessionModel.set('steps', ['/step1', '/step2', '/step3a', '/step4']);
    controller.options.backLinks = ['/step2', '/step1'];
    backLinks('/step3a', controller, steps)(req, res, next);
    res.locals.backLink.should.equal('step2');
  });

  it('returns undefined if referrer header is not on whitelist', () => {
    req.get.withArgs('referrer').returns('http://example.com/not-whitelisted');
    req.sessionModel.set('steps', ['/step1', '/step2']);
    controller.options.backLinks = ['whitelist'];
    backLinks('/', controller, steps)(req, res, next);
    expect(res.locals.backLink).to.be.undefined;
  });

  it('permits whitelisting of steps from a separate form instance', () => {
    req.get.withArgs('referrer').returns('http://example.com/referrer');
    req.baseUrl = '/other';
    req.sessionModel.set('steps', ['/step1', '/step2', '/step3', '/step4']);
    req.session['hof-wizard-test-form'] = { steps: ['/history1', '/history2'] };
    controller.options.backLinks = ['./history1'];
    backLinks('/step3', controller, steps)(req, res, next);
    res.locals.backLink.should.equal('history1');
  });

  it('does not strip baseUrl if the baseUrl is a slash', () => {
    req.get.withArgs('referrer').returns('http://example.com/');
    req.baseUrl = '/';
    req.sessionModel.set('steps', ['/step1']);
    helpers.getRouteSteps.returns(['/step1']);
    backLinks('/step2', controller, steps)(req, res, next);
    res.locals.backLink.should.equal('/step1');
  });

  describe('isBackLink request object property', () => {
    it('is true when the last step matches the page path', () => {
      req.sessionModel.set('steps', ['/step1', '/step2']);
      controller.options.path = '/step2';
      backLinks('/step2', controller, steps)(req, res, next);
      req.isBackLink.should.be.ok;
    });

    it('is true when the last step matches the next path', () => {
      req.sessionModel.set('steps', ['/step1', '/step2']);
      controller.options.next = '/step2';
      backLinks('/step1', controller, steps)(req, res, next);
      req.isBackLink.should.be.ok;
    });
  });
});
