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

function clearCache() {
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

    it('sets viewEngine from environment variable', () => {
      process.env.VIEW_ENGINE = 'mus';
      clearCache();
      require('../../../lib/defaults').viewEngine.should.be.equal('html');
    });

    it('sets baseController to hof.controller.base', () => {
      defaults.baseController.should.be.equal(stubController);
    });

    it('sets protocol to http if not defined in env vars', () => {
      defaults.protocol.should.be.equal('http');
    });

    it('sets protocol from environment variable', () => {
      process.env.PROTOCOL = 'https';
      clearCache();
      require('../../../lib/defaults').protocol.should.be.equal('https');
    });

    it('sets host to \'0.0.0.0\' if not defined in env vars', () => {
      defaults.host.should.be.equal('0.0.0.0');
    });

    it('sets host from environment variable', () => {
      process.env.HOST = '127.0.0.1';
      clearCache();
      require('../../../lib/defaults').host.should.be.equal('127.0.0.1');
    });

    it('sets port to \'8080\' if not defined in env vars', () => {
      defaults.port.should.be.equal('8080');
    });

    it('sets port from environment variable', () => {
      process.env.PORT = '3000';
      clearCache();
      require('../../../lib/defaults').port.should.be.equal('3000');
    });

    it('sets env to \'development\' if not defined in env vars', () => {
      delete process.env.NODE_ENV;
      clearCache();
      require('../../../lib/defaults').env.should.be.equal('development');
    });

    it('sets env from environment variable', () => {
      process.env.NODE_ENV = 'production';
      clearCache();
      require('../../../lib/defaults').env.should.be.equal('production');
    });

    describe('redis settings', () => {
      it('sets host to \'127.0.0.1\' if not defined in env vars', () => {
        defaults.redis.host.should.be.equal('127.0.0.1');
      });

      it('sets host from environment variable', () => {
        process.env.REDIS_HOST = '127.0.0.2';
        clearCache();
        require('../../../lib/defaults').redis.host.should.be.equal('127.0.0.2');
      });

      it('sets port to \'6379\' if not defined in env vars', () => {
        defaults.redis.port.should.be.equal('6379');
      });

      it('sets port from environment variable', () => {
        process.env.REDIS_PORT = '1234';
        clearCache();
        require('../../../lib/defaults').redis.port.should.be.equal('1234');
      });
    });

    describe('session settings', () => {
      it('sets ttl to 1800 if not defined in env vars', () => {
        defaults.session.ttl.should.be.equal(1800);
      });

      it('sets ttl from environment variable', () => {
        process.env.SESSION_TTL = 3600;
        clearCache();
        require('../../../lib/defaults').session.ttl.should.be.equal(3600);
      });

      it('sets secret to \'changethis\' if not defined in env vars', () => {
        defaults.session.secret.should.be.equal('changethis');
      });

      it('sets secret from environment variable', () => {
        process.env.SESSION_SECRET = 'thesecret';
        clearCache();
        require('../../../lib/defaults').session.secret.should.be.equal('thesecret');
      });

      it('sets name to \'hod.sid\' if not defined in env vars', () => {
        defaults.session.name.should.be.equal('hod.sid');
      });

      it('sets name from environment variable', () => {
        process.env.SESSION_NAME = 'so.sid';
        clearCache();
        require('../../../lib/defaults').session.name.should.be.equal('so.sid');
      });
    });
  });
});
