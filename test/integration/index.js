'use strict';

const request = require('supertest');
const bootstrap = require('../../');
const http = require('http');
const path = require('path');

describe('bootstrap()', () => {

  let promise;

  describe('when called without settings', () =>
    it('should throw \'Must be called with a list of routes\'', () =>
      (() => bootstrap()).should.Throw('Must be called with a list of routes')
    )
  );

  describe('when called with routes and steps', () => {

    beforeEach(() =>
      promise = bootstrap({
        routes: [{
          fields: path.resolve(__dirname, 'fixtures/fields'),
          templates: path.resolve(__dirname, 'fixtures/views'),
          steps: {
            '/one': {}
          }
        }]
      })
    );

    afterEach(() => promise.then(strap => strap.stop()));

    it('should return a promise that resolves with the bootstrap interface', () =>
      promise.then(strap =>
        strap.server.should.be.an.instanceof(http.Server)
      )
    );

    it('should resolve with an instance of the server on the bootstrap', () =>
      promise.then(strap =>
        strap.server.should.be.an.instanceof(http.Server)
      )
    );

    it('should start an Express server', () =>
      promise.then(strap =>
        request(strap.server)
          .get('/one')
          .expect(200)

      )
    );

  });

  describe('when called with a route with two steps', () => {

    beforeEach(() =>
      promise = bootstrap({
        routes: [{
          baseUrl: '/path',
          fields: path.resolve(__dirname, 'fixtures/fields'),
          templates: path.resolve(__dirname, 'fixtures/views'),
          steps: {
            '/one': {},
            '/two': {}
          }
        }]
      })
    );

    afterEach(() => promise.then(strap => strap.stop()));

    it('should serve a template at the first of those steps on GET request', () =>
      promise.then(strap =>
        request(strap.server)
          .get('/path/one')
          .expect(200)
          .expect(res => res.text.should.eql('<div>one</div>\n'))
      )
    );

    it('should serve a template at the second of those steps on GET request', () =>
      promise.then(strap =>
        request(strap.server)
          .get('/path/two')
          .expect(200)
          .expect(res => res.text.should.eql('<div>two</div>\n'))
      )
    );

  });

});
