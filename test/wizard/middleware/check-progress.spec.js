'use strict';

const checkProgress = require('../../../wizard/middleware/check-progress');
const Model = require('../../../wizard/model');
const Controller = require('../../../controller');
const helpers = require('../../../wizard/util/helpers');

const request = require('../helpers/request');
const response = require('../helpers/response');

describe('middleware/check-session', () => {
  let req;
  let res;
  let controller;
  let steps;

  beforeEach(() => {
    req = request();
    req.sessionModel = new Model({}, {
      session: req.session,
      key: 'test'
    });
    res = response();
    controller = new Controller({ template: 'index' });
    steps = {
      '/one': { next: '/two' },
      '/two': { next: '/three' },
      '/three': { next: '/four' },
      '/four': {}
    };
    sinon.stub(Controller.prototype, 'getForkTarget');
  });

  afterEach(() => {
    Controller.prototype.getForkTarget.restore();
  });

  it('calls getRouteSteps helper with route and steps', () => {
    sinon.stub(helpers, 'getRouteSteps').returns(['/one', '/two']);
    checkProgress('/two', controller, steps, '/three');
    helpers.getRouteSteps.should.have.been.calledWithExactly('/two', steps);
    helpers.getRouteSteps.restore();
  });

  it('calls callback with no arguments if prerequisite steps are complete', done => {
    req.sessionModel.set('steps', ['/one', '/two']);
    const middleware = checkProgress('/three', controller, steps, '/one');
    middleware(req, res, err => {
      expect(err).to.be.undefined;
      done();
    });
  });

  it('calls callback with MISSING_PREREQ error code if accessing step without prerequisites', done => {
    req.sessionModel.set('steps', []);
    const middleware = checkProgress('/three', controller, steps, '/one');
    middleware(req, res, err => {
      err.code.should.equal('MISSING_PREREQ');
      done();
    });
  });

  it('can handle the first step being part of a loop', done => {
    steps = {
      '/one': { next: '/two' },
      '/two': {
        next: '/three',
        forks: [
          { target: '/one', condition: { field: 'loop', value: 'yes' } }
        ]
      },
      '/three': { next: '/four' },
      '/four': {}
    };
    req.sessionModel.unset('steps');
    const middleware = checkProgress('/one', controller, steps, '/one');
    middleware(req, res, err => {
      expect(err).to.be.undefined;
      done();
    });
  });

  describe('step/field invalidating logic', () => {
    let sessionFields;
    let sessionSteps;

    beforeEach(() => {
      steps = {
        '/': {
          next: '/step1'
        },
        '/step1': {
          next: '/step2',
          fields: [
            'step-1-field-1',
            'step-1-field-2'
          ],
          forks: [{
            target: '/fork1'
          }, {
            target: '/step4'
          }]
        },
        '/step2': {
          next: '/step3',
          fields: [
            'step-2-field-1',
            'step-2-field-2'
          ],
          forks: [{
            target: '/step4'
          }]
        },
        '/step3': {
          next: '/step4',
          fields: [
            'step-3-field-1',
            'step-3-field-2'
          ]
        },
        '/fork1': {
          next: '/step2',
          fields: [
            'fork-field-1',
            'fork-field-2'
          ]
        },
        '/step4': {
          fields: [
            'step-4-field-1',
            'step-4-field-2'
          ]
        }
      };

      sessionFields = {
        'step-1-field-1': true,
        'step-1-field-2': true,
        'step-2-field-1': true,
        'step-2-field-2': true,
        'step-3-field-1': true,
        'step-3-field-2': true,
        'step-4-field-1': true,
        'step-4-field-2': true,
        'fork-field-1': true,
        'fork-field-2': true
      };

      sessionSteps = ['/step1', '/step2', '/step3', '/fork1', '/step4'];

      req.sessionModel.set(sessionFields);
      req.sessionModel.set({
        steps: sessionSteps
      });

      controller.options.next = steps['/step1'].next;
      controller.options.forks = steps['/step1'].forks;

      checkProgress('/step1', controller, steps, '/');
    });

    describe('when all steps are still reachable after forking', () => {
      beforeEach(() => {
        Controller.prototype.getForkTarget.returns('/fork1');
        controller.emit('complete', req, res);
      });

      it('no steps are removed but 1st step pushed to end of sequence', () => {
        req.sessionModel.get('steps').should.be.eql(['/step2', '/step3', '/fork1', '/step4', '/step1']);
      });

      it('doesn\'t invalidate any fields', () => {
        req.sessionModel.toJSON().should.contain.all.keys(
          'step-1-field-1',
          'step-1-field-2',
          'step-2-field-1',
          'step-2-field-2',
          'step-3-field-1',
          'step-3-field-2',
          'step-4-field-1',
          'step-4-field-2',
          'fork-field-1',
          'fork-field-2'
        );
      });
    });

    describe('when a step is skipped', () => {
      beforeEach(() => {
        req.method = 'POST';
        Controller.prototype.getForkTarget.returns('/step2');
        controller.emit('complete', req, res);
      });

      it('invalidates skipped step', () => {
        req.sessionModel.get('steps').should.not.contain('/fork1');
      });

      it('invalidates fields associated with skipped step', () => {
        expect(req.sessionModel.get('fork-field-1')).to.be.undefined;
        expect(req.sessionModel.get('fork-field-2')).to.be.undefined;
      });

      it('doens\'t invalidate the \'next\' step in the current journey', () => {
        req.sessionModel.get('steps').should.contain('/step2');
      });

      it('doesn\'t unset fields associated with the next step in the current journey', () => {
        req.sessionModel.get('step-2-field-1').should.be.true;
        req.sessionModel.get('step-2-field-2').should.be.true;
      });
    });

    describe('when the result of forking skips multiple steps', () => {
      beforeEach(() => {
        req.method = 'POST';
        Controller.prototype.getForkTarget.returns('/step4');
        controller.emit('complete', req, res);
      });

      it('invalidates skipped steps', () => {
        req.sessionModel.get('steps').should.not.contain.any('/step2', '/step3', '/fork1');
      });

      it('doesn\'t invalidate steps in current journey', () => {
        req.sessionModel.get('steps').should.contain.all('/step1', '/step4');
      });

      it('invalidates all fields associated with skipped steps', () => {
        req.sessionModel.toJSON().should.not.contain.any.keys(
          'step-2-field-1',
          'step-2-field-2',
          'step-3-field-1',
          'step-3-field-2',
          'fork-field-1',
          'fork-field-2'
        );
      });
    });

    describe('looping steps', () => {
      it('doesn\'t timeout when recursive route is possible', () => {
        steps = {
          '/step1': {
            next: '/step2',
            forks: [{
              target: '/step3'
            }]
          },
          '/step2': {
            next: '/step3',
            forks: [{
              target: '/step1'
            }, {
              target: '/step3a'
            }]
          },
          '/step3a': {
            next: '/step1',
            forks: [{
              target: '/step3'
            }]
          },
          '/step3': {}
        };
        checkProgress('/step1', controller, steps, '/');
        req.method = 'POST';
        Controller.prototype.getForkTarget.returns('/step2');
        expect(() => {
          controller.emit('complete', req, res);
        }).to.not.throw();
      });

      it('doesn\'t invalidate looping journeys that are not being followed', () => {
        steps = {
          '/step1': {
            next: '/step2'
          },
          '/step2': {
            next: '/step3',
            forks: [{
              target: '/step1'
            }]
          },
          '/step3': {}
        };
        controller = new Controller(Object.assign({ template: 'index' }, steps['/step2']));
        Controller.prototype.getForkTarget.returns('/step3');
        checkProgress('/step2', controller, steps, '/');
        req.method = 'POST';
        req.path = '/step2';
        controller.emit('complete', req, res);
        req.sessionModel.get('steps').should.contain('/step1');
        req.sessionModel.get('steps').should.contain('/step2');
      });

      it('doesn\'t invalidate itself if a looping step appears before an optional loop', () => {
        steps = {
          '/step1': {
            forks: [{
              target: '/step2'
            }],
            next: '/step3'
          },
          '/step2': {
            next: '/step1'
          },
          '/step3': {}
        };
        controller = new Controller(Object.assign({ template: 'index' }, steps['/step1']));
        Controller.prototype.getForkTarget.returns('/step2');
        checkProgress('/step1', controller, steps, '/');
        req.method = 'POST';
        req.path = '/step1';
        controller.emit('complete', req, res);
        req.sessionModel.get('steps').should.contain('/step1');
      });
    });
  });
});
