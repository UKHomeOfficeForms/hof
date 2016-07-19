'use strict';

const request = require('supertest-as-promised');
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
        views: path.resolve(__dirname, '../apps/app_1/views'),
        steps: {},
        fields: 'fields'
      }]
    }).then(api => api.server.should.be.an.instanceof(http.Server))
  );

  it('uses the name to find a path to the fields', () =>
    bootstrap({
      routes: [{
        views: path.resolve(__dirname, '../apps/app_1/views'),
        name: 'app_1',
        steps: {}
      }]
    }).then(api => api.server.should.be.an.instanceof(http.Server))
  );

  describe('with valid routes and steps', () => {

    it('returns a promise that resolves with the bootstrap interface', () =>
      bootstrap({
        routes: [{
          views: path.resolve(__dirname, '../apps/app_1/views'),
          steps: {
            '/one': {}
          }
        }]
      }).then(api => api.should.have.keys('server', 'stop', 'start', 'use'))
    );

    it('starts the service and responds successfully', () =>
      bootstrap({
        routes: [{
          views: path.resolve(__dirname, '../apps/app_1/views'),
          steps: {
            '/one': {}
          }
        }]
      }).then(api => request(api.server)
        .get('/one')
        .set('Cookie', ['myCookie=1234'])
        .expect(200)
      )
    );

    it('serves the correct view when requested from each step', () =>
      bootstrap({
        routes: [{
          views: path.resolve(__dirname, '../apps/app_1/views'),
          steps: {
            '/one': {},
            '/two': {}
          }
        }]
      }).then(api =>
        request(api.server)
          .get('/one')
          .set('Cookie', ['myCookie=1234'])
          .expect(200)
          .expect(res => res.text.should.eql('<div>one</div>\n')
        ).then(() => request(api.server)
          .get('/two')
          .set('Cookie', ['myCookie=1234'])
          .expect(200)
          .expect(res => res.text.should.eql('<div>two</div>\n'))
        )
      )
    );

    it('uses a route baseUrl to serve the views and fields at the correct step', () =>
      bootstrap({
        routes: [{
          baseUrl: '/app_1',
          steps: {
            '/one': {}
          }
        }]
      }).then(api => request(api.server)
        .get('/app_1/one')
        .set('Cookie', ['myCookie=1234'])
        .expect(200)
        .expect(res => res.text.should.eql('<div>one</div>\n'))
      )
    );

    it('can be given a route param', () =>
      bootstrap({
        routes: [{
          views: path.resolve(__dirname, '../apps/app_1/views'),
          params: '/:action?',
          steps: {
            '/one': {}
          }
        }]
      }).then(api => request(api.server)
        .get('/one/param')
        .set('Cookie', ['myCookie=1234'])
        .expect(200)
        .expect(res => res.text.should.eql('<div>one</div>\n'))
      )
    );

    it('accepts a baseController option', () =>
      bootstrap({
        baseController: require('hof').controllers.base,
        routes: [{
          views: path.resolve(__dirname, '../apps/app_1/views'),
          steps: {
            '/one': {}
          }
        }]
      }).then(api => request(api.server)
        .get('/one')
        .set('Cookie', ['myCookie=1234'])
        .expect(200)
        .expect(res => res.text.should.eql('<div>one</div>\n'))
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
        routes: [{
          steps: {
            '/one': {}
          }
        }]
      })
      .then(api => api.start({start: true}))
      .then(api => request(api.server)
        .get('/one')
        .set('Cookie', ['myCookie=1234'])
        .expect(200)
        .expect(res => res.text.should.eql('<div>one</div>\n'))
      )
    );

    it('serves static resources from /public', () =>
      bootstrap({
        routes: [{
          views: path.resolve(__dirname, '../apps/app_1/views'),
          steps: {
            '/one': {}
          }
        }]
      }).then(api => request(api.server)
        .get('/public/test.js')
        .set('Cookie', ['myCookie=1234'])
        .expect(200)
      )
    );

    it('returns a 404 if the resource does not exist', () =>
      bootstrap({
        routes: [{
          views: path.resolve(__dirname, '../apps/app_1/views'),
          steps: {
            '/one': {}
          }
        }]
      }).then(api => request(api.server)
        .get('/public/not-here.js')
        .set('Cookie', ['myCookie=1234'])
        .expect(404)
      )
    );

  });

});
