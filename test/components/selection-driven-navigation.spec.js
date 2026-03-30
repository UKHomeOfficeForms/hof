'use strict';

const proxyquire = require('proxyquire');

describe('selection driven navigation behaviour', () => {
  class Base {
    getBackLink() {
      return 'super-back-link';
    }

    getNextStep() {
      return '/super-next-step';
    }

    process() {
      return 'super-process';
    }

    validate() {
      return 'super-validate';
    }

    successHandler() {
      return 'super-success-handler';
    }
  }

  let Behaviour;
  let behaviour;
  let navigation;
  let navigationConfig;
  let req;
  let res;

  beforeEach(() => {
    navigation = {
      getNavigationConfig: sinon.stub().returns({
        selection: {
          field: 'selected_items',
          selectorStep: '/selector',
          summaryStep: '/confirm',
          items: {
            'unit-item-one': {
              routes: ['/unit-item-one']
            },
            'unit-item-two': {
              routes: ['/unit-item-two']
            }
          }
        }
      }),
      resolveNext: sinon.stub().returns({ next: '/unit-item-one' }),
      resolveInvalidatedSteps: sinon.stub().returns([]),
      resolveBackLink: sinon.stub().returns(undefined)
    };
    navigationConfig = {
      unit_test: true
    };
    Behaviour = proxyquire('../../components/selection-driven-navigation', {
      '../../wizard/util/selection-driven-navigation-resolver': navigation
    })(navigationConfig)(Base);
    behaviour = new Behaviour();
    behaviour.confirmStep = '/confirm';
    behaviour.options = {
      steps: {
        '/unit-item-one': {
          fields: ['unit-field-one']
        },
        '/unit-item-two': {
          fields: ['unit-field-two']
        }
      }
    };

    req = hof_request();
    req.baseUrl = '/unit-base';
    req.params = {};
    req.form.options.route = '/current-step';
    req.form.options.steps = behaviour.options.steps;
    req.form.options.continueOnEdit = false;
    req.form.values = {};
    req.sessionModel.set('steps', ['/unit-item-one', '/unit-item-two']);
    req.sessionModel.set('selected_items', ['unit-item-two']);
    sinon.spy(req.sessionModel, 'unset');
    res = {
      locals: {}
    };

    sinon.spy(Base.prototype, 'getBackLink');
    sinon.spy(Base.prototype, 'getNextStep');
    sinon.spy(Base.prototype, 'process');
    sinon.spy(Base.prototype, 'successHandler');
    sinon.spy(Base.prototype, 'validate');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should resolve the configured next step from the navigation resolver', () => {
    const configured = behaviour.getConfiguredNext(req, res);

    configured.should.eql({ next: '/unit-item-one' });
    navigation.resolveNext.should.have.been.calledOnce;
    navigation.resolveNext.should.have.been.calledWithExactly(
      '/current-step',
      req,
      res,
      behaviour,
      navigationConfig
    );
  });

  it('should capture the current selector value from session before processing', () => {
    req.form.options.route = '/selector';
    const next = sinon.stub();

    const result = behaviour.process(req, res, next);

    result.should.equal('super-process');
    req.form.selectionHistoricalValues.should.eql({
      selected_items: ['unit-item-two']
    });
    navigation.getNavigationConfig.should.have.been.calledOnce;
    navigation.getNavigationConfig.should.have.been.calledWithExactly(
      req,
      behaviour.options,
      navigationConfig
    );
    Base.prototype.process.should.have.been.calledOnce;
    Base.prototype.process.should.have.been.calledWithExactly(req, res, next);
  });

  it('should skip selection history capture when no selection field is configured', () => {
    navigation.getNavigationConfig.returns({ selection: {} });

    behaviour.captureSelectionHistory(req);

    should.not.exist(req.form.selectionHistoricalValues);
  });

  it('should invalidate skipped steps before calling the parent success handler', () => {
    navigation.resolveInvalidatedSteps.returns(['/unit-item-one']);

    const result = behaviour.successHandler(req, res);

    result.should.equal('super-success-handler');
    req.sessionModel.unset.should.have.been.calledOnce;
    req.sessionModel.unset.should.have.been.calledWithExactly(['unit-field-one']);
    req.sessionModel.get('steps').should.eql(['/unit-item-two']);
    Base.prototype.successHandler.should.have.been.calledOnce;
    Base.prototype.successHandler.should.have.been.calledWithExactly(req, res);
  });

  it('should add the current item to the selection after a successful save when it now has a value', () => {
    req.form.options.route = '/unit-item-one';
    req.sessionModel.set('unit-field-one', 'updated value');

    behaviour.successHandler(req, res);

    req.sessionModel.get('selected_items').should.eql([
      'unit-item-two',
      'unit-item-one'
    ]);
  });

  it('should not add the current item to the selection when the route still has no value', () => {
    req.form.options.route = '/unit-item-one';
    req.sessionModel.unset('unit-field-one');

    behaviour.successHandler(req, res);

    req.sessionModel.get('selected_items').should.eql(['unit-item-two']);
  });

  it('should set the resolved back link before delegating to the parent method', () => {
    navigation.resolveBackLink.returns('/unit-base/unit-item-one');

    const result = behaviour.getBackLink(req, res);

    result.should.equal('super-back-link');
    res.locals.backLink.should.equal('unit-item-one');
    Base.prototype.getBackLink.should.have.been.calledOnce;
    Base.prototype.getBackLink.should.have.been.calledWithExactly(req, res);
  });

  it('should not override an explicitly configured falsy back link', () => {
    req.form.options.backLink = false;
    res.locals.backLink = false;

    const result = behaviour.getBackLink(req, res);

    should.equal(res.locals.backLink, false);
    result.should.equal('super-back-link');
    navigation.resolveBackLink.should.not.have.been.called;
    Base.prototype.getBackLink.should.have.been.calledOnce;
    Base.prototype.getBackLink.should.have.been.calledWithExactly(req, res);
  });

  it('should normalise an empty selector submission before validation', () => {
    req.form.options.route = '/selector';
    const next = sinon.stub();

    const result = behaviour.validate(req, res, next);

    result.should.equal('super-validate');
    req.form.values.selected_items.should.eql([]);
    Base.prototype.validate.should.have.been.calledOnce;
    Base.prototype.validate.should.have.been.calledWithExactly(req, res, next);
  });

  it('should not overwrite submitted selector values during validation', () => {
    req.form.options.route = '/selector';
    req.form.values.selected_items = ['unit-item-one'];

    behaviour.validate(req, res);

    req.form.values.selected_items.should.eql(['unit-item-one']);
  });

  it('should fall back to the parent next step when no configured next step exists', () => {
    navigation.resolveNext.returns({ next: null });

    const next = behaviour.getNextStep(req, res);

    next.should.equal('/super-next-step');
    Base.prototype.getNextStep.should.have.been.calledOnce;
    Base.prototype.getNextStep.should.have.been.calledWithExactly(req, res);
  });

  it('should redirect to confirm in edit mode when the resolved step was already completed', () => {
    req.params.action = 'edit';

    const next = behaviour.getNextStep(req, res);

    next.should.equal('/unit-base/confirm');
  });

  it('should append edit in edit mode when continueOnEdit is enabled', () => {
    req.params.action = 'edit';
    navigation.resolveNext.returns({
      next: '/unit-item-three',
      continueOnEdit: true
    });

    const next = behaviour.getNextStep(req, res);

    req.form.options.continueOnEdit.should.equal(true);
    next.should.equal('/unit-base/unit-item-three/edit');
  });
});
