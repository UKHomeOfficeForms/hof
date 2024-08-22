'use strict';
/* eslint-disable no-return-assign */

const testTag = 'Test-GA-Tag';
process.env.GA_TAG = testTag;

const testGtmTag = 'Test-GTM-Tag';
process.env.GTM_TAG = testGtmTag;

const bootstrap = require('../../');

const path = require('path');
const appConfig = {
  foo: 'bar',
  bar: 'baz'
};
const root = path.resolve(__dirname, '../fixtures');

let behaviourOptions = null;
let behaviourCalled = false;
const behaviour = SuperClass => (class extends SuperClass {
  constructor(options) {
    behaviourCalled = true;
    behaviourOptions = options;
    super(options);
  }
});

describe('bootstrap()', () => {
  let bs;

  before(() => {
    bootstrap.configure('root', root);
  });

  beforeEach(() => {
    behaviourOptions = null;
    behaviourCalled = false;
    bs = null;
  });

  afterEach(() => {
    if (bs) {
      bs.stop();
    }
  });

  it('is given a list of routes', () => (() => bs = bootstrap()).should.Throw('Must be called with a list of routes')
  );

  it('routes must each have a set of one or more steps, or one or more pages', () =>
    (() => bs = bootstrap({
      routes: [{}]
    })).should.Throw('Each app must have steps and/or pages')
  );

  it('a base fields option must be specified if no route fields option is defined', () =>
    (() => bs = bootstrap({
      fields: 'fields',
      routes: [{
        steps: {}
      }]
    })).should.not.Throw()
  );

  it('a route fields option must be specified if no base fields option is defined', () =>
    (() => bs = bootstrap({
      routes: [{
        fields: 'apps/app_1/fields',
        steps: {}
      }]
    })).should.not.Throw()
  );

  it('one of base fields or route fields must be specified as an option', () =>
    (() => bs = bootstrap({
      routes: [{
        steps: {}
      }]
    })).should.Throw('Set base fields or route fields or both')
  );

  it('fields option must be valid when specified', () =>
    (() => bootstrap({
      fields: 'not_a_valid_path',
      routes: [{
        steps: {}
      }]
    })).should.Throw(`Cannot find fields at ${root}/not_a_valid_path`)
  );

  it('route fields option must be valid when specified', () =>
    (() => bs = bootstrap({
      routes: [{
        steps: {},
        fields: 'not_a_valid_path'
      }]
    })).should.Throw(`Cannot find route fields at ${root}/not_a_valid_path`)
  );

  it('uses defaults when no views option is specified', () =>
    (() => bs = bootstrap({
      fields: 'fields',
      routes: [{
        steps: {}
      }]
    })).should.not.Throw()
  );

  it('views option must be valid when specified', () =>
    (() => bs = bootstrap({
      fields: 'fields',
      views: 'invalid_path',
      routes: [{
        steps: {}
      }]
    })).should.Throw('ENOENT: no such file or directory, scandir')
  );

  it('route views option must be valid when specified', () =>
    (() => bs = bootstrap({
      fields: 'fields',
      routes: [{
        views: 'invalid_path',
        steps: {}
      }]
    })).should.Throw(`Cannot find route views at ${root}/invalid_path`)
  );

  it('does not throw if no route views option is specified and the default route views directory does not exist', () =>
    (() => bs = bootstrap({
      fields: 'fields',
      routes: [{
        name: 'app_3',
        steps: {}
      }]
    })).should.not.Throw()
  );

  describe('with valid routes and steps', () => {
    it('returns the bootstrap interface object', () => {
      bs = bootstrap({
        fields: 'fields',
        routes: [{
          views: `${root}/apps/app_1/views`,
          steps: {
            '/one': {}
          }
        }]
      });

      return bs.should.have.all.keys('server', 'stop', 'start', 'use');
    });

    it('can instantiate a custom behaviour for the route', () => {
      bs = bootstrap({
        fields: 'fields',
        routes: [{
          views: `${root}/apps/app_1/views`,
          steps: {
            '/one': {
              behaviours: behaviour
            }
          }
        }]
      });

      behaviourCalled.should.equal(true);
    });

    it('can pass the app config to controllers', () => {
      bs = bootstrap({
        fields: 'fields',
        appConfig: appConfig,
        routes: [{
          views: `${root}/apps/app_1/views`,
          steps: {
            '/one': {
              behaviours: behaviour
            }
          }
        }]
      });
      behaviourOptions.appConfig.should.deep.equal(appConfig);
    });

    it('can pass the confirm step to controllers', () => {
      bs = bootstrap({
        fields: 'fields',
        appConfig: appConfig,
        routes: [{
          views: `${root}/apps/app_1/views`,
          confirmStep: '/summary',
          steps: {
            '/one': {
              behaviours: behaviour
            }
          }
        }]
      });
      behaviourOptions.confirmStep.should.equal('/summary');
    });

    it('can pass the exit step to controllers', () => {
      bs = bootstrap({
        fields: 'fields',
        appConfig: appConfig,
        routes: [{
          views: `${root}/apps/app_1/views`,
          exitStep: '/leave',
          steps: {
            '/one': {
              behaviours: behaviour
            }
          }
        }]
      });
      behaviourOptions.exitStep.should.equal('/leave');
    });

    it('can pass the exit step to controllers', () => {
      bs = bootstrap({
        fields: 'fields',
        appConfig: appConfig,
        routes: [{
          views: `${root}/apps/app_1/views`,
          saveAndExitStep: '/sign-out',
          steps: {
            '/one': {
              behaviours: behaviour
            }
          }
        }]
      });
      behaviourOptions.saveAndExitStep.should.equal('/sign-out');
    });
  });
});
