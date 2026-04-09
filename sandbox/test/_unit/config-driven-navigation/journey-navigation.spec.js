'use strict';

const resolver = require('../../../../wizard/util/selection-driven-navigation-resolver');
const journeyNavigation = require('../../../../sandbox/apps/config-driven-navigation/journey-navigation');

describe('config-driven navigation journey', () => {
  let req;
  let res;
  let controller;

  beforeEach(() => {
    req = global.hof_request();
    req.body = {};
    req.query = {};
    req.form.options = {
      route: '/start'
    };
    req.form.values = {};
    req.sessionModel.set({
      'selected-updates': ['name', 'surname'],
      steps: ['/start', '/name', '/surname', '/surname-summary', '/change-anything-else']
    });
    res = {};
    controller = {
      options: {
        appConfig: {
          journeyNavigation
        }
      }
    };
  });

  describe('change anything else step', () => {
    it('should go back to start when the user answers yes', () => {
      req.form.values['change-anything-else'] = 'yes';

      const result = resolver.resolveNext(
        '/change-anything-else',
        req,
        res,
        controller,
        journeyNavigation
      );

      result.next.should.equal('/start');
    });

    it('should go to confirm when the user answers no', () => {
      req.form.values['change-anything-else'] = 'no';

      const result = resolver.resolveNext(
        '/change-anything-else',
        req,
        res,
        controller,
        journeyNavigation
      );

      result.next.should.equal('/confirm');
    });

    it('should use the last visited selected route as the backlink', () => {
      resolver.resolveBackLink(
        '/change-anything-else',
        req,
        res,
        controller,
        journeyNavigation
      ).should.equal('/surname-summary');
    });
  });

  describe('guided add-more mode', () => {
    it('should return to change-anything-else when no new selections were added', () => {
      req.sessionModel.set('selected-updates-add-more-mode', true);
      req.sessionModel.set('selected-updates-add-more-baseline', ['name', 'surname']);
      req.sessionModel.set('selected-updates-active-items', []);

      const result = resolver.resolveNext(
        '/start',
        req,
        res,
        controller,
        journeyNavigation
      );

      result.next.should.equal('/change-anything-else');
    });

    it('should send the user only to the newly added item when there is one', () => {
      req.sessionModel.set('selected-updates-add-more-mode', true);
      req.sessionModel.set('selected-updates-add-more-baseline', ['name', 'surname']);
      req.sessionModel.set('selected-updates-active-items', ['email']);

      const result = resolver.resolveNext(
        '/start',
        req,
        res,
        controller,
        journeyNavigation
      );

      result.next.should.equal('/email');
    });
  });
});
