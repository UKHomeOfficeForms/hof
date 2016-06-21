'use strict';

const request = require('supertest');
const bootstrap = require('../../');
const http = require('http');
const path = require('path');

describe('bootstrap()', () => {

  let promise;

  it('Must be called with a list of routes', () =>
    (() => bootstrap()).should.Throw('Must be called with a list of routes')
  );

  it('Routes must each define a set of one or more steps\'', () =>
    (() => bootstrap({
      routes: [{
        fields: {},
        views: {}
      }]
    })).should.Throw('Each route must define a set of one or more steps')
  );

  describe('with required properties', () => {

    beforeEach(() =>
      promise = bootstrap({
        routes: [{
          fields: path.resolve(__dirname, 'fixtures/fields'),
          views: path.resolve(__dirname, 'fixtures/views'),
          steps: {
            '/one': {}
          }
        }]
      })
    );

    afterEach(() => promise.then(api => api.stop()));

    it('should return a promise that resolves with the bootstrap interface', () =>
      promise.then(api =>
        api.server.should.be.an.instanceof(http.Server)
      )
    );

    it('should resolve with an instance of the server on the bootstrap', () =>
      promise.then(api =>
        api.server.should.be.an.instanceof(http.Server)
      )
    );

    it('should start an Express server', () =>
      promise.then(api =>
        request(api.server)
          .get('/one')
          .expect(200)

      )
    );

  });

  describe('called with a route with two steps', () => {

    beforeEach(() =>
      promise = bootstrap({
        routes: [{
          baseUrl: '/path',
          fields: path.resolve(__dirname, 'fixtures/fields'),
          views: path.resolve(__dirname, 'fixtures/views'),
          steps: {
            '/one': {},
            '/two': {}
          }
        }]
      })
    );

    afterEach(() => promise.then(api => api.stop()));

    it('should serve a template at the first of those steps on GET request', () =>
      promise.then(api =>
        request(api.server)
          .get('/path/one')
          .expect(200)
          .expect(res => res.text.should.eql('<div>one</div>\n'))
      )
    );

    it('should serve a template at the second of those steps on GET request', () =>
      promise.then(api =>
        request(api.server)
          .get('/path/two')
          .expect(200)
          .expect(res => res.text.should.eql('<div>two</div>\n'))
      )
    );

  });

  describe('with option start:false', () => {

    beforeEach(() =>
      promise = bootstrap({
        start: false,
        routes: [{
          baseUrl: '/path',
          fields: path.resolve(__dirname, 'fixtures/fields'),
          views: path.resolve(__dirname, 'fixtures/views'),
          steps: {
            '/one': {}
          }
        }]
      })
    );

    it('should not start the server', () =>
      promise.then(api => should.equal(api.server, undefined))
    );


    describe('until start is called with start:true', () => {

      afterEach(() => promise.then(api => api.stop()));

      it('then should serve a template at the first of the steps on GET request', () =>
        promise.then(api =>
          api.start({start: true}).then(api =>
            request(api.server)
              .get('/path/one')
              .expect(200)
              .expect(res => res.text.should.eql('<div>one</div>\n'))
          )
        )
      );

    })

  });

});
