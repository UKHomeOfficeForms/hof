'use strict';

const proxyquire = require('proxyquire');

const fakeLogger = {};

const levels = {
  info: 0,
  email: 1,
  warn: 2,
  error: 3
};

const colours = {
  info: 'green',
  email: 'magenta',
  warn: 'yellow',
  error: 'red'
};

describe('logger', () => {
  let logger;
  const winston = {
    transports: {}
  };

  beforeEach(() => {
    winston.transports.Console = sinon.stub();
    winston.Logger = sinon.stub().returns(fakeLogger);
    winston.addColors = sinon.stub();
    logger = proxyquire('../../../lib/logger', {winston});
  });

  it('should be a function', () => {
    logger.should.be.a('function');
  });

  it('should expect one argument', () => {
    logger.length.should.be.equal(1);
  });

  describe('init', () => {
    let loggerInstance;

    beforeEach(() => {
      loggerInstance = logger({
        env: 'development'
      });
    });

    it('should have called winston.transports.Console twice', () => {
      winston.transports.Console.should.have.been.calledTwice;
    });

    describe('first call', () => {
      let config;

      beforeEach(() => {
        config = winston.transports.Console.firstCall.args[0];
      });

      it('should have been called with json: false', () => {
        config.json.should.be.false;
      });

      it('should be called with json: true if production', () => {
        logger({env: 'production'});
        winston.transports.Console.thirdCall.args[0].json.should.be.true;
      });

      it('should have been called with timestamp: true', () => {
        config.timestamp.should.be.true;
      });

      it('should have been called with colorize: true', () => {
        config.colorize.should.be.true;
      });

      it('should be passed a stringify function', () => {
        config.stringify.should.be.a('function');
      });

      it('should call JSON.stringify on the input value', () => {
        const value = {a: 1};
        sinon.spy(JSON, 'stringify');
        config.stringify(value);
        JSON.stringify.should.have.been.calledOnce
          .and.calledWithExactly(value);
        JSON.stringify.restore();
      });
    });

    describe('second call', () => {
      let config;

      beforeEach(() => {
        config = winston.transports.Console.secondCall.args[0];
      });

      it('should have been called with json: false', () => {
        config.json.should.be.false;
      });

      it('should be called with json: true if production', () => {
        logger({env: 'production'});
        winston.transports.Console.thirdCall.args[0].json.should.be.true;
      });

      it('should have been called with timestamp: true', () => {
        config.timestamp.should.be.true;
      });

      it('should have been called with colorize: true', () => {
        config.colorize.should.be.true;
      });

      it('should be passed a stringify function', () => {
        config.stringify.should.be.a('function');
      });

      it('should call JSON.stringify on the input value', () => {
        const value = {a: 1};
        sinon.spy(JSON, 'stringify');
        config.stringify(value);
        JSON.stringify.should.have.been.calledOnce
          .and.calledWithExactly(value);
        JSON.stringify.restore();
      });
    });

    describe('winston.Logger', () => {
      let config;

      beforeEach(() => {
        config = winston.Logger.firstCall.args[0];
      });

      it('is called once', () => {
        winston.Logger.should.have.been.calledOnce;
      });

      it('is called with correct log levels', () => {
        config.levels.should.be.eql(levels);
      });

      it('is called with one transport', () => {
        config.transports.length.should.be.equal(1);
      });

      it('is not called with exceptionTransports if not prod', () => {
        should.equal(config.exceptionTransports, undefined);
      });

      it('is called with exceptionTransports if prod', () => {
        logger({env: 'production'});
        winston.Logger.secondCall.args[0]
          .should.have.property('exceptionHandlers')
          .and.be.an('array');
      });

      it('is called with exitOnError: true', () => {
        config.exitOnError.should.be.true;
      });
    });

    it('should have called winston.addColors with the provided colors', () => {
      winston.addColors.should.have.been.calledOnce
        .and.calledWithExactly(colours);
    });

    it('should return the logger returned by winston.Logger', () => {
      loggerInstance.should.be.equal(fakeLogger);
    });
  });
});
