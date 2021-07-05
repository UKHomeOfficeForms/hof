'use strict';

const proxyquire = require('proxyquire');

describe('transports/smtp', () => {

  let nodemailerSmtpTransport;
  let smtpTransport;

  beforeEach(() => {

    nodemailerSmtpTransport = sinon.stub();

    smtpTransport = proxyquire('../../../../components/emailer/transports/smtp', {
      'nodemailer-smtp-transport': nodemailerSmtpTransport
    });
  });

  it('returns an instance of smtp transport', () => {
    const transport = { transport: 'smtp' };
    nodemailerSmtpTransport.returns(transport);
    const options = {
      host: 'my.smtp.host',
      port: 25
    };
    const result = smtpTransport(options);
    nodemailerSmtpTransport.should.have.been.calledWith(sinon.match(options));
    result.should.equal(result);
  });

  it('throws if either host or port are not passed', () => {
    const make = opts => {
      return () => smtpTransport(opts);
    };
    make({}).should.throw();
    make({ host: 'my.smtp.host' }).should.throw();
    make({ port: 25 }).should.throw();
  });

  it('sets ignoreTLS option to false by default', () => {
    const options = {
      host: 'my.smtp.host',
      port: 25
    };
    smtpTransport(options);
    nodemailerSmtpTransport.should.have.been.calledWith(sinon.match({
      ignoreTLS: false
    }));
  });

  it('sets ignoreTLS option to true if it is set to exactly true', () => {
    const options = {
      host: 'my.smtp.host',
      port: 25,
      ignoreTLS: true
    };
    smtpTransport(options);
    nodemailerSmtpTransport.should.have.been.calledWith(sinon.match({
      ignoreTLS: true
    }));
  });

  it('sets ignoreTLS option to false if it is set to any other value', () => {
    const options = {
      host: 'my.smtp.host',
      port: 25,
      ignoreTLS: 1
    };
    smtpTransport(options);
    nodemailerSmtpTransport.should.have.been.calledWith(sinon.match({
      ignoreTLS: false
    }));
  });

  it('sets secure option to true by default', () => {
    const options = {
      host: 'my.smtp.host',
      port: 25
    };
    smtpTransport(options);
    nodemailerSmtpTransport.should.have.been.calledWith(sinon.match({
      secure: true
    }));
  });

  it('sets secure option to true if it is set to exactly false', () => {
    const options = {
      host: 'my.smtp.host',
      port: 25,
      secure: false
    };
    smtpTransport(options);
    nodemailerSmtpTransport.should.have.been.calledWith(sinon.match({
      secure: false
    }));
  });

  it('sets secure option to true if it is set to any other value', () => {
    const options = {
      host: 'my.smtp.host',
      port: 25,
      secure: null
    };
    smtpTransport(options);
    nodemailerSmtpTransport.should.have.been.calledWith(sinon.match({
      secure: true
    }));
  });

  it('sets auth option if it has user and pass defined', () => {
    const options = {
      host: 'my.smtp.host',
      port: 25,
      auth: {
        user: 'user',
        pass: 'pass'
      }
    };
    smtpTransport(options);
    nodemailerSmtpTransport.should.have.been.calledWith(sinon.match({
      auth: {
        user: 'user',
        pass: 'pass'
      }
    }));
  });

});
