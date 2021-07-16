
const ClearSessionBehaviour = require('../../components').clearSession;

describe('Clear session behaviour', () => {
  class Base {}

  describe('#getValues', () => {
    let behaviour;
    let Behaviour;
    let superGetValuesStub;
    let req;
    let otherReq;
    let badReq;
    let res;
    let next;
    let resetStub;

    beforeEach(() => {
      resetStub = sinon.stub();
      req = hof_request();
      req.path = '/not-confirm-step';
      req.sessionModel.reset = resetStub;
      otherReq = hof_request();
      otherReq.path = '/confirm';
      badReq = hof_request();
      res = response();
      res.locals.confirmStep = '/confirm';
      next = sinon.stub();

      superGetValuesStub = sinon.stub();
      superGetValuesStub.withArgs(req, res).yields(null, 'values');
      superGetValuesStub.withArgs(otherReq, res).yields(null, 'values');
      superGetValuesStub.withArgs(badReq, res).yields('error');

      Base.prototype.getValues = superGetValuesStub;

      Behaviour = ClearSessionBehaviour(Base);

      behaviour = new Behaviour();

      behaviour.options = {
        next: '/next',
        steps: {
          '/confirm': {
            uploadPdfShared: true,
            submitted: true
          }
        }
      };

      behaviour.getValues(req, res, next);
    });

    it('should return a mixin', () => {
      expect(behaviour).to.be.an.instanceOf(Base);
    });

    it('calls the callback if there is an error', () => {
      next.reset();
      behaviour.getValues(badReq, res, next);
      next.should.have.been.calledOnce.calledWithExactly('error', undefined);
    });

    it('sets /confirm step uploadPdfShared option to false if not on the confirm step', () => {
      const confirmStepOptions = behaviour.options.steps['/confirm'];
      expect(confirmStepOptions.uploadPdfShared).to.be.false;
    });

    it('sets /confirm step submitted option to false if not on the confirm step', () => {
      const confirmStepOptions = behaviour.options.steps['/confirm'];
      expect(confirmStepOptions.submitted).to.be.false;
    });

    it('does not set /confirm step options to false if on the confirm step', () => {
      behaviour.options = {
        next: '/next',
        steps: {
          '/confirm': {
            uploadPdfShared: true,
            submitted: true
          }
        }
      };
      behaviour.getValues(otherReq, res, next);
      const confirmStepOptions = behaviour.options.steps['/confirm'];

      expect(confirmStepOptions.uploadPdfShared).to.be.true;
      expect(confirmStepOptions.submitted).to.be.true;
    });

    it('does not reset the session if clearSession set to false', () => {
      behaviour.options = {
        clearSession: false
      };
      behaviour.getValues(req, res, next);
      resetStub.should.not.have.been.called;
    });

    it('does not reset the session if clearSession set to false and no next step', () => {
      behaviour.options = {
        next: null,
        clearSession: false
      };
      behaviour.getValues(req, res, next);
      resetStub.should.not.have.been.called;
    });

    it('resets the session if there is no next step and clearSession is not set', () => {
      behaviour.options = {
        next: undefined,
        clearSession: undefined
      };
      behaviour.getValues(req, res, next);
      resetStub.should.have.been.calledOnce;
    });

    it('resets the session if there is a next step and clearSession is set to true', () => {
      behaviour.options = {
        clearSession: true
      };
      behaviour.getValues(req, res, next);
      resetStub.should.have.been.calledOnce;
    });

    it('should call the callback if everything succeeds', () => {
      next.should.have.been.calledOnce.calledWithExactly(null, 'values');
    });
  });
});
