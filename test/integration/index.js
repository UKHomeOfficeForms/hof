'use strict';

const request = require('supertest');
const bootstrap = require('../../');
const http = require('http');
const path = require('path');

describe('bootstrap()', () => {

  it('must be given a list of routes', () =>
    (() => bootstrap()).should.Throw('Must be called with a list of routes')
  );

  it('routes must each have a list of one or more steps', () =>
    (() => bootstrap({
      routes: [{}]
    })).should.Throw('Each route must define a set of one or more steps')
  );

  it('requires the path to fields argument to be valid', () =>
    (() => bootstrap({
      fields: 'not_a_valid_path',
      routes: [{
        steps: {},
      }]
    })).should.Throw('Cannot find fields at ' + path.resolve(__dirname, '../../test/not_a_valid_path'))
  );

  it('requires the path to the route fields argument to be valid', () =>
    (() => bootstrap({
      fields: '',
      routes: [{
        steps: {},
        fields: 'not_a_valid_path'
      }]
    })).should.Throw('Cannot find route fields at ' + path.resolve(__dirname, '../../test/not_a_valid_path'))
  );

  it('requires the path to the views argument to be valid', () =>
    (() => bootstrap({
      views: 'not_a_valid_path',
      routes: [{
        steps: {}
      }]
    })).should.Throw('Cannot find views at ' + path.resolve(__dirname, '../../test/not_a_valid_path'))
  );

  it('requires the path to the route views argument to be valid', () =>
    (() => bootstrap({
      routes: [{
        steps: {},
        views: 'not_a_valid_path',
      }]
    })).should.Throw('Cannot find route views at ' + path.resolve(__dirname, '../../test/not_a_valid_path'))
  );

  it('uses the route fields as the path', () =>
    bootstrap({
      routes: [{
        steps: {},
        fields: 'fields'
      }]
    }).then(api => {
      api.server.should.be.an.instanceof(http.Server);
      api.stop();
    })
  );

  it('uses the name to find a path to the fields', () =>
    bootstrap({
      routes: [{
        name: 'app_1',
        steps: {}
      }]
    }).then(api => {
      api.server.should.be.an.instanceof(http.Server);
      api.stop();
    })
  );

  describe('with valid routes and steps', () => {

    it('returns a promise that resolves with the bootstrap interface', () =>
      bootstrap({
        views: false,
        routes: [{
          views: path.resolve(__dirname, '../apps/app_1/views'),
          steps: {
            '/one': {}
          }
        }]
      }).then((api) => api.should.have.keys('start', 'stop', 'use', 'server'))
    );

    it('resolves with the api and an instance of the server', () =>
      bootstrap({
        views: false,
        routes: [{
          views: path.resolve(__dirname, '../apps/app_1/views'),
          steps: {
            '/one': {}
          }
        }]
      }).then((api) => api.server.should.be.an.instanceof(http.Server))
    );

    it('starts the service and responds successfully', () =>
      bootstrap({
        views: false,
        start: false,
        routes: [{
          views: path.resolve(__dirname, '../apps/app_1/views'),
          steps: {
            '/one': {}
          }
        }]
      }).then(api => request(api.server).get('/one').expect(200))
    );

    it('serves the correct view when requested from each step', () =>
      bootstrap({
        views: false,
        routes: [{
          views: path.resolve(__dirname, '../apps/app_1/views'),
          steps: {
            '/one': {}
          }
        }]
      }).then(api =>
        request(api.server)
          .get('/one')
          .expect(200)
          .expect(res => res.text.should.equal('<div>one</div>\n'))
      )
    );

    it('responds with a 404 if the resource is not found', () =>
      bootstrap({
        views: false,
        routes: [{
          views: path.resolve(__dirname, '../apps/app_1/views'),
          steps: {
            '/one': {}
          }
        }]
      }).then(api =>
        request(api.server)
          .get('/not_here')
          .expect(404)
      )
    );

    it('uses a route baseUrl to serve the views and fields at the correct step', () =>
      bootstrap({
        views: false,
        routes: [{
          views: path.resolve(__dirname, '../apps/app_1/views'),
          baseUrl: '/app_1',
          steps: {
            '/one': {}
          }
        }]
      }).then(api =>
        request(api.server)
          .get('/app_1/one')
          .expect(200)
          .expect(res => res.text.should.equal('<div>one</div>\n'))
      )
    );

    it('can be given a route param', () =>
      bootstrap({
        views: false,
        routes: [{
          views: path.resolve(__dirname, '../apps/app_1/views'),
          params: '/:action?',
          steps: {
            '/one': {}
          }
        }]
      }).then(api =>
        request(api.server)
          .get('/one/param')
          .expect(200)
          .expect(res => res.text.should.equal('<div>one</div>\n'))
      )
    );

    it('accepts a baseController option', () =>
      bootstrap({
        baseController: require('hof').controllers.base,
        views: path.resolve(__dirname, '../apps/app_1/views'),
        routes: [{
          steps: {
            '/one': {}
          }
        }]
      }).then(api =>
        request(api.server)
          .get('/one')
          .expect(200)
          .expect(res => res.text.should.equal('<div>one</div>\n'))
      )
    );

    it('does not start the service if start is false', () =>
      bootstrap({
        start: false,
        routes: [{
          steps: {
            '/one': {}
          }
        }]
      }).then(api => should.equal(api.server, undefined))
    );

    it('starts the server when start is called', () =>
      bootstrap({
        start: false,
        views: path.resolve(__dirname, '../apps/app_1/views'),
        routes: [{
          steps: {
            '/one': {}
          }
        }]
      })
      .then(api => api.start({start: true}))
      .then(api =>
        request(api.server)
          .get('/one')
          .expect(200)
          .expect(res => res.text.should.equal('<div>one</div>\n'))
      )
    );

  });

});
