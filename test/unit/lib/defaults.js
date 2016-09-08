'use strict';

const path = require('path');
const proxyquire = require('proxyquire');

const stubController = sinon.stub();

const defaults = proxyquire('../../../lib/defaults', {
  hof: {
    controllers: {
      base: stubController
    }
  }
});

function clearCache () {
  delete require.cache[require.resolve('../../../lib/defaults')];
}

describe('default settings', () => {
  it('exposes the correct settings', () => {
    defaults.should.have.all.keys(
      'translations',
      'views',
      'fields',
      'caller',
      'start',
      'getCookies',
      'getTerms',
      'viewEngine',
      'baseController',
      'protocol',
      'host',
      'port',
      'env',
      'redis',
      'session'
    );
  });

  describe('values', () => {
    it('sets translations to \'translations\'', () => {
      defaults.translations.should.be.equal('translations');
    });

    it('sets views to \'views\'', () => {
      defaults.translations.should.be.equal('translations');
    });

    it('sets fields to \'fields\'', () => {
      defaults.translations.should.be.equal('translations');
    });

    it('sets caller to test path when testing', () => {
      const caller = path.resolve(__dirname, '../../');
      defaults.caller.should.be.equal(caller);
    });

    it('sets start to true', () => {
      defaults.start.should.be.true;
    });

    it('sets getCookies to true', () => {
      defaults.getCookies.should.be.true;
    });

    it('sets getTerms to true', () => {
      defaults.getTerms.should.be.true;
    });

    it('sets viewEngine to \'html\'', () => {
      defaults.viewEngine.should.be.equal('html');
    });

    it('sets baseController to hof.controller.base', () => {
      defaults.baseController.should.be.equal(stubController);
    });

    it('sets protocol to http if not defined in env vars', () => {
      defaults.protocol.should.be.equal('http');
    });

    it('sets protocol to http if not defined in env vars', () => {
      process.env.PROTOCOL = 'https'
      clearCache();
      require('../../../lib/defaults').protocol.should.be.equal('https');
    });
  });
});
