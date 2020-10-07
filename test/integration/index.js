'use strict';

const request = require('supertest-as-promised');

const testTag = 'Test-GA-Tag';
process.env.GA_TAG = testTag;

const bootstrap = require('../../');

const path = require('path');
const appConfig = {
  foo: 'bar',
  bar: 'baz'
};
const root = path.resolve(__dirname, '../fixtures');

let behaviourOptions = null;
let behaviourCalled = false;
const behaviour = SuperClass => class extends SuperClass {
  constructor(options) {
    behaviourCalled = true;
    behaviourOptions = options;
    super(options);
  }
};

function getHeaders(res, type) {
  let headers = {};
  if (!res.headers[type]) {
    return null;
  }
  let parts = res.headers[type].split('; ');
  parts.forEach((part) => {
    part = part.split(' ');
    headers[part[0]] = part.slice(1);
  });
  return headers;
}

describe('bootstrap()', () => {

  before(() => {
    bootstrap.configure('root', root);
  });

  beforeEach(() => {
    behaviourOptions = null;
    behaviourCalled = false;
  });

  it('must be given a list of routes', () =>
    (() => bootstrap()).should.Throw('Must be called with a list of routes')
  );

  it('routes must each have a set of one or more steps, or one or more pages', () =>
    (() => bootstrap({
      routes: [{}]
    })).should.Throw('Each app must have steps and/or pages')
  );

  it('a base fields option must be specified if no route fields option is defined', () =>
    (() => bootstrap({
      fields: 'fields',
      routes: [{
        steps: {}
      }]
    })).should.not.Throw()
  );

  it('a route fields option must be specified if no base fields option is defined', () =>
    (() => bootstrap({
      routes: [{
        fields: 'apps/app_1/fields',
        steps: {}
      }]
    })).should.not.Throw()
  );

  it('one of base fields or route fields must be specified as an option', () =>
    (() => bootstrap({
      routes: [{
        steps: {}
      }]
    })).should.Throw('Set base fields or route fields or both')
  );

  it('fields option must be valid when specified', () =>
    (() => bootstrap({
      fields: 'not_a_valid_path',
      routes: [{
        steps: {},
      }]
    })).should.Throw(`Cannot find fields at ${root}/not_a_valid_path`)
  );

  it('route fields option must be valid when specified', () =>
    (() => bootstrap({
      routes: [{
        steps: {},
        fields: 'not_a_valid_path'
      }]
    })).should.Throw(`Cannot find route fields at ${root}/not_a_valid_path`)
  );

  it('uses defaults when no views option is specified', () =>
    (() => bootstrap({
      fields: 'fields',
      routes: [{
        steps: {}
      }]
    })).should.not.Throw()
  );

  it('views option must be valid when specified', () =>
    (() => bootstrap({
      fields: 'fields',
      views: 'invalid_path',
      routes: [{
        steps: {}
      }]
    })).should.Throw(`Cannot find views at ${root}/invalid_path`)
  );

  it('route views option must be valid when specified', () =>
    (() => bootstrap({
      fields: 'fields',
      routes: [{
        views: 'invalid_path',
        steps: {}
      }]
    })).should.Throw(`Cannot find route views at ${root}/invalid_path`)
  );

  it('does not throw if no route views option is specified and the default route views directory does not exist', () =>
    (() => bootstrap({
      fields: 'fields',
      routes: [{
        name: 'app_3',
        steps: {}
      }]
    })).should.not.Throw()
  );

  describe('with valid routes and steps', () => {

    it('returns the bootstrap interface object', () =>
      bootstrap({
        fields: 'fields',
        routes: [{
          views: `${root}/apps/app_1/views`,
          steps: {
            '/one': {}
          }
        }]
      }).should.have.all.keys('server', 'stop', 'start', 'use')
    );

    it('starts the service and responds successfully', () => {
      const bs = bootstrap({
        fields: 'fields',
        routes: [{
          views: `${root}/apps/app_1/views`,
          steps: {
            '/one': {}
          }
        }]
      });
      return request(bs.server)
        .get('/one')
        .set('Cookie', ['myCookie=1234'])
        .expect(200);
    });

    it('accepts multiple routes', () => {
      const bs = bootstrap({
        fields: 'fields',
        routes: [{
          views: `${root}/apps/app_1/views`,
          steps: {
            '/one': {}
          }
        }, {
          views: `${root}/apps/app_2/views`,
          steps: {
            '/two': {}
          }
        }]
      });
      return request(bs.server)
        .get('/one')
        .set('Cookie', ['myCookie=1234'])
        .expect(200)
        .then(() =>
          request(bs.server)
            .get('/two')
            .set('Cookie', ['myCookie=1234'])
            .expect(200)
        );
    });

    it('serves the correct view on request', () => {
      const bs = bootstrap({
        fields: 'fields',
        routes: [{
          views: `${root}/apps/app_1/views`,
          steps: {
            '/one': {}
          }
        }, {
          views: `${root}/apps/app_2/views`,
          steps: {
            '/two': {}
          }
        }]
      });
      return request(bs.server)
        .get('/one')
        .set('Cookie', ['myCookie=1234'])
        .expect(200)
        .expect(res => res.text.should.eql('<div>one</div>\n'))
        .then(() =>
          request(bs.server)
            .get('/two')
            .set('Cookie', ['myCookie=1234'])
            .expect(200)
            .expect(res => res.text.should.eql('<div>two</div>\n'))
        );
    });

    it('looks up a view from the route directory', () => {
      const bs = bootstrap({
        fields: 'fields',
        views: `${root}/apps/common/views`,
        routes: [{
          views: `${root}/apps/app_2/views`,
          steps: {
            '/common': {}
          }
        }]
      });
      return request(bs.server)
        .get('/common')
        .set('Cookie', ['myCookie=1234'])
        .expect(200)
        .expect(res => res.text.should.eql('<div>from app 2</div>\n'));
    });

    it('falls back to common views if view not found in route views', () => {
      const bs = bootstrap({
        fields: 'fields',
        views: `${root}/apps/common/views`,
        routes: [{
          views: `${root}/apps/app_1/views`,
          steps: {
            '/common': {}
          }
        }]
      });
      return request(bs.server)
        .get('/common')
        .set('Cookie', ['myCookie=1234'])
        .expect(200)
        .expect(res => res.text.should.eql('<div>from common</div>\n'));
    });

    it('can support multiple sources for common views', () => {
      const bs = bootstrap({
        fields: 'fields',
        views: [`${root}/apps/common/views`, `${root}/apps/common2/views`],
        routes: [{
          views: `${root}/apps/app_1/views`,
          steps: {
            '/common': {
                template: 'common2'
            }
          }
        }]
      });
      return request(bs.server)
        .get('/common')
        .set('Cookie', ['myCookie=1234'])
        .expect(200)
        .expect(res => res.text.should.eql('<div>from common2</div>\n'));
    });

    it('earlier common view folder should have priority over later ones', () => {
      const bs = bootstrap({
        fields: 'fields',
        views: [`${root}/apps/common/views`, `${root}/apps/common2/views`],
        routes: [{
          views: `${root}/apps/app_1/views`,
          steps: {
            '/common': {}
          }
        }]
      });
      return request(bs.server)
        .get('/common')
        .set('Cookie', ['myCookie=1234'])
        .expect(200)
        .expect(res => res.text.should.eql('<div>from common</div>\n'));
    });

    it('looks up from hof-template-partials if not found in any supplied views dir', () => {
      const bs = bootstrap({
        fields: 'fields',
        views: `${root}/apps/common/views`,
        routes: [{
          views: `${root}/apps/app_1/views`,
          steps: {
            '/step': {}
          }
        }]
      });
      return request(bs.server)
        .get('/step')
        .set('Cookie', ['myCookie=1234'])
        .expect(200)
        .expect(res => res.text.should.contain('<div class="content">'));
    });

    it('serves a view on request to an optional baseUrl', () => {
      const bs = bootstrap({
        fields: 'fields',
        routes: [{
          baseUrl: '/app_1',
          views: `${root}/apps/app_1/views`,
          steps: {
            '/one': {}
          }
        }]
      });
      return request(bs.server)
        .get('/app_1/one')
        .set('Cookie', ['myCookie=1234'])
        .expect(200)
        .expect(res => res.text.should.eql('<div>one</div>\n'));
    });

    it('serves a view on request to an optional param', () => {
      const bs = bootstrap({
        fields: 'fields',
        routes: [{
          views: `${root}/apps/app_1/views`,
          params: '/:action?',
          steps: {
            '/one': {}
          }
        }]
      });
      return request(bs.server)
        .get('/one/param')
        .set('Cookie', ['myCookie=1234'])
        .expect(200)
        .expect(res => res.text.should.eql('<div>one</div>\n'));
    });

    it('does not start the service if start is false', () => {
      const bs = bootstrap({
        fields: 'fields',
        start: false,
        routes: [{
          views: `${root}/apps/app_1/views`,
          steps: {
            '/one': {}
          }
        }]
      });

      return should.equal(bs.server, null);
    });

    it('starts the service when start is called', () => {
      const bs = bootstrap({
        fields: 'fields',
        start: false,
        routes: [{
          views: `${root}/apps/app_1/views`,
          steps: {
            '/one': {}
          }
        }]
      });

      bs.start();

      return request(bs.server)
        .get('/one')
        .set('Cookie', ['myCookie=1234'])
        .expect(200)
        .expect(res => res.text.should.eql('<div>one</div>\n'));
    });

    it('merges start options with the bootstrap config', () => {
      const bs = bootstrap({
        fields: 'fields',
        start: false,
        routes: [{
          views: `${root}/apps/app_1/views`,
          steps: {
            '/one': {}
          }
        }]
      });

      bs.start({
        port: '8001',
        host: '1.1.1.1'
      });

      return request(bs.server)
        .get('/one')
        .set('Cookie', ['myCookie=1234'])
        .expect(200)
        .expect(res => res.text.should.eql('<div>one</div>\n'));
    });

    it('stops the service when stop is called', done => {
      const bs = bootstrap({
        fields: 'fields',
        start: false,
        routes: [{
          views: `${root}/apps/app_1/views`,
          steps: {
            '/one': {}
          }
        }]
      });

      bs.start({
        port: '8002'
      }).then(() => {
        bs.stop().then(() => {
          require('request')('http://localhost:8002', err => {
            err.should.be.instanceof(Error);
            err.code.should.equal('ECONNREFUSED');
            done();
          });
        });
      });
    });

    it('serves static resources from /public', () => {
      const bs = bootstrap({
        fields: 'fields',
        routes: [{
          views: `${root}/apps/app_1/views`,
          steps: {
            '/one': {}
          }
        }]
      });
      return request(bs.server)
        .get('/public/index.js')
        .set('Cookie', ['myCookie=1234'])
        .expect(200);
    });

    it('returns a 404 if the resource does not exist', () => {
      const bs = bootstrap({
        fields: 'fields',
        routes: [{
          views: `${root}/apps/app_1/views`,
          steps: {
            '/one': {}
          }
        }]
      });
      return request(bs.server)
        .get('/public/not-here.js')
        .set('Cookie', ['myCookie=1234'])
        .expect(404);
    });

    it('returns a 200 for successful shallow health check', () => {
      const bs = bootstrap({
        fields: 'fields',
        routes: [{
          views: `${root}/apps/app_1/views`,
          steps: {}
        }]
      });
      return request(bs.server)
        .get('/healthz/ping')
        .set('Cookie', ['myCookie=1234'])
        .expect(200);
    });

    it('returns a 200 for successful deeper health check', () => {
      const bs = bootstrap({
        fields: 'fields',
        routes: [{
          views: `${root}/apps/app_1/views`,
          steps: {}
        }]
      });
      return request(bs.server)
        .get('/healthz/readiness')
        .set('Cookie', ['myCookie=1234'])
        .expect(200);
    });

    it('can instantiate a custom behaviour for the route', () => {
      bootstrap({
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
      bootstrap({
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
      bootstrap({
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

    it('can extend CSP directives with CSP config', () => {
      const directives = {
        /* eslint-disable quotes */
        styleSrc: ["'self'", "'another'"],
        imgSrc: ["'test.com/some_path'"],
        scriptSrc: "'www.analytics.com'"
        /* eslint-enable quotes */
      };
      const bs = bootstrap({
        fields: 'fields',
        csp: directives,
        routes: [{
          views: `${root}/apps/app_1/views`,
          steps: {
            '/one': {}
          }
        }]
      });
      return request(bs.server)
        .get('/one')
        .set('Cookie', ['myCookie=1234'])
        .expect((res) => {
          const csp = getHeaders(res, 'content-security-policy');
          csp['img-src'].should.include(directives.imgSrc[0]);
          csp['script-src'].should.include(directives.scriptSrc);
          csp['style-src'].should.deep.equal(directives.styleSrc);
        });
    });

    it('can disable CSP directives with csp.disabled', () => {
      const bs = bootstrap({
        fields: 'fields',
        csp: {
          disabled: true
        },
        routes: [{
          views: `${root}/apps/app_1/views`,
          steps: {
            '/one': {}
          }
        }]
      });
      return request(bs.server)
        .get('/one')
        .set('Cookie', ['myCookie=1234'])
        .expect((res) => {
          const csp = getHeaders(res, 'content-security-policy');
          expect(csp).to.be.null;
        });
    });

    it('can disable CSP directives with csp === false', () => {
      const bs = bootstrap({
        fields: 'fields',
        csp: false,
        routes: [{
          views: `${root}/apps/app_1/views`,
          steps: {
            '/one': {}
          }
        }]
      });
      return request(bs.server)
        .get('/one')
        .set('Cookie', ['myCookie=1234'])
        .expect((res) => {
          const csp = getHeaders(res, 'content-security-policy');
          expect(csp).to.be.null;
        });
    });

    it('does not try to add a `disabled` directive', () => {
      const bs = bootstrap({
        fields: 'fields',
        routes: [{
          views: `${root}/apps/app_1/views`,
          steps: {
            '/one': {}
          }
        }]
      });
      return request(bs.server)
        .get('/one')
        .set('Cookie', ['myCookie=1234'])
        .expect((res) => {
          const csp = getHeaders(res, 'content-security-policy');
          csp.should.not.have.property('disabled');
        });
    });

    it('CSP extends with google directives if gaTagId set', () => {
      const bs = bootstrap({
        csp: {},
        fields: 'fields',
        gaTagId: '1234-ABC',
        routes: [{
          views: `${root}/apps/app_1/views`,
          steps: {
            '/one': {}
          }
        }]
      });
      return request(bs.server)
        .get('/one')
        .set('Cookie', ['myCookie=1234'])
        .expect((res) => {
          const csp = getHeaders(res, 'content-security-policy');
          csp['img-src'].should.include('www.google-analytics.com');
          csp['script-src'].should.include('www.google-analytics.com');
        });
    });

    it('Custom CSP, google, and default directives can coexist', () => {
      const bs = bootstrap({
        fields: 'fields',
        csp: {
          scriptSrc: ['foo'],
          imgSrc: ['bar']
        },
        gaTagId: '1234-ABC',
        routes: [{
          views: `${root}/apps/app_1/views`,
          steps: {
            '/one': {}
          }
        }]
      });
      return request(bs.server)
        .get('/one')
        .set('Cookie', ['myCookie=1234'])
        .expect((res) => {
          const csp = getHeaders(res, 'content-security-policy');
          /* eslint-disable quotes */
          csp['img-src'].should.include('www.google-analytics.com')
            .and.include('bar')
            .and.include("'self'");
          csp['script-src'].should.include('www.google-analytics.com')
            .and.include('foo')
            .and.include("'self'");
          /* eslint-enable quotes */
        });
    });

  });

  describe('with user defined middleware', () => {
    it('can mount user defined middleware with `use`', () => {
      const bs = bootstrap({
        start: false,
        fields: 'fields',
        routes: [{
          views: `${root}/apps/app_1/views`,
          steps: {
            '/one': {}
          }
        }]
      });
      bs.use((req, res) => {
        res.json({respondedFromMiddleware: true});
      });
      bs.start();
      return request(bs.server)
        .get('/one')
        .set('Cookie', ['myCookie=1234'])
        .expect((response) =>
          response.body.respondedFromMiddleware.should.equal(true)
        );
    });
  });

  describe('static pages', () => {

    it('can be part of an app with steps', () => {
      const bs = bootstrap({
        start: false,
        fields: 'fields',
        routes: [{
          views: `${root}/apps/app_1/views`,
          steps: {
            '/one': {}
          },
          pages: {
            '/a-static-page': 'a-page',
            '/b-static-page': 'a-page'
          },
        }]
      });
      bs.start();
      return request(bs.server)
        .get('/a-static-page')
        .set('Cookie', ['myCookie=1234'])
        .expect(200)
        .expect(res => {
          res.text.should.equal('<p>a page</p>\n');
          return request(bs.server)
            .get('/b-static-page')
            .set('Cookie', ['myCookie=1234'])
            .expect(200)
            .expect('<p>a page</p>\n');
        });
    });

    it('can be a separate app without steps', () => {
      const bs = bootstrap({
        gaTagId: false,
        start: false,
        fields: 'fields',
        routes: [{
          views: `${root}/views`,
          pages: {
            '/a-static-page': 'test'
          },
        }]
      });
      bs.start();
      return request(bs.server)
        .get('/a-static-page')
        .set('Cookie', ['myCookie=1234'])
        .expect(200)
        .expect('<div>test</div>\n');
    });

  });

  describe('with ga-tag', () => {
    let locals;
    let bs;

    before(() => {
      bs = bootstrap({
        port: 8888,
        fields: 'fields',
        routes: [
          {
            views: `${root}/apps/app_1/views`,
            steps: {
              '/feedback': {}
            }
          },
          {
            views: `${root}/apps/app_1/views`,
            baseUrl: '/accept',
            steps: {
              '/': {},
              '/confirm/person/confirmation': {}
            }
          },
          {
            views: `${root}/apps/app_1/views`,
            baseUrl: '/apply',
            steps: {
              '/index-start': {},
              '/confirm-end/submit-end': {}
            }
          }
        ]
      });

      bs.use((req, res) => {
        locals = res.locals;
        res.json({});
      });
    });

    it('adds ga-id and ga-page based on root uri', () => {
      return request(bs.server)
        .get('/feedback')
        .set('Cookie', ['myCookie=1234'])
        .expect(200)
        .expect(() => {
          locals.gaTagId.should.equal(testTag);
          locals['ga-id'].should.equal(testTag);
          locals['ga-page'].should.equal('feedback');
        });
    });

    it('adds ga-id and ga-page based on baseUrl only', () => {
      return request(bs.server)
        .get('/accept')
        .set('Cookie', ['myCookie=1234'])
        .expect(200)
        .expect(() => {
          locals.gaTagId.should.equal(testTag);
          locals['ga-id'].should.equal(testTag);
          locals['ga-page'].should.equal('accept');
        });
    });

    it('adds ga-page based on baseUrl and uri with camelcasing', () => {
      return request(bs.server)
        .get('/accept/confirm/person/confirmation')
        .set('Cookie', ['myCookie=1234'])
        .expect(200)
        .expect(() => {
          locals.gaTagId.should.equal(testTag);
          locals['ga-id'].should.equal(testTag);
          locals['ga-page'].should.equal('acceptConfirmPersonConfirmation');
        });
    });

    it('adds ga-page with camelcasing and handles hyphens', () => {
      return request(bs.server)
        .get('/apply/index-start')
        .set('Cookie', ['myCookie=1234'])
        .expect(200)
        .expect(() => {
          locals.gaTagId.should.equal(testTag);
          locals['ga-id'].should.equal(testTag);
          locals['ga-page'].should.equal('applyIndexStart');
        });
    });

    it('adds ga-page with camelcasing and handles hyphens with uris', () => {
      return request(bs.server)
        .get('/apply/confirm-end/submit-end')
        .set('Cookie', ['myCookie=1234'])
        .expect(200)
        .expect(() => {
          locals.gaTagId.should.equal(testTag);
          locals['ga-id'].should.equal(testTag);
          locals['ga-page'].should.equal('applyConfirmEndSubmitEnd');
        });
    });

  });

});
