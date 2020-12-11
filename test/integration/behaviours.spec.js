'use strict';

const proxyquire = require('proxyquire');
const path = require('path');

describe('Behaviours', () => {

  let wizard;
  let bootstrap;
  let bs;

  beforeEach(() => {
    bs = null;
    wizard = sinon.stub().returns(() => {});
    bootstrap = proxyquire('../../', {
      './lib/router': proxyquire('../../lib/router', {
        'hof-form-wizard': wizard,
      })
    });
    bootstrap.configure('root', path.resolve(__dirname, '../fixtures'));
  });

  afterEach(() => {
    if (bs) {
      bs.stop();
    }
  });

  describe('route-level behaviours', () => {

    it('applies behaviours to all steps in specified route', () => {
      bs = bootstrap({
        fields: 'fields',
        routes: [
          {
            behaviours: ['behaviour-one'],
            steps: {
              '/one': {},
              '/two': {
                behaviours: ['behaviour-two']
              }
            }
          },
          {
            steps: {
              '/one': {},
              '/two': {
                behaviours: ['behaviour-two']
              }
            }
          }
        ]
      });

      wizard.should.have.been.calledTwice;
      const argsOne = wizard.getCall(0).args[0];
      const argsTwo = wizard.getCall(1).args[0];

      argsOne['/one'].behaviours.should.eql(['behaviour-one']);
      argsOne['/two'].behaviours.should.eql(['behaviour-one', 'behaviour-two']);

      argsTwo['/one'].should.not.have.property('behaviours');
      argsTwo['/two'].behaviours.should.eql(['behaviour-two']);
    });

  });

  describe('global behaviours', () => {

    it('applies behaviours to all steps in all routes', () => {
      bs = bootstrap({
        fields: 'fields',
        behaviours: ['behaviour-one'],
        routes: [
          {
            steps: {
              '/one': {},
              '/two': {
                behaviours: ['behaviour-two']
              }
            }
          },
          {
            steps: {
              '/one': {},
              '/two': {
                behaviours: ['behaviour-two']
              }
            }
          }
        ]
      });

      wizard.should.have.been.calledTwice;
      const argsOne = wizard.getCall(0).args[0];
      const argsTwo = wizard.getCall(1).args[0];

      argsOne['/one'].behaviours.should.eql(['behaviour-one']);
      argsOne['/two'].behaviours.should.eql(['behaviour-one', 'behaviour-two']);

      argsTwo['/one'].behaviours.should.eql(['behaviour-one']);
      argsTwo['/two'].behaviours.should.eql(['behaviour-one', 'behaviour-two']);
    });

  });

  describe('global and route-level behaviours', () => {

    it('applies global behaviours before route-level behaviours', () => {
      bs = bootstrap({
        fields: 'fields',
        behaviours: ['behaviour-one'],
        routes: [
          {
            behaviours: ['behaviour-two'],
            steps: {
              '/one': {},
              '/two': {
                behaviours: ['behaviour-three']
              }
            }
          },
          {
            steps: {
              '/one': {},
              '/two': {
                behaviours: ['behaviour-three']
              }
            }
          }
        ]
      });

      wizard.should.have.been.calledTwice;
      const argsOne = wizard.getCall(0).args[0];
      const argsTwo = wizard.getCall(1).args[0];

      argsOne['/one'].behaviours.should.eql(['behaviour-one', 'behaviour-two']);
      argsOne['/two'].behaviours.should.eql(['behaviour-one', 'behaviour-two', 'behaviour-three']);

      argsTwo['/one'].behaviours.should.eql(['behaviour-one']);
      argsTwo['/two'].behaviours.should.eql(['behaviour-one', 'behaviour-three']);
    });

  });

});
