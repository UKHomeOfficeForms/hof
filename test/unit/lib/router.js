'use strict';

const path = require('path');
const proxyquire = require('proxyquire');

describe('router', () => {
  let router;
  let express;
  let hof;
  let expressPartialTemplates;
  let expressPartialTemplatesRtn;
  let appStub;
  let translateStub;
  let deepTranslate;
  let deepTranslateRtn;
  let mixinsRtn;

  beforeEach(() => {
    translateStub = sinon.stub();
    deepTranslateRtn = 'deepTranslateRtn';
    deepTranslate = sinon.stub().returns(deepTranslateRtn);
    mixinsRtn = 'mixinsRtn';
    hof = {
      wizard: sinon.stub(),
      mixins: sinon.stub().returns(mixinsRtn),
      middleware: {
        deepTranslate
      },
      i18n: sinon.stub().returns({
        translate: translateStub
      })
    };
    appStub = {
      set: sinon.stub(),
      use: sinon.stub()
    };
    express = sinon.stub().returns(appStub);
    expressPartialTemplatesRtn = 'expressPartialTemplatesRtn';
    expressPartialTemplates = sinon.stub().returns(expressPartialTemplatesRtn);
    router = proxyquire('../../../lib/router', {
      hof,
      express,
      'express-partial-templates': expressPartialTemplates
    });
  });

  it('exports a function', () => {
    router.should.be.a('function');
  });

  it('expects one argument', () => {
    router.length.should.be.equal(1);
  });

  describe('init', () => {
    let routerInstance;
    const steps = {};

    beforeEach(() => {
      routerInstance = router({
        route: {
          name: 'test-route',
          params: ':action?',
          fields: '../../fields',
          views: path.resolve(__dirname, '../../views'),
          steps
        },
        baseController: 'fakeController',
        caller: __dirname,
        sharedViews: '/path/to/shared/views'
      });
    });

    it('calls express', () => {
      express.should.have.been.calledOnce;
    });

    it('sets the views to the views directory', () => {
      appStub.set.should.have.been.calledOnce
        .and.calledWithExactly('views', [path.resolve(__dirname, '../../views'), '/path/to/shared/views']);
    });

    it('calls expressPartialTemplates passing in app', () => {
      expressPartialTemplates.should.have.been.calledOnce
        .and.calledWithExactly(appStub);
    });

    it('calls app.use four times', () => {
      appStub.use.callCount.should.be.equal(4);
    });

    it('calls app.use with the return value of expressPartialTemplates', () => {
      appStub.use.firstCall.should.have.been.calledWithExactly(expressPartialTemplatesRtn);
    });

    it('calls hof.middleware.deepTranslate', () => {
      hof.middleware.deepTranslate.should.have.been.calledOnce;
    });

    it('calls app.use with the return value of deepTranslate', () => {
      appStub.use.secondCall.should.have.been.calledWithExactly(deepTranslateRtn);
    });

    it('calls hof.mixins passing fields', () => {
      hof.mixins.should.have.been.calledOnce
        .and.calledWithMatch(require('../../fields'));
    });

    it('calls app.use with the return value of mixins', () => {
      appStub.use.thirdCall.should.have.been.calledWithExactly(mixinsRtn);
    });

    it('calls wizard with the given config', () => {
      hof.wizard.should.have.been.calledOnce
        .and.calledWithExactly(steps, require('../../fields'), {
          name: 'test-route',
          params: ':action?',
          controller: 'fakeController'
        });
    });

    it('returns the app instance', () => {
      routerInstance.should.be.equal(appStub);
    });
  });
});
