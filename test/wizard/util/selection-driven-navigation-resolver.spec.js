'use strict';

const resolver = require('../../../wizard/util/selection-driven-navigation-resolver');

describe('selection driven navigation resolver', () => {
  let req;
  let res;
  let controller;
  let navigationConfig;

  beforeEach(() => {
    req = hof_request();
    req.body = {};
    req.query = {};
    req.form.options = {
      route: '/selector'
    };
    req.form.values = {
      selected_items: ['unit-item-one', 'unit-item-two']
    };
    req.form.historicalValues = {
      selected_items: ['unit-item-one', 'unit-item-two', 'unit-item-three']
    };
    req.sessionModel.set({
      selected_items: ['unit-item-two'],
      unit_flag: 'enabled',
      steps: ['/selector', '/unit-item-one-a', '/unit-item-one-b', '/summary']
    });
    res = {};
    controller = {
      options: {
        appConfig: {
          journeyNavigation: {
            unit_test: 'from-app-config'
          }
        }
      }
    };
    navigationConfig = {
      selection: {
        field: 'selected_items',
        selectorStep: '/selector',
        dispatcherStep: '/dispatcher',
        summaryStep: '/summary',
        addMore: {
          triggerStep: '/summary',
          triggerField: 'change_anything_else'
        },
        emptySelectionTarget: '/empty',
        items: {
          'unit-item-one': {
            order: 2,
            routes: ['/unit-item-one-a', '/unit-item-one-b']
          },
          'unit-item-two': {
            order: 1,
            routes: ['/unit-item-two-a'],
            when: {
              field: 'unit_flag',
              source: 'session',
              value: 'enabled'
            }
          },
          'unit-item-three': {
            order: 3,
            routes: ['/unit-item-three-a']
          }
        }
      },
      routes: {
        '/selector': {
          next: '/dispatcher'
        },
        '/dispatcher': {
          next: 'next-selected-item'
        },
        '/unit-item-one-a': {
          branches: [
            {
              condition: {
                field: 'unit_toggle',
                source: 'body',
                value: 'skip'
              },
              next: 'next-selected-item',
              continueOnEdit: true
            }
          ],
          default: {
            next: '/unit-item-one-b'
          }
        },
        '/unit-item-two-a': {
          backLink: '/unit-item-one-b'
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
            field: 'unit_flag',
            source: 'session',
            value: 'disabled'
          },
          {
            all: [
              {
                field: 'unit_toggle',
                source: 'body',
                value: 'skip'
              },
              {
                field: 'unit_flag',
                source: 'session',
                value: 'enabled'
              }
            ]
          }
        ]
      };

      req.body.unit_toggle = 'skip';

      resolver.isConditionSatisfied(condition, req, res).should.equal(true);
    });

    it('should resolve query based exists checks', () => {
      req.query.unit_query = 'available';

      resolver.isConditionSatisfied({
        field: 'unit_query',
        source: 'query',
        exists: true
      }, req, res).should.equal(true);
    });
  });

  describe('getSelectedItemKeys', () => {
    it('should return enabled selected items in configured order', () => {
      resolver.getSelectedItemKeys(navigationConfig.selection, req, res)
        .should.eql(['unit-item-two', 'unit-item-one']);
    });

    it('should use the active add-more subset when add-more mode is enabled', () => {
      req.sessionModel.set('selected_items-add-more-mode', true);
      req.sessionModel.set('selected_items-active-items', ['unit-item-one']);

      resolver.getSelectedItemKeys(navigationConfig.selection, req, res)
        .should.eql(['unit-item-one']);
    });
  });

  describe('resolveNext', () => {
    it('should expose the selection next step even when the configured dispatcher target resolves to summary', () => {
      const result = resolver.resolveNext(
        '/dispatcher',
        req,
        res,
        controller,
        navigationConfig
      );

      result.next.should.equal('/summary');
      result.selectionNext.should.equal('/unit-item-two-a');
    });

    it('should resolve branch targets and continueOnEdit flags', () => {
      req.body.unit_toggle = 'skip';

      const result = resolver.resolveNext(
        '/unit-item-one-a',
        req,
        res,
        controller,
        navigationConfig
      );

      result.next.should.equal('/summary');
      result.continueOnEdit.should.equal(true);
      result.matchedBranch.should.have.property('next', 'next-selected-item');
    });

    it('should fall back to the selection journey when no explicit route config is present', () => {
      const result = resolver.resolveNext(
        '/unit-item-one-b',
        req,
        res,
        controller,
        navigationConfig
      );

      result.next.should.equal('/summary');
    });

    it('should return to the summary step when add-more mode is active but no new items were selected', () => {
      req.sessionModel.set('selected_items-add-more-mode', true);
      req.sessionModel.set('selected_items-active-items', []);

      const result = resolver.resolveNext(
        '/dispatcher',
        req,
        res,
        controller,
        navigationConfig
      );

      result.next.should.equal('/summary');
    });
  });

  describe('resolveInvalidatedSteps', () => {
    it('should return skipped routes and deselected item routes without duplicates', () => {
      req.body.unit_toggle = 'skip';

      const invalidatedSteps = resolver.resolveInvalidatedSteps(
        '/unit-item-one-a',
        req,
        res,
        controller,
        navigationConfig
      );

      invalidatedSteps.should.eql(['/unit-item-one-b']);
    });

    it('should invalidate deselected item routes on the selector step', () => {
      req.form.values.selected_items = ['unit-item-one', 'unit-item-two'];
      req.form.historicalValues.selected_items = ['unit-item-one', 'unit-item-two', 'unit-item-three'];

      const invalidatedSteps = resolver.resolveInvalidatedSteps(
        '/selector',
        req,
        res,
        controller,
        navigationConfig
      );

      invalidatedSteps.should.eql(['/unit-item-three-a']);
    });

    it('should use captured selection history when form historical values are not available', () => {
      req.form.historicalValues = {};
      req.form.selectionHistoricalValues = {
        selected_items: ['unit-item-one', 'unit-item-two', 'unit-item-three']
      };
      req.form.values.selected_items = ['unit-item-one', 'unit-item-two'];

      const invalidatedSteps = resolver.resolveInvalidatedSteps(
        '/selector',
        req,
        res,
        controller,
        navigationConfig
      );

      invalidatedSteps.should.eql(['/unit-item-three-a']);
    });
  });

  describe('resolveBackLink', () => {
    it('should return an explicit configured back link when one exists', () => {
      resolver.resolveBackLink('/unit-item-two-a', req, res, controller, navigationConfig)
        .should.equal('/unit-item-one-b');
    });

    it('should fall back to the visited selection journey order', () => {
      req.sessionModel.set('steps', ['/selector', '/unit-item-two-a', '/unit-item-one-a']);

      resolver.resolveBackLink('/unit-item-one-a', req, res, controller, navigationConfig)
        .should.equal('/unit-item-two-a');
    });

    it('should use the last visited route when a branch skipped the previous static route', () => {
      req.sessionModel.set('steps', ['/selector', '/unit-item-one-a', '/summary']);

      resolver.resolveBackLink('/unit-item-three-a', req, res, controller, navigationConfig)
        .should.equal('/unit-item-one-a');
    });

    it('should ignore the summary step itself when resolving the summary backlink', () => {
      req.sessionModel.set('steps', ['/selector', '/unit-item-one-a', '/summary']);

      resolver.resolveBackLink('/summary', req, res, controller, navigationConfig)
        .should.equal('/unit-item-one-a');
    });
  });
});
