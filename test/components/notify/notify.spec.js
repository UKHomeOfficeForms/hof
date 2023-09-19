'use strict';
const NotifyClient = require('notifications-node-client').NotifyClient;
const proxyquire = require('proxyquire');

describe('Notify', () => {
  let notifyClient;
  let Notify;
  let notify;
  let req;
  let nextStub;

  const testTemplate = 'testTemplate';

  const email = {
    subject: 'test-subject',
    recipient: 'sterling@archer.com',
    body: 'test-body'
  };

  beforeEach(() => {
    req = {
      form: {
        values: {}
      },
      log: sinon.stub(),
      sessionModel: {
        get: sinon.stub(),
        set: sinon.stub(),
        unset: sinon.stub()
      },
      session: {
        save: sinon.stub()
      },
      headers: {
        referer: ''
      }
    };

    nextStub = sinon.stub();

    notifyClient =  {
      sendEmail: sinon.stub(NotifyClient.prototype, 'sendEmail')
    };

    notifyClient.sendEmail.resolves();

    Notify = proxyquire('../../../components/notify/notify', {
      notifyClient
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('constructor', () => {
    it('creates an instance', () => {
      notify = new Notify({
        notifyApiKey: '123456'
      });
    });

    it('throws if notifyApiKey is not defined', () => {
      const make = opts => () => new Notify(opts);
      make().should.throw();
      make({ notifyApiKey: '123456' }).should.not.throw();
    });
  });

  describe('send', () => {
    beforeEach(() => {
      const options = {
        notifyApiKey: '123456',
        template: testTemplate
      };
      notify = new Notify(options);
    });

    it('sendEmail is called with config templateId, emailAddress and personalisation values', () => {
      return notify.send(email, req, nextStub)
        .then(() => {
          expect(notify.notifyClient.sendEmail).to.have.been.calledOnce;
        });
    });
  });
});
