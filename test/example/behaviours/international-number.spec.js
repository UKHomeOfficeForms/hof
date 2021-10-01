
describe.only('International Phone Number Example Behaviour', () => {
  let behaviour;
  let Behaviour;
  let superValidationErrorStub;
  let superValidateStub;
  let objStub;
  let sandbox;
  let req;
  let res;

  const complexAmericanNumber = '(213) 373-42-53 ext. 1234';

  class Base {
    validateField(key, req) {
      return superValidateStub(key, req);
    }
  }

  beforeEach(() => {
    req = hof_request();
    res = response();
    objStub = {
      key: 'int-phone-number',
      type: 'internationalPhoneNumber',
      redirect: undefined
    };

    superValidationErrorStub = sinon.stub();
    superValidateStub = sinon.stub();
    superValidateStub.withArgs('int-phone-number', req).returns('success');

    Behaviour = require('../../../example/apps/example-app/behaviours/international-number');
    Behaviour = Behaviour(Base);
    behaviour = new Behaviour();
    behaviour.ValidationError = superValidationErrorStub;
  });

  describe('initialisation', () => {
    it('returns a mixin', () => {
      expect(behaviour).to.be.an.instanceOf(Base);
    });
  });

  describe('#validateField', () => {
    beforeEach(() => {
      req.form.values['int-phone-number'] = '+33235710410';
    });

    it('passes an valid number', () => {
      const result = behaviour.validateField('int-phone-number', req);
      superValidateStub.should.have.been.calledOnce.calledWithExactly('int-phone-number', req);
      expect(result).to.eq('success');
    });

    it('fails an invalid number', () => {
      req.form.values['int-phone-number'] = complexAmericanNumber;
      behaviour.validateField('int-phone-number', req);
      superValidateStub.should.not.have.been.called;
      superValidationErrorStub.should.have.been.calledOnce.calledWithExactly('int-phone-number', objStub);
    });
  });
});
