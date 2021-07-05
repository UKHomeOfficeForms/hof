
'use strict';

const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect;
const sandbox = require('mocha-sandbox');
const request = hof_request();

chai.use(require('sinon-chai'));

const Behaviour = require('../../../components').emailer;

const fs = require('fs');
const Emailer = Behaviour.EmailService;

// helper to avoid having to define full options every time
const options = (opts) => {
  return Object.assign({
    transport: 'stub',
    recipient: 'test@example.com',
    subject: 'confirmation email',
    template: '/path/to/to/my/email/template.html'
  }, opts);
};

describe('Emailer Behaviour', () => {

  beforeEach(() => {
    sinon.stub(fs, 'readFile').withArgs('/path/to/to/my/email/template.html').yieldsAsync(null, 'hello {{name}}');
    sinon.stub(Emailer.prototype, 'send').returns(Promise.resolve());
  });

  afterEach(() => {
    fs.readFile.restore();
    Emailer.prototype.send.restore();
  });

  it('exports a function', () => {
    expect(Behaviour).to.be.a('function');
  });

  describe('initialisation', () => {

    const make = (opts) => {
      return Behaviour(options(opts))(class {});
    };

    it('returns a mixin', () => {
      const opts = options({ recipient: 'test@example.com' });
      class Base {}
      const Mixed = Behaviour(opts)(Base);
      expect(new Mixed()).to.be.an.instanceOf(Base);
    });

    it('errors if no recipient is set', () => {
      expect(() => make({ recipient: null })).to.throw();
    });

    it('errors if no template is set', () => {
      expect(() => make({ template: null })).to.throw();
    });

  });

  describe('successHandler', () => {

    class Base {
      successHandler() {}
    }

    let controller;
    let req;

    beforeEach(() => {
      sinon.stub(Base.prototype, 'successHandler').yieldsAsync();
      const Email = Behaviour(options())(Base);
      controller = new Email();
      req = hof_request();
    });

    afterEach(() => {
      Base.prototype.successHandler.restore();
    });

    it('exists, and is a function', () => {
      const Mixed = Behaviour(options())(class {});
      const instance = new Mixed();
      expect(instance).to.have.property('successHandler');
      expect(instance.successHandler).to.be.a('function');
    });

    it('sends an email to the configured recipient', done => {
      controller.successHandler(req, {}, sandbox(err => {
        expect(err).not.to.exist;
        expect(Emailer.prototype.send).to.have.been.calledWith(sinon.match({
          recipient: 'test@example.com'
        }));
      }, done));
    });

    it('loads the recipient address from the session model if configured with a key', done => {
      const opts = options({ recipient: 'user-email' });
      const Email = Behaviour(opts)(Base);
      controller = new Email();
      req.sessionModel.set('user-email', 'user@example.com');
      controller.successHandler(req, {}, sandbox(err => {
        expect(err).not.to.exist;
        expect(Emailer.prototype.send).to.have.been.calledWith(sinon.match({
          recipient: 'user@example.com'
        }));
      }, done));
    });

    it('loads the recipient address from a function if passed', done => {
      const opts = options({ recipient: data => `${data.name}@example.com` });
      const Email = Behaviour(opts)(Base);
      controller = new Email();
      req.sessionModel.set('name', 'bob');
      controller.successHandler(req, {}, sandbox(err => {
        expect(err).not.to.exist;
        expect(Emailer.prototype.send).to.have.been.calledWith(sinon.match({
          recipient: 'bob@example.com'
        }));
      }, done));
    });

    it('throws error if recipient does not resolve to a string', done => {
      const opts = options({ recipient: data => `${data.name}@example.com` });
      const Email = Behaviour(opts)(Base);
      controller = new Email();
      req.sessionModel.set('name', 'bob');
      controller.successHandler(req, {}, sandbox(err => {
        expect(err).not.to.exist;
      }, done));
    });

    it('throws error if recipient resolves to a null value', done => {
      const opts = options({ recipient: 'unknown-field' });
      req.sessionModel.unset('unknown-field');
      const Email = Behaviour(opts)(Base);
      controller = new Email();
      controller.successHandler(req, {}, sandbox(err => {
        expect(err).to.be.an('error');
      }, done));
    });

    it('throws error if recipient resolves to a string that is not an email address', done => {
      const opts = options({ recipient: 'name' });
      req.sessionModel.set('name', 'Alice');
      const Email = Behaviour(opts)(Base);
      controller = new Email();
      controller.successHandler(req, {}, sandbox(err => {
        expect(err).to.be.an('error');
      }, done));
    });

    it('sends an email with a body of a rendered template', done => {
      req.sessionModel.set('name', 'Alice');
      controller.successHandler(req, {}, sandbox(err => {
        expect(err).not.to.exist;
        expect(Emailer.prototype.send).to.have.been.calledWith(sinon.match({
          body: 'hello Alice'
        }));
      }, done));
    });

    it('sends an email with the configured subject', done => {
      controller.successHandler(req, {}, sandbox(err => {
        expect(err).not.to.exist;
        expect(Emailer.prototype.send).to.have.been.calledWith(sinon.match({
          subject: 'confirmation email'
        }));
      }, done));
    });

    it('loads the subject from a function if passed', done => {
      const opts = options({ subject: data => `application for ${data.name}` });
      const Email = Behaviour(opts)(Base);
      controller = new Email();
      req.sessionModel.set('name', 'bob');
      controller.successHandler(req, {}, sandbox(err => {
        expect(err).not.to.exist;
        expect(Emailer.prototype.send).to.have.been.calledWith(sinon.match({
          subject: 'application for bob'
        }));
      }, done));
    });

    it('passes req.translate method to subject function', done => {
      req.translate = key => `translated ${key}`;
      const opts = options({ subject: (data, translate) => `application for ${translate('name')}` });
      const Email = Behaviour(opts)(Base);
      controller = new Email();
      controller.successHandler(req, {}, sandbox(err => {
        expect(err).not.to.exist;
        expect(Emailer.prototype.send).to.have.been.calledWith(sinon.match({
          subject: 'application for translated name'
        }));
      }, done));
    });

    it('passes model through parse function if provided', done => {
      const opts = options({
        parse: data => Object.assign(data, { name: `${data.firstName} ${data.lastName}` })
      });
      const Email = Behaviour(opts)(Base);
      req.sessionModel.set({
        firstName: 'Alice',
        lastName: 'Smith'
      });
      controller = new Email();
      controller.successHandler(req, {}, sandbox(err => {
        expect(err).not.to.exist;
        expect(Emailer.prototype.send).to.have.been.calledWith(sinon.match({
          body: 'hello Alice Smith'
        }));
      }, done));
    });

    it('passes req.translate method to parse function', done => {
      req.translate = key => `translated ${key}`;
      const opts = options({
        parse: (data, translate) => Object.assign(data, { name: translate('name') })
      });
      const Email = Behaviour(opts)(Base);
      controller = new Email();
      controller.successHandler(req, {}, sandbox(err => {
        expect(err).not.to.exist;
        expect(Emailer.prototype.send).to.have.been.calledWith(sinon.match({
          body: 'hello translated name'
        }));
      }, done));
    });

    it('calls through to super.successHandler when complete', done => {
      controller.successHandler(req, {}, sandbox(err => {
        expect(err).not.to.exist;
        expect(Base.prototype.successHandler).to.have.been.calledWith(req, {});
        expect(Base.prototype.successHandler).to.have.been.calledAfter(Emailer.prototype.send);
      }, done));
    });

    it('calls back with error if template cannot be loaded', done => {
      const err = new Error('readfile failed');
      fs.readFile.withArgs('/path/to/to/my/email/template.html').yieldsAsync(err);
      controller.successHandler(req, {}, sandbox(e => {
        expect(e).to.equal(err);
      }, done));
    });

  });

});
