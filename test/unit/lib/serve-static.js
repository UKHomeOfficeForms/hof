'use strict';


const path = require('path');
const proxyquire = require('proxyquire');

describe('serve-static', () => {
  let serveStatic;
  let express;
  let expressStaticRtn;

  beforeEach(() => {
    expressStaticRtn = 'expressStaticRtn';
    express = {
      static: sinon.stub().returns(expressStaticRtn)
    };
    serveStatic = proxyquire('../../../lib/serve-static', {
      express
    });
  });

  it('exports a function', () => {
    serveStatic.should.be.a('function');
  });

  it('expects 2 arguments', () => {
    serveStatic.length.should.be.equal(2);
  });

  describe('init', () => {
    let serveStaticInstance;
    let app;

    beforeEach(() => {
      app = {
        use: sinon.stub()
      };
      serveStaticInstance = serveStatic(app, {
        env: 'ci',
        caller: path.resolve(__dirname, '../../')
      });
    });

    it('calls express.static with path to public assets', () => {
      express.static.should.have.been.calledOnce
        .and.calledWithExactly(path.resolve(__dirname, '../../public'));
    });

    it('calls app.use with /public and the return value from express.static', () => {
      app.use.should.have.been.calledOnce
        .and.calledWithExactly('/public', expressStaticRtn);
    });

    it('returns the app', () => {
      serveStaticInstance.should.be.equal(app);
    });
  });
});
