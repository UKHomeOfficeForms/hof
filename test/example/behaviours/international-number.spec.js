
describe('International Phone Number Example Behaviour', () => {
  let behaviour;
  let Behaviour;
  let superValidationErrorStub;
  let superValidateStub;
  let objStub;
  let req;

  const complexAmericanNumber = '(213) 373-42-53 ext. 1234';

  class Base {
    validateField(key, request) {
      return superValidateStub(key, request);
    }
  }

  beforeEach(() => {
    req = hof_request();
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
    describe('no country code entered', () => {
      it('passes a simple foreign number', () => {
        req.form.values['int-phone-number'] = '+33235710410';
        const result = behaviour.validateField('int-phone-number', req);
        superValidateStub.should.have.been.calledOnce.calledWithExactly('int-phone-number', req);
        expect(result).to.eq('success');
      });

      it('fails a complex foreign number', () => {
        req.form.values['int-phone-number'] = complexAmericanNumber;
        behaviour.validateField('int-phone-number', req);
        superValidateStub.should.not.have.been.called;
        superValidationErrorStub.should.have.been.calledOnce.calledWithExactly('int-phone-number', objStub);
      });

      it('fails inaccurate foreign numbers', () => {
        req.form.values['int-phone-number'] = '######';
        behaviour.validateField('int-phone-number', req);
        superValidateStub.should.not.have.been.called;
        superValidationErrorStub.should.have.been.calledOnce.calledWithExactly('int-phone-number', objStub);
      });
    });

    describe('country code entered', () => {
      it('it passes a simple foreign number', () => {
        req.form.values['int-phone-number'] = '+33235710410';
        const result = behaviour.validateField('int-phone-number', req);
        superValidateStub.should.have.been.calledOnce.calledWithExactly('int-phone-number', req);
        expect(result).to.eq('success');
      });

      it('it passes a complex foreign number', () => {
        req.form.values['int-phone-number'] = complexAmericanNumber;
        req.sessionModel.set('countryCode', 'US');
        const result = behaviour.validateField('int-phone-number', req);
        superValidateStub.should.have.been.calledOnce.calledWithExactly('int-phone-number', req);
        expect(result).to.eq('success');
      });

      it('fails inaccurate foreign numbers', () => {
        req.form.values['int-phone-number'] = '######';
        behaviour.validateField('int-phone-number', req);
        superValidateStub.should.not.have.been.called;
        superValidationErrorStub.should.have.been.calledOnce.calledWithExactly('int-phone-number', objStub);
      });
    });
  });
});
