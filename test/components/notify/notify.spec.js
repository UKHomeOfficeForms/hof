'use strict';
const NotifyClient = require('notifications-node-client').NotifyClient;
const proxyquire = require('proxyquire');

describe('Notify', () => {
  let notifyClient;
  let Notify;
  let notify;
  let logger;
  let randomUUID;

  const testTemplate = 'testTemplate';
  const reference = 'f782dced-5d30-4d71-9ca8-e0fb5d3eea3f';

  const email = {
    subject: 'test-subject',
    recipient: 'sterling@archer.com',
    body: 'test-body'
  };

  beforeEach(() => {
    notifyClient =  {
      sendEmail: sinon.stub(NotifyClient.prototype, 'sendEmail'),
      prepareUpload: sinon.stub(NotifyClient.prototype, 'prepareUpload')
    };
    logger = { log: sinon.stub() };
    randomUUID = sinon.stub().returns(reference);

    notifyClient.sendEmail.resolves();

    Notify = proxyquire('../../../components/notify/notify', {
      'node:crypto': { randomUUID },
      '../../lib/logger': sinon.stub().returns(logger)
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('constructor', () => {
    it('should create an instance', () => {
      notify = new Notify({
        notifyApiKey: '123456'
      });
    });

    it('should throw if notifyApiKey is not defined', () => {
      const make = opts => () => new Notify(opts);
      make().should.throw();
      make({ notifyApiKey: '123456' }).should.not.throw();
    });
  });

  describe('send', () => {
    beforeEach(() => {
      const options = {
        notifyApiKey: '123456',
        notifyTemplate: testTemplate
      };
      notify = new Notify(options);
    });

    it('should send the configured template, recipient, personalisation and UUID reference', async () => {
      await notify.send(email);

      expect(randomUUID).to.have.been.calledOnce;
      expect(notifyClient.sendEmail).to.have.been.calledOnceWithExactly(testTemplate, email.recipient, {
        personalisation: {
          'email-subject': email.subject,
          'email-body': email.body
        },
        reference
      });
      expect(notifyClient.prepareUpload).not.to.have.been.called;
      expect(logger.log).to.have.been.calledOnceWithExactly('info', 'Email sent');
    });

    it('should include the configured email reply-to ID', async () => {
      notify = new Notify({
        notifyApiKey: '123456',
        notifyTemplate: testTemplate,
        emailReplyToId: 'reply-to-id'
      });

      await notify.send(email);

      expect(notifyClient.sendEmail).to.have.been.calledOnceWithExactly(
        testTemplate,
        email.recipient,
        {
          personalisation: {
            'email-subject': email.subject,
            'email-body': email.body
          },
          reference,
          emailReplyToId: 'reply-to-id'
        }
      );
    });

    it('should omit an empty configured email reply-to ID', async () => {
      notify = new Notify({
        notifyApiKey: '123456',
        notifyTemplate: testTemplate,
        emailReplyToId: ''
      });

      await notify.send(email);

      expect(notifyClient.sendEmail).to.have.been.calledOnceWithExactly(
        testTemplate,
        email.recipient,
        {
          personalisation: {
            'email-subject': email.subject,
            'email-body': email.body
          },
          reference
        }
      );
    });

    it('should allow an email reply-to ID to be provided to sendEmail', async () => {
      await notify.sendEmail(testTemplate, email.recipient, {}, 'reply-to-id');

      expect(notifyClient.sendEmail).to.have.been.calledOnceWithExactly(
        testTemplate,
        email.recipient,
        {
          personalisation: {},
          reference,
          emailReplyToId: 'reply-to-id'
        }
      );
    });

    describe('with a configured email reply-to ID', () => {
      beforeEach(() => {
        notify = new Notify({
          notifyApiKey: '123456',
          notifyTemplate: testTemplate,
          emailReplyToId: 'default-reply-to-id'
        });
      });

      it('should override the configured value with a sendEmail argument', async () => {
        await notify.sendEmail(testTemplate, email.recipient, {}, 'override-reply-to-id');

        expect(notifyClient.sendEmail).to.have.been.calledOnceWithExactly(
          testTemplate,
          email.recipient,
          {
            personalisation: {},
            reference,
            emailReplyToId: 'override-reply-to-id'
          }
        );
      });

      it('should override the configured value with an email reply-to ID passed to send', async () => {
        await notify.send(Object.assign({}, email, { emailReplyToId: 'override-reply-to-id' }));

        expect(notifyClient.sendEmail).to.have.been.calledOnceWithExactly(
          testTemplate,
          email.recipient,
          {
            personalisation: {
              'email-subject': email.subject,
              'email-body': email.body
            },
            reference,
            emailReplyToId: 'override-reply-to-id'
          }
        );
      });

      it('should omit emailReplyToId when send is given an empty string', async () => {
        await notify.send(Object.assign({}, email, { emailReplyToId: '' }));

        expect(notifyClient.sendEmail).to.have.been.calledOnceWithExactly(
          testTemplate,
          email.recipient,
          {
            personalisation: {
              'email-subject': email.subject,
              'email-body': email.body
            },
            reference
          }
        );
      });

      it('should omit emailReplyToId when sendEmail is given an empty string', async () => {
        await notify.sendEmail(testTemplate, email.recipient, {}, '');

        expect(notifyClient.sendEmail).to.have.been.calledOnceWithExactly(
          testTemplate,
          email.recipient,
          {
            personalisation: {},
            reference
          }
        );
      });
    });

    it('should generate a new reference for each email', async () => {
      const secondReference = '6229b3f7-82e1-489e-99cf-3c593d3b23c0';
      randomUUID.onSecondCall().returns(secondReference);

      await notify.send(email);
      await notify.send(email);

      expect(randomUUID).to.have.been.calledTwice;
      expect(notifyClient.sendEmail.firstCall.args[2].reference).to.equal(reference);
      expect(notifyClient.sendEmail.secondCall.args[2].reference).to.equal(secondReference);
    });

    it('should prepare attachments and include them in personalisation', async () => {
      const attachment = Buffer.from('test attachment');
      const upload = { file: 'prepared attachment' };
      notifyClient.prepareUpload.returns(upload);

      await notify.send(Object.assign({}, email, { attachment }));

      expect(notifyClient.prepareUpload).to.have.been.calledOnceWithExactly(attachment);
      expect(notifyClient.sendEmail).to.have.been.calledOnceWithExactly(testTemplate, email.recipient, {
        personalisation: {
          'email-subject': email.subject,
          'email-body': email.body,
          'email-attachment': upload
        },
        reference
      });
    });

    it('should preserve the original Notify error and log its response payload once', async () => {
      const error = new Error('Notify request failed');
      error.response = { data: { errors: [{ message: 'Invalid template' }] } };
      notifyClient.sendEmail.rejects(error);

      await expect(notify.send(email)).to.be.rejected.then(actualError => {
        expect(actualError).to.equal(error);
        expect(actualError.response).to.equal(error.response);
      });

      expect(logger.log).to.have.been.calledOnceWithExactly('error', error.response.data);
    });

    it('should preserve errors without a response and log their message once', async () => {
      const error = new Error('Connection failed');
      notifyClient.sendEmail.rejects(error);

      await expect(notify.send(email)).to.be.rejected.then(actualError => {
        expect(actualError).to.equal(error);
      });

      expect(logger.log).to.have.been.calledOnceWithExactly('error', error.message);
    });
  });
});
