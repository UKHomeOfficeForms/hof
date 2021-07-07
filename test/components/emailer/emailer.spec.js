'use strict';

const proxyquire = require('proxyquire');

describe('Emailer', () => {
  let Emailer;
  let emailer;
  let nodemailer;
  let smtpTransport;
  let sesTransport;
  let stubTransport;

  beforeEach(() => {
    nodemailer = {
      createTransport: sinon.stub().returns({
        sendMail: sinon.stub().returns(Promise.resolve())
      })
    };

    smtpTransport = sinon.stub();
    sesTransport = sinon.stub();
    stubTransport = sinon.stub();

    Emailer = proxyquire('../../../components/emailer/emailer', {
      nodemailer,
      './transports': {
        smtp: smtpTransport,
        ses: sesTransport,
        stub: stubTransport
      }
    });
  });

  describe('constructor', () => {
    it('creates an instance of smtp transport by default', () => {
      emailer = new Emailer({
        from: 'test@example.com',
        transportOptions: {
          host: 'my.smtp.host',
          port: 25
        }
      });
      smtpTransport.should.have.been.calledOnce;
      smtpTransport.should.have.been.calledWithExactly({
        host: 'my.smtp.host',
        port: 25
      });
    });

    it('creates instance of ses transport if transport option is \'ses\'', () => {
      emailer = new Emailer({
        transport: 'ses',
        from: 'test@example.com',
        transportOptions: {
          accessKeyId: 'abc123',
          secretAccessKey: 'def456'
        }
      });
      sesTransport.should.have.been.calledOnce;
      sesTransport.should.have.been.calledWithExactly({
        accessKeyId: 'abc123',
        secretAccessKey: 'def456'
      });
    });

    it('passes transport return value to nodemailer', () => {
      const transport = { transport: 'myTestTransport' };
      smtpTransport.returns(transport);
      emailer = new Emailer({
        transport: 'smtp',
        from: 'test@example.com'
      });
      nodemailer.createTransport.should.have.been.calledOnce;
      nodemailer.createTransport.should.have.been.calledWithExactly(transport);
    });

    it('saves result of `nodemailer.createTransport` to `this.emailer`', () => {
      const transport = { transport: 'myTestTransport' };
      nodemailer.createTransport.returns(transport);
      emailer = new Emailer({
        from: 'test@example.com'
      });
      emailer.emailer.should.equal(transport);
    });

    it('throws if both of `from` and `replyTo` are not defined and transport is not `stub`', () => {
      const make = opts => () => new Emailer(opts);
      make().should.throw();
      make({ from: 'test@example.com' }).should.not.throw();
      make({ replyTo: 'test@example.com' }).should.not.throw();
      make({ transport: 'stub' }).should.not.throw();
    });
  });

  describe('send', () => {
    beforeEach(() => {
      const options = {
        transport: 'stub',
        from: 'my-from-address@somewhere.com'
      };
      emailer = new Emailer(options);
    });

    it('passes to address from arguments', () => {
      emailer.send('sterling@archer.com');
      emailer.emailer.sendMail.should.have.been.calledWith(sinon.match({
        to: 'sterling@archer.com'
      }));
    });

    it('passes subject from arguments', () => {
      emailer.send(null, 'An Email');
      emailer.emailer.sendMail.should.have.been.calledWith(sinon.match({
        subject: 'An Email'
      }));
    });

    it('passes email content from arguments', () => {
      emailer.send(null, null, 'Email body');
      emailer.emailer.sendMail.should.have.been.calledWith(sinon.match({
        html: 'Email body'
      }));
    });

    it('passes from address from emailer config', () => {
      emailer.send();
      emailer.emailer.sendMail.should.have.been.calledWith(sinon.match({
        from: 'my-from-address@somewhere.com'
      }));
    });

    it('sets default replyTo address of the from address', () => {
      emailer.send(null, null, []);
      emailer.emailer.sendMail.should.have.been.calledWith(sinon.match({
        replyTo: 'my-from-address@somewhere.com'
      }));
    });

    it('sets default from address of the replyTo address', () => {
      const options = {
        transport: 'stub',
        replyTo: 'reply-to@somewhere.com'
      };
      emailer = new Emailer(options);
      emailer.send();
      emailer.emailer.sendMail.should.have.been.calledWith(sinon.match({
        replyTo: 'reply-to@somewhere.com',
        from: 'reply-to@somewhere.com'
      }));
    });

    it('uses replyTo address from emailer config if it is set', () => {
      const options = {
        transport: 'stub',
        replyTo: 'reply-to@somewhere.com',
        from: 'my-from-address@somewhere.com'
      };
      emailer = new Emailer(options);
      emailer.send();
      emailer.emailer.sendMail.should.have.been.calledWith(sinon.match({
        replyTo: 'reply-to@somewhere.com',
        from: 'my-from-address@somewhere.com'
      }));
    });

    it('returns a promise', () => {
      emailer.send().should.be.a('promise');
    });

    it('resolves with result from nodemailer transport send', () => {
      const result = { success: true };
      emailer.emailer.sendMail.yieldsAsync(null, result);
      return emailer.send()
        .then(res => {
          res.should.equal(result);
        });
    });

    it('rejects if nodemailer transport fails to send', () => {
      const err = new Error('email sending error');
      emailer.emailer.sendMail.yieldsAsync(err);
      return emailer.send()
        .catch(e => {
          e.should.equal(err);
        });
    });
  });
});
