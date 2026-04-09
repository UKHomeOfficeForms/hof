'use strict';

const proxyquire = require('proxyquire');

describe('task driven navigation behaviour', () => {
  class Base {
    getBackLink() {
      return 'super-back-link';
    }

    getNextStep() {
      return '/super-next-step';
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
        taskSelection: {
          field: 'selected_task',
          selectorStep: '/start',
          finalSummaryStep: '/confirm',
          completedField: 'completed_tasks',
          tasks: {
            'task-one': {
              entryStep: '/task-one/start',
              summaryStep: '/task-one/check'
            },
            'task-two': {
              entryStep: '/task-two/start',
              summaryStep: '/task-two/check'
            }
          }
        }
      }),
      getCurrentTaskKey: sinon.stub().returns(null),
      resolveNext: sinon.stub().returns({ next: '/task-one/start' }),
      resolveBackLink: sinon.stub().returns(undefined)
    };
    navigationConfig = {
      unit_test: true
    };
    Behaviour = proxyquire('../../components/task-driven-navigation', {
      '../../wizard/util/task-driven-navigation-resolver': navigation
    })(navigationConfig)(Base);
    behaviour = new Behaviour();
    behaviour.confirmStep = '/confirm';
    behaviour.options = {
      steps: {}
    };

    req = hof_request();
    req.baseUrl = '/unit-base';
    req.params = {};
    req.form.options.route = '/current-step';
    req.form.options.steps = behaviour.options.steps;
    req.form.options.continueOnEdit = false;
    req.sessionModel.set('steps', ['/task-one/start', '/task-one/check']);
    req.sessionModel.set('completed_tasks', ['task-two']);
    res = {
      locals: {}
    };

    sinon.spy(Base.prototype, 'getBackLink');
    sinon.spy(Base.prototype, 'getNextStep');
    sinon.spy(Base.prototype, 'successHandler');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should resolve the configured next step from the navigation resolver', () => {
    const configured = behaviour.getConfiguredNext(req, res);

    configured.should.eql({ next: '/task-one/start' });
    navigation.resolveNext.should.have.been.calledOnce;
    navigation.resolveNext.should.have.been.calledWithExactly(
      '/current-step',
      req,
      res,
      behaviour,
      navigationConfig
    );
  });

  it('should mark a task as completed when leaving its summary step', () => {
    req.form.options.route = '/task-one/check';
    navigation.getCurrentTaskKey.returns('task-one');

    const result = behaviour.successHandler(req, res);

    result.should.equal('super-success-handler');
    req.sessionModel.get('completed_tasks').should.eql(['task-two', 'task-one']);
    Base.prototype.successHandler.should.have.been.calledOnce;
    Base.prototype.successHandler.should.have.been.calledWithExactly(req, res);
  });

  it('should not mark a task as completed for non-summary routes', () => {
    req.form.options.route = '/task-one/start';
    navigation.getCurrentTaskKey.returns('task-one');

    behaviour.successHandler(req, res);

    req.sessionModel.get('completed_tasks').should.eql(['task-two']);
  });

  it('should set the resolved back link before delegating to the parent method', () => {
    navigation.resolveBackLink.returns('/unit-base/start');

    const result = behaviour.getBackLink(req, res);

    result.should.equal('super-back-link');
    res.locals.backLink.should.equal('start');
    Base.prototype.getBackLink.should.have.been.calledOnce;
    Base.prototype.getBackLink.should.have.been.calledWithExactly(req, res);
  });

  it('should not override an explicitly configured falsy back link', () => {
    req.form.options.backLink = false;
    res.locals.backLink = false;

    const result = behaviour.getBackLink(req, res);

    result.should.equal('super-back-link');
    should.equal(res.locals.backLink, false);
    navigation.resolveBackLink.should.not.have.been.called;
  });

  it('should fall back to the parent next step when no configured next step exists', () => {
    navigation.resolveNext.returns({ next: null });

    const next = behaviour.getNextStep(req, res);

    next.should.equal('/super-next-step');
  });

  it('should append edit in edit mode when continueOnEdit is enabled', () => {
    req.params.action = 'edit';
    navigation.resolveNext.returns({
      next: '/task-three/start',
      continueOnEdit: true
    });

    const next = behaviour.getNextStep(req, res);

    req.form.options.continueOnEdit.should.equal(true);
    next.should.equal('/unit-base/task-three/start/edit');
  });
});
