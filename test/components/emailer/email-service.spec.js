'use strict';

const fs = require('fs');
const proxyquire = require('proxyquire');

describe('Email Service', () => {
  let EmailService;
  let Emailer;
  let emailer;

  beforeEach(() => {
    sinon.stub(fs, 'readFile')
      .yieldsAsync(null, '<s>{{subject}}</s><b>{{body}}</b>');
    Emailer = sinon.stub();
    EmailService = proxyquire('../../../components/emailer/email-service', {
      './emailer': Emailer
    });
  });
  afterEach(() => {
    fs.readFile.restore();
  });

  describe('constructor', () => {
    it('creates an Emailer instance', () => {
      emailer = new EmailService();
      emailer.emailer.should.be.an.instanceOf(Emailer);
    });

    it('passes options to emailer', () => {
      const opts = {
        transport: 'stub'
      };
      emailer = new EmailService(opts);
      Emailer.should.have.been.calledOnce;
      Emailer.should.have.been.calledWithNew;
      Emailer.should.have.been.calledWithExactly(opts);
    });
  });

  describe('send', () => {
    beforeEach(() => {
      Emailer.returns({
        send: sinon.stub().returns(Promise.resolve())
      });
      emailer = new EmailService({});
    });

    it('returns a promise', () => {
      const result = emailer.send('test@example.com', 'email body', 'email subject');
      result.should.be.a('promise');
    });

    it('renders body and subject into layout and passes result to emailer send', () => {
      const expected = '<s>email subject</s><b>email body</b>';
      return emailer.send('test@example.com', 'email body', 'email subject')
        .then(() => {
          emailer.emailer.send.should.have.been.calledOnce;
          emailer.emailer.send.should.have.been.calledWithExactly(
            'test@example.com',
            'email subject',
            expected
          );
        });
    });

    it('handles arguments passed as an object', () => {
      const expected = '<s>email subject</s><b>email body</b>';
      const opts = {
        recipient: 'test@example.com',
        body: 'email body',
        subject: 'email subject'
      };
      return emailer.send(opts)
        .then(() => {
          emailer.emailer.send.should.have.been.calledOnce;
          emailer.emailer.send.should.have.been.calledWithExactly(
            'test@example.com',
            'email subject',
            expected
          );
        });
    });

    it('uses a custom layout file if one is set as an option', () => {
      fs.readFile.withArgs('/path/to/my/layout')
        .yieldsAsync(null, '<h1>{{subject}}</h1><p>{{body}}</p>');

      emailer = new EmailService({
        layout: '/path/to/my/layout'
      });
      const expected = '<h1>email subject</h1><p>email body</p>';
      return emailer.send('test@example.com', 'email body', 'email subject')
        .then(() => {
          emailer.emailer.send.should.have.been.calledOnce;
          emailer.emailer.send.should.have.been.calledWithExactly(
            'test@example.com',
            'email subject',
            expected
          );
        });
    });

    it('uses no layout file if layout option is set to false', () => {
      emailer = new EmailService({
        layout: false
      });
      const expected = 'email body';
      return emailer.send('test@example.com', 'email body', 'email subject')
        .then(() => {
          emailer.emailer.send.should.have.been.calledOnce;
          emailer.emailer.send.should.have.been.calledWithExactly(
            'test@example.com',
            'email subject',
            expected
          );
        });
    });

    it('rejects if layout template cannot be found', () => {
      const err = new Error('template not found');
      fs.readFile.withArgs('/path/to/my/layout')
        .yieldsAsync(err);

      emailer = new EmailService({
        layout: '/path/to/my/layout'
      });
      return emailer.send('test@example.com', 'email body', 'email subject')
        .catch(e => {
          e.should.equal(err);
        });
    });
  });
});
