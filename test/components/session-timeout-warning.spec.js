'use strict';

const Component = require('../../components').sessionTimeoutWarning;
const config = require('../../config/hof-defaults');

describe('session timeout warning component', () => {
  class Base {
    configure() { }
    locals() { }
  }

  let req;
  let res;
  let instance;
  let next;
  let resetStub;

  beforeEach(() => {
    req = hof_request();
    res = reqres.res();
    resetStub = sinon.stub();
    req.sessionModel.reset = resetStub;
    next = sinon.stub();
  });
  describe("The 'configure' method ", () => {
    beforeEach(() => {
      sinon.stub(Base.prototype, 'configure').returns(req, res, next);
      instance = new (Component(Base))();
    });

    it('resets the session if on the exit page', () => {
      req.form = {
        options: {
          route: '/exit'
        }
      };
      instance.configure(req, res, next);
      resetStub.should.have.been.calledOnce;
    });

    it('does not reset the session if not on the exit page', () => {
      req.form = {
        options: {
          route: '/name'
        }
      };
      instance.configure(req, res, next);
      resetStub.should.not.have.been.called;
    });


    afterEach(() => {
      Base.prototype.configure.restore();
    });
  });

  describe("The 'locals' method ", () => {
    beforeEach(() => {
      sinon.stub(Base.prototype, 'locals').returns(req, res);
      instance = new (Component(Base))();
    });

    it('sets the default dialog content to true if locals.sessionTimeoutWarningContent is set to true', () => {
      res.locals = {
        sessionTimeoutWarningContent: true
      };
      instance.locals(req, res);
      instance.locals(req, res).should.have.property('dialogTitle')
        .and.deep.equal(true);
      instance.locals(req, res).should.have.property('dialogText')
        .and.deep.equal(true);
      instance.locals(req, res).should.have.property('timeoutContinueButton')
        .and.deep.equal(true);
      instance.locals(req, res).should.have.property('dialogExitLink')
        .and.deep.equal(true);
    });

    it('does not set the dialog content to true if locals.sessionTimeoutWarningContent is set to false', () => {
      res.locals = {
        sessionTimeoutWarningContent: false
      };
      instance.locals(req, res);
      instance.locals(req, res).should.not.have.property('dialogTitle');
      instance.locals(req, res).should.not.have.property('dialogText');
      instance.locals(req, res).should.not.have.property('timeoutContinueButton');
      instance.locals(req, res).should.not.have.property('dialogExitLink');
    });

    it('sets the custom content to true on the exit page if exitFormContent is set to true', () => {
      config.exitFormContent = true;
      req.form = {
        options: {
          route: '/exit'
        }
      };
      instance.locals(req, res);
      instance.locals(req, res).should.have.property('exitFormContent')
        .and.deep.equal(true);
    });

    it('does sets the default content on the exit page if exitFormContent is set to false', () => {
      config.exitFormContent = false;
      req.form = {
        options: {
          route: '/exit'
        }
      };
      instance.locals(req, res);
      instance.locals(req, res).should.have.property('header')
        .and.deep.equal('exit.header');
      instance.locals(req, res).should.have.property('title')
        .and.deep.equal('exit.title');
      instance.locals(req, res).should.have.property('message')
        .and.deep.equal('exit.message');
    });

    afterEach(() => {
      Base.prototype.locals.restore();
    });
  });
});
