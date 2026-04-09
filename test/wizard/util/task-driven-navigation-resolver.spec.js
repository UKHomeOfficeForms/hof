'use strict';

const resolver = require('../../../wizard/util/task-driven-navigation-resolver');

describe('task driven navigation resolver', () => {
  let req;
  let res;
  let controller;
  let navigationConfig;

  beforeEach(() => {
    req = hof_request();
    req.body = {};
    req.query = {};
    req.form.options = {
      route: '/start'
    };
    req.form.values = {
      selected_task: 'task-two'
    };
    req.sessionModel.set({
      selected_task: 'task-one',
      task_two_enabled: true
    });
    res = {};
    controller = {
      options: {
        appConfig: {
          taskNavigation: {
            unit_test: 'from-app-config'
          }
        }
      }
    };
    navigationConfig = {
      taskSelection: {
        field: 'selected_task',
        selectorStep: '/start',
        finalSummaryStep: '/confirm',
        completedField: 'completed_tasks',
        tasks: {
          'task-one': {
            order: 2,
            entryStep: '/task-one/name',
            summaryStep: '/task-one/check',
            routes: ['/task-one/name', '/task-one/dob']
          },
          'task-two': {
            order: 1,
            entryStep: '/task-two/type',
            summaryStep: '/task-two/check',
            routes: ['/task-two/type'],
            when: {
              field: 'task_two_enabled',
              source: 'session',
              value: true
            }
          }
        }
      },
      routes: {
        '/start': {
          next: 'selected-task-entry'
        },
        '/task-one/anything-else': {
          branches: [
            {
              condition: {
                field: 'do_another_task',
                source: 'body',
                value: 'yes'
              },
              next: 'task-selector'
            },
            {
              condition: {
                field: 'do_another_task',
                source: 'body',
                value: 'no'
              },
              next: 'final-summary'
            }
          ]
        },
        '/task-two/check': {
          backLink: '/task-two/type'
        }
      }
    };
  });

  describe('getNavigationConfig', () => {
    it('should return the provided config object when one is supplied', () => {
      resolver.getNavigationConfig(req, controller.options, navigationConfig)
        .should.equal(navigationConfig);
    });

    it('should evaluate a config function when one is supplied', () => {
      const configFunction = sinon.stub().returns({ unit_test: 'from-function' });

      const config = resolver.getNavigationConfig(
        req,
        controller.options,
        configFunction
      );

      config.should.eql({ unit_test: 'from-function' });
      configFunction.should.have.been.calledOnce;
      configFunction.should.have.been.calledWithExactly(req, controller.options);
    });

    it('should fall back to app config when no config argument is supplied', () => {
      resolver.getNavigationConfig(req, controller.options)
        .should.eql({ unit_test: 'from-app-config' });
    });
  });

  describe('isConditionSatisfied', () => {
    it('should resolve nested any and session field conditions', () => {
      const condition = {
        any: [
          {
            field: 'task_two_enabled',
            source: 'session',
            value: false
          },
          {
            all: [
              {
                field: 'do_another_task',
                source: 'body',
                value: 'yes'
              },
              {
                field: 'task_two_enabled',
                source: 'session',
                value: true
              }
            ]
          }
        ]
      };

      req.body.do_another_task = 'yes';

      resolver.isConditionSatisfied(condition, req, res).should.equal(true);
    });
  });

  describe('getSelectedTaskKey', () => {
    it('should return the enabled selected task', () => {
      resolver.getSelectedTaskKey(navigationConfig.taskSelection, req, res)
        .should.equal('task-two');
    });
  });

  describe('getCurrentTaskKey', () => {
    it('should map a route to its owning task', () => {
      resolver.getCurrentTaskKey(
        '/task-one/dob',
        navigationConfig.taskSelection,
        req,
        res
      ).should.equal('task-one');
    });
  });

  describe('resolveNext', () => {
    it('should resolve the selected task entry from the landing page', () => {
      const result = resolver.resolveNext(
        '/start',
        req,
        res,
        controller,
        navigationConfig
      );

      result.next.should.equal('/task-two/type');
    });

    it('should route back to the task selector when the user wants to do something else', () => {
      req.body.do_another_task = 'yes';

      const result = resolver.resolveNext(
        '/task-one/anything-else',
        req,
        res,
        controller,
        navigationConfig
      );

      result.next.should.equal('/start');
    });

    it('should route to the final summary when the user does not want another task', () => {
      req.body.do_another_task = 'no';

      const result = resolver.resolveNext(
        '/task-one/anything-else',
        req,
        res,
        controller,
        navigationConfig
      );

      result.next.should.equal('/confirm');
    });
  });

  describe('resolveBackLink', () => {
    it('should return an explicit configured back link when one exists', () => {
      resolver.resolveBackLink('/task-two/check', req, res, controller, navigationConfig)
        .should.equal('/task-two/type');
    });
  });
});
