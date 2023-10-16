/* eslint-disable node/no-deprecated-api */
'use strict';

const url = require('url');
const Model = require('../../model');
const axios = require('axios');

describe('Model', () => {
  let model;
  let apiRequest;
  let error;
  let success;
  let empty;
  let fail;
  let invalid;

  const sandbox = (assertions, done) => function () {
    try {
      console.log('this ::', this);
      console.log('assertions ::', assertions);
      console.log('arguments ::', arguments);
      assertions.apply(this, arguments);
      done();
    } catch (err) {
      done(err);
    }
  };

  beforeEach(() => {
    apiRequest = {};
    model = new Model();
    error = new Error('An Error');
    error.status = 500;
    success = {
      statusCode: 200,
      body: '{ "message": "success" }'
    };
    empty = {
      statusCode: 200,
      body: ''
    };
    fail = {
      statusCode: 500,
      body: '{ "message": "error" }',
      headers: { error: 'fail' }
    };
    invalid = {
      statusCode: 200,
      body: 'invalid',
      headers: { error: 'invalid' }
    };
    sinon.stub(model._request, 'request').returns(apiRequest);
    sinon.spy(model, 'parseResponse');
  });

  afterEach(() => {
    // model._request.request.restore();
    model._request.request.restore();
  });

  it('exports a constructor', () => {
    Model.should.be.a('function');
  });

  it('has `save`, `prepare`, `get`, `set` and `toJSON` methods', () => {
    model.save.should.be.a('function');
    model.prepare.should.be.a('function');
    model.get.should.be.a('function');
    model.set.should.be.a('function');
    model.toJSON.should.be.a('function');
  });

  it('has an attributes property of type object', () => {
    model.attributes.should.be.a('object');
  });

  describe('constructor', () => {
    it('sets attributes passed to self silently', () => {
      const listener = sinon.stub();
      class EventedModel extends Model {
        constructor(attrs, options) {
          super(attrs, options);
          this.on('change', listener);
        }
      }
      const eventedModel = new EventedModel({
        prop: 'value'
      });
      listener.should.not.have.been.called;
      eventedModel.get('prop').should.equal('value');
    });
  });

  describe('request', () => {
    let settings;
    let bodyData;

    beforeEach(() => {
      bodyData = '{"name":"Test name"}';

      settings = url.parse('http://example.com:3002/foo/bar');
      settings.method = 'POST';
    });

    it('sends an http POST request to requested url with data in settings', done => {
      // model._request.yieldsAsync(success);
      model._request.request.resolves(Promise.resolve(success));
      settings.data = bodyData;

      model.request(settings, sandbox(() => {
        model._request.request.should.have.been.calledOnce;

        const options = model._request.request.args[0][0];
        options.method.should.equal('POST');
        options.uri.should.equal('http://example.com:3002/foo/bar');
        options.body.should.equal('{"name":"Test name"}');
      }, done));
    });

    it('sends an http POST request to requested url with data passed as argument', done => {
      // model._request.yieldsAsync(success);
      model._request.request.resolves(Promise.resolve(success));

      model.request(settings, bodyData, sandbox(() => {
        model._request.request.should.have.been.calledOnce;

        const options = model._request.request.args[0][0];
        options.method.should.equal('POST');
        options.uri.should.equal('http://example.com:3002/foo/bar');
        options.body.should.equal('{"name":"Test name"}');
      }, done));
    });

    it('sends an http POST request to requested url with data passed as argument and no callback given', done => {
      // model._request.yieldsAsync(success);
      model._request.request.resolves(Promise.resolve(success));

      model.request(settings, bodyData, sandbox(() => {
        model._request.request.should.have.been.calledOnce;
        const options = model._request.request.args[0][0];
        options.method.should.equal('POST');
        options.uri.should.equal('http://example.com:3002/foo/bar');
        options.body.should.equal('{"name":"Test name"}');
      }, done));
    });

    it('sends an http GET request to requested url and no callback given', done => {
      // model._request.yieldsAsync(success);
      model._request.request.resolves(Promise.resolve(success));
      settings = url.parse('http://example.com:3002/foo/bar');
      settings.method = 'GET';

      model.request(settings, sandbox(() => {
        model._request.request.should.have.been.calledOnce;
        const options = model._request.request.args[0][0];
        options.method.should.equal('GET');
        options.uri.should.equal('http://example.com:3002/foo/bar');
        expect(options.body).to.not.be.ok;
      }, done));
    });

    it('can parse failiure when no callback given', done => {
      // model._request.yieldsAsync(fail);
      model._request.request.resolves(Promise.resolve(fail));
      model.request(settings, bodyData, sandbox(() => {
        model._request.request.should.have.been.calledOnce;
        const options = model._request.request.args[0][0];
        options.method.should.equal('POST');
        options.uri.should.equal('http://example.com:3002/foo/bar');
        options.body.should.equal('{"name":"Test name"}');
      }, done));
    });

    it('can parse failiure when no data or callback given', done => {
      // model._request.yieldsAsync(fail);
      model._request.request.resolves(Promise.resolve(fail));
      model.request(settings, sandbox(() => {
        model._request.request.should.have.been.calledOnce;
        const options = model._request.request.args[0][0];
        options.method.should.equal('POST');
        options.uri.should.equal('http://example.com:3002/foo/bar');
        expect(options.body).to.not.be.ok;
      }, done));
    });

    it('sets the timeout from model options', done => {
      model.options.timeout = 100;
      // model._request.yieldsAsync(success);
      model._request.request.resolves(Promise.resolve(success));
      model.request(settings, sandbox(() => {
        model._request.request.should.have.been.calledOnce;
        const options = model._request.request.args[0][0];
        options.timeout.should.equal(100);
      }, done));
    });

    it('sets the timeout from request options', done => {
      settings.timeout = 100;
      // model._request.yieldsAsync(success);
      model._request.request.resolves(Promise.resolve(success));
      model.request(settings, sandbox(() => {
        model._request.request.should.have.been.calledOnce;
        const options = model._request.request.args[0][0];
        options.timeout.should.equal(100);
      }, done));
    });

    it('returns a promise if no callback is provided', () => {
      model.request(settings).should.be.a('promise');
    });
  });

  describe('save', () => {
    beforeEach(() => {
      model.set('name', 'Test name');
      model.url = () => 'http://example.com:3002/foo/bar';
    });

    it('sends an http POST request to configured url containing model attributes as body', done => {
      // model._request.yieldsAsync(success);
      model._request.request.resolves(Promise.resolve(success));
      model.save(sandbox(() => {
        model._request.request.should.have.been.calledOnce;
        const options = model._request.request.args[0][0];
        options.method.should.equal('POST');
        options.uri.should.equal('http://example.com:3002/foo/bar');
        options.body.should.equal('{"name":"Test name"}');
      }, done));
    });

    it('sends an https POST request if configured url is `https`', done => {
      model.url = () => 'https://secure-example.com/foo/bar';
      // model._request.yieldsAsync(success);
      model._request.request.resolves(Promise.resolve(success));
      model.save(sandbox(() => {
        model._request.request.should.have.been.calledOnce;
        const options = model._request.request.args[0][0];
        options.method.should.equal('POST');
        options.uri.should.equal('https://secure-example.com/foo/bar');
        options.body.should.equal('{"name":"Test name"}');
      }, done));
    });

    it('sends an http PUT request if method option is "PUT"', done => {
      // model._request.yieldsAsync(success);
      sinon.stub(axios, 'post').resolves(Promise.resolve(success));
      model.save({ method: 'PUT' }, sandbox(() => {
        model._request.request.should.have.been.calledOnce;
        const options = model._request.request.args[0][0];
        options.method.should.equal('PUT');
        options.uri.should.equal('http://example.com:3002/foo/bar');
        options.body.should.equal('{"name":"Test name"}');
      }, done));
    });

    it('adds content type and length headers to request', done => {
      model.set('name', 'Test name - ハセマペヨ');
      model._request.request.resolves(Promise.resolve(success));
      // sinon.stub(axios, 'request').resolves(Promise.resolve(success))

      model.save(sandbox(() => {
        model._request.request.should.have.been.calledOnce;
        const options = model._request.request.args[0][0];
        options.headers['Content-Type'].should.equal('application/json');
        options.headers['Content-Length'].should.equal(38);
      }, done));
    });

    it('calls callback with an error if API response returns an error code', done => {
      // sinon.stub(axios, 'request').resolves(Promise.resolve(fail))
      model._request.request.resolves(Promise.resolve(fail));
      model.save(sandbox(e => {
        e.should.eql({ status: 500, message: 'error', headers: { error: 'fail' } });
      }, done));
    });

    it('calls callback with an error if request throws error event', done => {
      // model._request.yieldsAsync(error);
      model._request.request.resolves(Promise.reject(error));
      model.save(sandbox(e => {
        e.should.eql(error);
      }, done));
    });

    it('calls callback with no error and json data if response has success code', done => {
      // model._request.yieldsAsync(null, success);
      model._request.request.resolves(Promise.resolve(success));
      model.save(sandbox((err, data) => {
        expect(err).to.be.null;
        data.should.eql({ message: 'success' });
      }, done));
    });

    it('passes returned data through parse method on success', done => {
      sinon.stub(model, 'parse').returns({ parsed: 'message' });
      // model._request.yieldsAsync(null, success);
      model._request.request.resolves(Promise.resolve(success));
      model.save(sandbox((err, data) => {
        expect(err).to.be.null;
        model.parse.should.have.been.calledOnce;
        model.parse.should.have.been.calledWithExactly({ message: 'success' });
        data.should.eql({ parsed: 'message' });
      }, done));
    });

    it('does not parse response on error', done => {
      // model._request.yieldsAsync(null, fail);
      model._request.request.resolves(Promise.resolve(fail));
      sinon.stub(model, 'parse');
      model.save(sandbox(err => {
        model.parse.should.not.have.been.called;
        err.should.eql({ message: 'error', status: 500, headers: { error: 'fail' } });
      }, done));
    });

    it('calls parseError on error to extract error status from response', done => {
      // model._request.yieldsAsync(null, fail);
      model._request.request.resolves(Promise.resolve(fail));
      sinon.stub(model, 'parseError').returns({ error: 'parsed' });
      model.save(sandbox(err => {
        model.parseError.should.have.been.calledOnce;
        model.parseError.should.have.been.calledWithExactly(500, { message: 'error' });
        err.should.eql({ error: 'parsed', headers: { error: 'fail' } });
      }, done));
    });

    it('calls callback with error if response is not valid json', done => {
      // model._request.yieldsAsync(null, invalid);
      model._request.request.resolves(Promise.resolve(invalid));
      model.save(sandbox((err, data) => {
        err.should.be.an.instanceOf(Error);
        err.status.should.equal(200);
        err.body.should.equal('invalid');
        err.headers.should.eql({ error: 'invalid' });
        expect(data).not.to.be.ok;
      }, done));
    });

    it('can handle optional options parameter', done => {
      // model._request.yieldsAsync(success);
      model._request.request.resolves(Promise.resolve(success));
      model.url = sinon.stub().returns('http://example.com/');
      model.save({ url: 'foo' }, () => done());
    });

    it('passes options to url method if provided', done => {
      model.url = sinon.stub().returns('http://example.com/');
      // model._request.yieldsAsync(success);
      model._request.request.resolves(Promise.resolve(success));
      model.save({ url: 'foo' }, sandbox(() => {
        model.url.should.have.been.calledOnce;
        model.url.should.have.been.calledWithExactly({ url: 'foo' });
      }, done));
    });

    it('can handle a parsed URL object', done => {
      const urlStub = {
        protocol: 'http:',
        port: '1234',
        hostname: 'proxy-example.com',
        pathname: '/'
      };
      model.url = sinon.stub().returns(urlStub);
      // model._request.yieldsAsync(success);
      model._request.request.resolves(Promise.resolve(success));
      model.save(sandbox(() => {
        model._request.request.should.have.been.called;
        model._request.request.args[0][0].uri.should.equal('http://proxy-example.com:1234/');
      }, done));
    });

    it('calls callback with error if parse fails', done => {
      const err = new Error('parse');
      model.parse = () => {
        throw err;
      };
      // model._request.yieldsAsync(null, success);
      model._request.request.resolves(Promise.resolve(success));
      model.save(sandbox(e => {
        e.should.equal(err);
      }, done));
    });

    it('allows optional headers', done => {
      const endPoint = url.parse('http://proxy-example.com:1234');
      const options = {
        headers: {
          'User-Agent': 'Example'
        }
      };
      model.url = sinon.stub().returns(endPoint);
      // model._request.yieldsAsync(success);
      model._request.request.resolves(Promise.resolve(success));
      model.save(options, sandbox(() => {
        model._request.request.args[0][0].headers['Content-Type'].should.equal('application/json');
        model._request.request.args[0][0].headers['User-Agent'].should.equal('Example');
      }, done));
    });

    it('allows custom headers', done => {
      const endPoint = url.parse('http://proxy-example.com:1234');
      endPoint.headers = {
        Host: url.parse('http://example.com/').host
      };
      model.url = sinon.stub().returns(endPoint);
      // model._request.yieldsAsync(success);
      model._request.request.resolves(Promise.resolve(success));
      model.save(sandbox(() => {
        model._request.request.args[0][0].headers['Content-Type'].should.equal('application/json');
        model._request.request.args[0][0].headers.Host.should.equal('example.com');
      }, done));
    });

    it('allows optional headers on the instance', done => {
      const endPoint = url.parse('http://proxy-example.com:1234');
      const options = {
        headers: {
          'User-Agent': 'Example'
        }
      };
      const instance = new Model({}, options);
      instance.url = sinon.stub().returns(endPoint);
      // instance._request = sinon.stub().yieldsAsync(success);
      model._request.request.resolves(Promise.resolve(success));
      instance.save(sandbox(() => {
        instance._request.request.args[0][0].headers['Content-Type'].should.equal('application/json');
        instance._request.request.args[0][0].headers['User-Agent'].should.equal('Example');
      }, done));
    });

    it('includes auth setting if defined', done => {
      model.auth = sinon.stub().returns('user:pass');
      // model._request.yieldsAsync(success);
      model._request.request.resolves(Promise.resolve(success));
      model.save(sandbox(() => {
        model._request.request.args[0][0].auth.should.deep.equal({
          user: 'user',
          pass: 'pass',
          sendImmediately: true
        });
      }, done));
    });

    it('emits a "sync" event', done => {
      const sync = sinon.stub();
      model.on('sync', sync);
      // model._request.yieldsAsync(null, success);
      model._request.request.resolves(Promise.resolve(success));
      model.save(sandbox(() => {
        sync.should.have.been.calledOnce;
        sync.should.have.been.calledWith(sinon.match({ method: 'POST' }));
      }, done));
    });

    it('emits a "fail" event on error', done => {
      // model._request.yieldsAsync(null, fail);
      model._request.request.resolves(Promise.resolve(fail));
      model.on('fail', sandbox((err, data, settings, statusCode, responseTime) => {
        err.should.eql({ message: 'error', status: 500, headers: { error: 'fail' } });
        data.should.eql({ message: 'error' });
        settings.method.should.equal('POST');
        statusCode.should.equal(500);
        responseTime.should.be.a('number');
      }, done));
      model.save(() => {});
    });

    it('emits a "success" event on success', done => {
      // model._request.yieldsAsync(null, success);
      model._request.request.resolves(Promise.resolve(success));
      model.on('success', (data, settings, statusCode, responseTime) => {
        data.should.eql({ message: 'success' });
        settings.method.should.equal('POST');
        statusCode.should.equal(200);
        responseTime.should.be.a('number');
        done();
      });
      model.save(() => {});
    });

    it('allows an empty response body', done => {
      // model._request.yieldsAsync(null, empty);
      model._request.request.resolves(Promise.resolve(empty));
      model.save(sandbox((err, data) => {
        expect(err).to.be.null;
        data.should.eql({});
      }, done));
    });

    it('passes statusCode, response body and callback to `parseResponse`', done => {
      // model._request.yieldsAsync(null, success);
      model._request.request.resolves(Promise.resolve(success));
      model.save(() => {
        model.parseResponse.should.have.been.calledWith(200, { message: 'success' }, sinon.match.func);
        done();
      });
    });

    it('ignores callback if one is not given on success', () => {
      // model._request.yieldsAsync(null, success);
      model._request.request.resolves(Promise.resolve(success));
      expect(() => {
        model.save();
      }).to.not.throw();
    });

    it('ignores callback if one is not given if API response returns an error code', () => {
      // model._request.yieldsAsync(null, fail);
      model._request.request.resolves(Promise.resolve(fail));
      expect(() => {
        model.save();
      }).to.not.throw();
    });

    it('returns a promise if no callback is provided', () => {
      model.save().should.be.a('promise');
    });

    it('resolves with response data', () => {
      // model._request.yieldsAsync(null, success);
      model._request.request.resolves(Promise.resolve(success));
      return model.save().then(data => {
        data.should.eql({ message: 'success' });
      });
    });

    it('rejects with error on failure', () => {
      // model._request.yieldsAsync(null, fail);
      model._request.request.resolves(Promise.resolve(fail));
      return model.save().catch(err => {
        err.should.eql({ message: 'error', status: 500, headers: { error: 'fail' } });
      });
    });
  });

  describe('fetch', () => {
    let callback;

    beforeEach(() => {
      callback = sinon.stub();
      model.url = () => 'http://example.com:3002/foo/bar';
    });

    it('sends an http GET request to API server', done => {
      // model._request.yieldsAsync(null, success);
      model._request.request.resolves(Promise.resolve(success));

      model.fetch(sandbox(() => {
        model._request.request.should.have.been.calledOnce;
        const options = model._request.request.args[0][0];
        options.method.should.equal('GET');
        options.uri.should.equal('http://example.com:3002/foo/bar');
      }, done));
    });

    it('calls callback with an error if API response returns an error code', done => {
      // model._request.yieldsAsync(null, fail);
      model._request.request.resolves(Promise.resolve(fail));
      model.fetch(sandbox(e => {
        e.should.eql({ status: 500, message: 'error', headers: { error: 'fail' } });
      }, done));
    });

    it('calls callback with an error if model._request throws error event', done => {
      // model._request.yieldsAsync(error, fail);
      model._request.request.resolves(Promise.reject(error));
      model.fetch(sandbox(e => {
        e.should.eql(error);
      }, done));
    });

    it('calls callback with no error and json data if response has success code', done => {
      // model._request.yieldsAsync(null, success);
      model._request.request.resolves(Promise.resolve(success));
      model.fetch(sandbox((err, data) => {
        expect(err).to.be.null;
        data.should.eql({ message: 'success' });
      }, done));
    });

    it('passes returned data through parse method on success', done => {
      sinon.stub(model, 'parse').returns({ parsed: 'message' });
      // model._request.yieldsAsync(null, success);
      model._request.request.resolves(Promise.resolve(success));
      model.fetch(sandbox((err, data) => {
        expect(err).to.be.null;
        model.parse.should.have.been.calledOnce;
        model.parse.should.have.been.calledWithExactly({ message: 'success' });
        data.should.eql({ parsed: 'message' });
      }, done));
    });

    it('does not parse response on error', done => {
      // model._request.yieldsAsync(null, fail);
      model._request.request.resolves(Promise.resolve(fail));
      sinon.stub(model, 'parse');
      model.fetch(sandbox(err => {
        model.parse.should.not.have.been.called;
        err.should.eql({ message: 'error', status: 500, headers: { error: 'fail' } });
      }, done));
    });

    it('calls callback with error if response is not valid json', done => {
      // model._request.yieldsAsync(null, invalid);
      model._request.request.resolves(Promise.resolve(invalid));
      model.fetch(sandbox((err, data) => {
        err.should.be.an.instanceOf(Error);
        err.status.should.equal(200);
        err.body.should.equal('invalid');
        err.headers.should.eql({ error: 'invalid' });
        expect(data).to.not.be.ok;
      }, done));
    });

    it('passes options to url method if provided', () => {
      model.url = sinon.stub().returns('http://example.com/');
      model.fetch({ url: 'foo' }, callback);
      model.url.should.have.been.calledOnce;
      model.url.should.have.been.calledWithExactly({ url: 'foo' });
    });

    it('can handle a parsed URL object', done => {
      const urlStub = {
        protocol: 'http:',
        port: '1234',
        hostname: 'proxy-example.com',
        pathname: '/'
      };
      model.url = sinon.stub().returns(urlStub);
      // model._request.yieldsAsync(success);
      model._request.request.resolves(Promise.resolve(success));
      model.fetch(sandbox(() => {
        model._request.request.should.have.been.called;
        model._request.request.args[0][0].uri.should.equal('http://proxy-example.com:1234/');
      }, done));
    });

    it('allows optional headers', done => {
      const endPoint = url.parse('http://proxy-example.com:1234');
      const options = {
        headers: {
          'User-Agent': 'Example'
        }
      };
      model.url = sinon.stub().returns(endPoint);
      // model._request.yieldsAsync(success);
      model._request.request.resolves(Promise.resolve(success));
      model.fetch(options, sandbox(() => {
        model._request.request.args[0][0].headers['User-Agent'].should.equal('Example');
      }, done));
    });

    it('allows custom headers', done => {
      const endPoint = url.parse('http://proxy-example.com:1234');
      endPoint.headers = {
        Host: url.parse('http://example.com/').host
      };
      model.url = sinon.stub().returns(endPoint);
      // model._request.yieldsAsync(success);
      model._request.request.resolves(Promise.resolve(success));
      model.fetch(sandbox(() => {
        model._request.request.args[0][0].headers.Host.should.equal('example.com');
      }, done));
    });

    it('allows optional headers on the instance', done => {
      const endPoint = url.parse('http://proxy-example.com:1234');
      const options = {
        headers: {
          'User-Agent': 'Example'
        }
      };
      const instance = new Model({}, options);
      instance.url = sinon.stub().returns(endPoint);
      // instance._request = sinon.stub().yieldsAsync(success);
      instance._request.request.resolves(Promise.resolve(success));
      instance.fetch(sandbox(() => {
        instance._request.request.args[0][0].headers['User-Agent'].should.equal('Example');
      }, done));
    });

    it('calls callback with error if parse fails', done => {
      const err = new Error('parse');
      model.parse = () => {
        throw err;
      };
      // model._request.yieldsAsync(null, success);
      model._request.request.resolves(Promise.resolve(success));
      model.fetch(sandbox(e => {
        e.should.equal(err);
      }, done));
    });

    it('includes auth setting if defined', done => {
      model.auth = sinon.stub().returns('user:pass');
      // model._request.yieldsAsync(success);
      model._request.request.resolves(Promise.resolve(success));
      model.fetch(sandbox(() => {
        model._request.request.args[0][0].auth.should.deep.equal({
          user: 'user',
          pass: 'pass',
          sendImmediately: true
        });
      }, done));
    });

    it('emits a "sync" event', () => {
      const sync = sinon.stub();
      model.on('sync', sync);
      model.fetch(() => {});
      sync.should.have.been.calledOnce;
      sync.should.have.been.calledWith(sinon.match({ method: 'GET' }));
    });

    it('emits a "fail" event on failure', done => {
      // model._request.yieldsAsync(null, fail);
      model._request.request.resolves(Promise.resolve(fail));
      model.on('fail', (err, data, settings, statusCode, responseTime) => {
        err.should.eql({ message: 'error', status: 500, headers: { error: 'fail' } });
        data.should.eql({ message: 'error' });
        settings.method.should.equal('GET');
        statusCode.should.equal(500);
        responseTime.should.be.a('number');
        done();
      });
      model.fetch(() => {});
    });

    it('emits a "fail" event on error', done => {
      // model._request.yieldsAsync(error);
      model._request.request.resolves(Promise.reject(error));
      model.on('fail', (err, data, settings, statusCode, responseTime) => {
        err.should.eql(error);
        expect(data).to.be.null;
        settings.method.should.equal('GET');
        statusCode.should.equal(500);
        responseTime.should.be.a('number');
        done();
      });
      model.fetch(() => {});
    });

    it('emits a "success" event on success', done => {
      // model._request.yieldsAsync(null, success);
      model._request.request.resolves(Promise.resolve(success));
      model.on('success', (data, settings, statusCode, responseTime) => {
        data.should.eql({ message: 'success' });
        settings.method.should.equal('GET');
        statusCode.should.equal(200);
        responseTime.should.be.a('number');
        done();
      });
      model.fetch(() => {});
    });

    it('allows an empty response body', done => {
      // model._request.yieldsAsync(null, empty);
      model._request.request.resolves(Promise.resolve(empty));
      model.fetch(sandbox((err, data) => {
        expect(err).to.be.null;
        data.should.eql({});
      }, done));
    });

    it('passes statusCode, response body and callback to `parseResponse`', done => {
      // model._request.yieldsAsync(null, success);
      model._request.request.resolves(Promise.resolve(success));
      model.fetch(() => {
        model.parseResponse.should.have.been.calledWith(200, { message: 'success' }, sinon.match.func);
        done();
      });
    });

    it('ignores callback if one is not given on success', () => {
      // model._request.yieldsAsync(null, success);
      model._request.request.resolves(Promise.resolve(success));
      expect(() => {
        model.fetch();
      }).to.not.throw();
    });

    it('ignores callback if one not given if API response returns an error code', () => {
      // model._request.yieldsAsync(null, fail);
      model._request.request.resolves(Promise.resolve(fail));
      expect(() => {
        model.fetch();
      }).to.not.throw();
    });

    it('returns a promise if no callback is provided', () => {
      model.fetch().should.be.a('promise');
    });

    it('resolves with response data', () => {
      // model._request.yieldsAsync(null, success);
      model._request.request.resolves(Promise.resolve(success));
      return model.fetch().then(data => {
        data.should.eql({ message: 'success' });
      });
    });

    it('rejects with error on failure', () => {
      // model._request.yieldsAsync(null, fail);
      model._request.request.resolves(Promise.resolve(fail));
      return model.fetch().catch(err => {
        err.should.eql({ message: 'error', status: 500, headers: { error: 'fail' } });
      });
    });
  });

  describe('delete', () => {
    let callback;

    beforeEach(() => {
      callback = sinon.stub();
      model.url = () => 'http://example.com:3002/foo/bar';
    });

    it('sends an http DELETE request to API server', done => {
      // model._request.yieldsAsync(null, success);
      model._request.request.resolves(Promise.resolve(success));
      model.delete(sandbox(() => {
        model._request.request.should.have.been.calledOnce;
        const options = model._request.request.args[0][0];
        options.method.should.equal('DELETE');
        options.uri.should.equal('http://example.com:3002/foo/bar');
      }, done));
    });

    it('calls callback with an error if API response returns an error code', done => {
      // model._request.yieldsAsync(null, fail);
      model._request.request.resolves(Promise.resolve(fail));
      model.delete(sandbox(e => {
        e.should.eql({ status: 500, message: 'error', headers: { error: 'fail' } });
      }, done));
    });

    it('calls callback with an error if model._request throws error event', done => {
      // model._request.yieldsAsync(error, fail);
      model._request.request.resolves(Promise.reject(error));
      model.delete(sandbox(e => {
        e.should.eql(error);
      }, done));
    });

    it('calls callback with no error and json data if response has success code', done => {
      // model._request.yieldsAsync(null, success);
      model._request.request.resolves(Promise.resolve(success));
      model.delete(sandbox((err, data) => {
        expect(err).to.be.null;
        data.should.eql({ message: 'success' });
      }, done));
    });

    it('passes returned data through parse method on success', done => {
      sinon.stub(model, 'parse').returns({ parsed: 'message' });
      // model._request.yieldsAsync(null, success);
      model._request.request.resolves(Promise.resolve(success));
      model.delete(sandbox((err, data) => {
        expect(err).to.be.null;
        model.parse.should.have.been.calledOnce;
        model.parse.should.have.been.calledWithExactly({ message: 'success' });
        data.should.eql({ parsed: 'message' });
      }, done));
    });

    it('does not parse response on error', done => {
      // model._request.yieldsAsync(null, fail);
      model._request.request.resolves(Promise.resolve(fail));
      sinon.stub(model, 'parse');
      model.delete(sandbox(err => {
        model.parse.should.not.have.been.called;
        err.should.eql({ message: 'error', status: 500, headers: { error: 'fail' } });
      }, done));
    });

    it('calls callback with error if response is not valid json', done => {
      // model._request.yieldsAsync(null, invalid);
      model._request.request.resolves(Promise.resolve(invalid));
      model.delete(sandbox((err, data) => {
        err.should.be.an.instanceOf(Error);
        err.status.should.equal(200);
        err.body.should.equal('invalid');
        err.headers.should.eql({ error: 'invalid' });
        expect(data).to.not.be.ok;
      }, done));
    });

    it('passes options to url method if provided', () => {
      model.url = sinon.stub().returns('http://example.com/');
      model.delete({ url: 'foo' }, callback);
      model.url.should.have.been.calledOnce;
      model.url.should.have.been.calledWithExactly({ url: 'foo' });
    });

    it('can handle a parsed URL object', done => {
      const urlStub = {
        protocol: 'http:',
        port: '1234',
        hostname: 'proxy-example.com',
        pathname: '/'
      };
      model.url = sinon.stub().returns(urlStub);
      // model._request.yieldsAsync(success);
      model._request.request.resolves(Promise.resolve(success));
      model.delete(sandbox(() => {
        model._request.request.should.have.been.called;
        model._request.request.args[0][0].uri.should.equal('http://proxy-example.com:1234/');
      }, done));
    });

    it('allows optional headers', done => {
      const endPoint = url.parse('http://proxy-example.com:1234');
      const options = {
        headers: {
          'User-Agent': 'Example'
        }
      };
      model.url = sinon.stub().returns(endPoint);
      // model._request.yieldsAsync(success);
      model._request.request.resolves(Promise.resolve(success));
      model.delete(options, sandbox(() => {
        model._request.request.args[0][0].headers['User-Agent'].should.equal('Example');
      }, done));
    });

    it('allows custom headers', done => {
      const endPoint = url.parse('http://proxy-example.com:1234');
      endPoint.headers = {
        Host: url.parse('http://example.com/').host
      };
      model.url = sinon.stub().returns(endPoint);
      // model._request.yieldsAsync(success);
      model._request.request.resolves(Promise.resolve(success));

      model.delete(sandbox(() => {
        model._request.request.args[0][0].headers.Host.should.equal('example.com');
      }, done));
    });

    it('allows optional headers on the instance', done => {
      const endPoint = url.parse('http://proxy-example.com:1234');
      const options = {
        headers: {
          'User-Agent': 'Example'
        }
      };
      const instance = new Model({}, options);
      instance.url = sinon.stub().returns(endPoint);
      // instance._request.request = sinon.stub().resolve(success);
      instance._request.request.resolves(Promise.resolve(success));
      instance.delete(sandbox(() => {
        instance._request.request.args[0][0].headers['User-Agent'].should.equal('Example');
      }, done));
    });

    it('calls callback with error if parse fails', done => {
      const err = new Error('parse');
      model.parse = () => {
        throw err;
      };
      // model._request.yieldsAsync(null, success);
      model._request.request.resolves(Promise.resolve(success));
      model.delete(sandbox(e => {
        e.should.equal(err);
      }, done));
    });

    it('emits a "sync" event', () => {
      const sync = sinon.stub();
      model.on('sync', sync);
      model.delete(() => {});
      sync.should.have.been.calledOnce;
      sync.should.have.been.calledWith(sinon.match({ method: 'DELETE' }));
    });

    it('emits a "fail" event on error', done => {
      // model._request.yieldsAsync(null, fail);
      model._request.request.resolves(Promise.resolve(fail));
      model.on('fail', (err, data, settings, statusCode, responseTime) => {
        err.should.eql({ message: 'error', status: 500, headers: { error: 'fail' } });
        data.should.eql({ message: 'error' });
        settings.method.should.equal('DELETE');
        statusCode.should.equal(500);
        responseTime.should.be.a('number');
        done();
      });
      model.delete(() => {});
    });

    it('emits a "success" event on success', done => {
      // model._request.yieldsAsync(null, success);
      model._request.request.resolves(Promise.resolve(success));
      model.on('success', (data, settings, statusCode, responseTime) => {
        data.should.eql({ message: 'success' });
        settings.method.should.equal('DELETE');
        statusCode.should.equal(200);
        responseTime.should.be.a('number');
        done();
      });
      model.delete(() => {});
    });

    it('allows an empty response body', done => {
      // model._request.yieldsAsync(null, empty);
      model._request.request.resolves(Promise.resolve(empty));
      model.delete(sandbox((err, data) => {
        expect(err).to.be.null;
        data.should.eql({});
      }, done));
    });

    it('passes statusCode, response body and callback to `parseResponse`', done => {
      // model._request.yieldsAsync(null, success);
      model._request.request.resolves(Promise.resolve(success));
      model.delete(() => {
        model.parseResponse.should.have.been.calledWith(200, { message: 'success' }, sinon.match.func);
        done();
      });
    });

    it('ignores callback if one is not given on success', () => {
      // model._request.yieldsAsync(null, success);
      model._request.request.resolves(Promise.resolve(success));
      expect(() => {
        model.delete();
      }).to.not.throw();
    });

    it('ignores callback if one is not given if API response returns an error code', () => {
      // model._request.yieldsAsync(null, fail);
      model._request.request.resolves(Promise.resolve(fail));
      expect(() => {
        model.delete();
      }).to.not.throw();
    });

    it('returns a promise if no callback is provided', () => {
      model.delete().should.be.a('promise');
    });

    it('resolves with response data', () => {
      // model._request.yieldsAsync(null, success);
      model._request.request.resolves(Promise.resolve(success));
      return model.delete().then(data => {
        data.should.eql({ message: 'success' });
      });
    });

    it('rejects with error on failure', () => {
      // model._request.yieldsAsync(null, fail);
      model._request.request.resolves(Promise.resolve(fail));
      return model.delete().catch(err => {
        err.should.eql({ message: 'error', status: 500, headers: { error: 'fail' } });
      });
    });
  });

  describe('parseResponse', () => {
    beforeEach(() => {
      sinon.stub(model, 'parse').returns({ parsed: 'true' });
      sinon.stub(model, 'parseError').returns({ error: 'true' });
    });

    it('sends response bodies with "success" status codes to parse', done => {
      model.parseResponse(200, { parsed: 'false' }, (err, data, statusCode) => {
        expect(err).to.be.null;
        model.parse.should.have.been.calledWith({ parsed: 'false' });
        data.should.eql({ parsed: 'true' });
        statusCode.should.equal(200);
        done();
      });
    });

    it('sends response bodies with "failure" status codes to parseError', done => {
      model.parseResponse(400, { parsed: 'false' }, (err, data, statusCode) => {
        err.should.eql({ error: 'true' });
        data.should.eql({ parsed: 'false' });
        statusCode.should.equal(400);
        done();
      });
    });
  });

  describe('prepare', () => {
    beforeEach(() => {
      sinon.stub(model, 'toJSON').returns({ name: 'Test name' });
    });

    afterEach(() => {
      model.toJSON.restore();
    });

    it('resolves with json', () => model.prepare().then(data => {
      data.should.eql({ name: 'Test name' });
    }));
  });

  describe('get', () => {
    beforeEach(() => {
      model.attributes = {
        name: 'Test name'
      };
    });

    it('returns the property of the passed in key', () => {
      model.get('name').should.eql('Test name');
    });

    it('returns non-primitive attributes by value', () => {
      model.set('foo', { bar: true });
      const foo = model.get('foo');
      foo.bar = false;
      expect(model.get('foo')).to.eql({ bar: true });
    });
  });

  describe('set', () => {
    beforeEach(() => {
      model.attributes = {
        name: 'Test name'
      };
    });

    it('adds a key to the model attributes if the key is a string', () => {
      model.set('age', 20).attributes.should.eql({
        name: 'Test name',
        age: 20
      });
    });

    it('accepts an object as the key', () => {
      model.set({ placeOfBirth: 'London' }).attributes.should.eql({
        name: 'Test name',
        placeOfBirth: 'London'
      });
    });

    it('emits a change event with the changed attributes', () => {
      const listener = sinon.stub();
      model.on('change', listener);
      model.set({
        foo: 'bar',
        bar: 'baz'
      });
      listener.should.have.been.calledOnce;
      listener.should.have.been.calledWithExactly({
        foo: 'bar',
        bar: 'baz'
      });
    });

    it('does not pass unchanged attributes to listener', () => {
      const listener = sinon.stub();
      model.set({
        foo: 'bar',
        bar: 'baz'
      });
      model.on('change', listener);
      model.set({
        bar: 'changed'
      });
      listener.should.have.been.calledOnce;
      listener.should.have.been.calledWithExactly({
        bar: 'changed'
      });
    });

    it('emits property specific change events', () => {
      const listener = sinon.stub();
      model.on('change:prop', listener);
      model.set('prop', 'value');
      listener.should.have.been.calledOnce;
      listener.should.have.been.calledWithExactly('value', undefined);
      listener.reset();
      model.set('prop', 'newvalue');
      listener.should.have.been.calledOnce;
      listener.should.have.been.calledWithExactly('newvalue', 'value');
      listener.reset();
      model.set('prop', 'newvalue');
      listener.should.not.have.been.called;
    });

    it('does not emit events if silent option is set to true', () => {
      const listener = sinon.stub();
      model.on('change', listener);
      model.on('change:prop', listener);
      model.set('prop', 'value', { silent: true });
      listener.should.not.have.been.called;
      model.set({ prop: 'value' }, { silent: true });
      listener.should.not.have.been.called;
    });
  });

  describe('unset', () => {
    beforeEach(() => {
      model.set({
        a: 1,
        b: 2,
        c: 3
      });
    });

    it('removes properties from model when passed a string', () => {
      model.unset('a');
      model.toJSON().should.eql({ b: 2, c: 3 });
    });

    it('removes properties from model when passed an array', () => {
      model.unset(['a', 'b']);
      model.toJSON().should.eql({ c: 3 });
    });

    it('does nothing if passed a property that does not exist', () => {
      model.unset('foo');
      model.toJSON().should.eql({ a: 1, b: 2, c: 3 });
    });

    it('emits a change event', () => {
      const listener = sinon.stub();
      model.on('change', listener);
      model.unset('a');
      listener.should.have.been.calledOnce;
      listener.should.have.been.calledWithExactly({ a: undefined });
    });

    it('emits property-specific change events', () => {
      const listener = sinon.stub();
      model.on('change:a', listener);
      model.unset('a');
      listener.should.have.been.calledOnce;
      listener.should.have.been.calledWithExactly(undefined, 1);
    });

    it('emits no events if passed silent: true', () => {
      const listener = sinon.stub();
      model.on('change', listener);
      model.on('change:a', listener);
      model.unset('a', { silent: true });
      listener.should.not.have.been.called;
    });
  });

  describe('increment', () => {
    it('throws if no property is defined', () => {
      const fn = () => {
        model.increment();
      };
      fn.should.throw();
    });

    it('throws if property is not a string', () => {
      const fn = () => {
        model.increment({});
      };
      fn.should.throw();
    });

    it('increases the defined property value by 1', () => {
      model.set('value', 1);
      model.increment('value');
      model.get('value').should.equal(2);
    });

    it('increases the defined property value by an amount specified', () => {
      model.set('value', 10);
      model.increment('value', 10);
      model.get('value').should.equal(20);
    });

    it('initialises value to 0 if value was previously undefined', () => {
      model.increment('value');
      model.get('value').should.equal(1);
    });
  });

  describe('reset', () => {
    beforeEach(() => {
      model.set({
        name: 'John',
        age: 30
      }, { silent: true });
    });

    it('clears model attributes', () => {
      model.reset();
      model.toJSON().should.eql({});
      expect(model.get('name')).to.be.undefined;
      expect(model.get('age')).to.be.undefined;
    });

    it('emits reset event', () => {
      const listener = sinon.stub();
      model.on('reset', listener);
      model.reset();
      listener.should.have.been.calledOnce;
    });

    it('emits property change events', () => {
      const listener1 = sinon.stub();
      const listener2 = sinon.stub();
      model.on('change:name', listener1);
      model.on('change:age', listener2);
      model.reset();
      listener1.should.have.been.calledOnce;
      listener1.should.have.been.calledWithExactly(undefined);
      listener2.should.have.been.calledOnce;
      listener2.should.have.been.calledWithExactly(undefined);
    });

    it('emits no events if called with silent: true', () => {
      const listener = sinon.stub();
      model.on('reset', listener);
      model.on('change:name', listener);
      model.on('change:age', listener);
      model.reset({ silent: true });
      listener.should.not.have.been.called;
    });
  });

  describe('toJSON', () => {
    beforeEach(() => {
      model.attributes = {
        name: 'Test name'
      };
    });

    it('returns an object that\'s the same as the attributes property', () => {
      model.toJSON().should.eql({
        name: 'Test name'
      });
    });
  });

  describe('url', () => {
    it('returns options.url by default', () => {
      model.url({ url: 'http://example.com/' }).should.equal('http://example.com/');
    });

    it('returns this.options.url as the fallback', () => {
      (new Model({}, {
        url: 'http://instance.example.com/'
      })).url().should.equal('http://instance.example.com/');
    });

    it('extends url passed with options', () => {
      const output = model.url({
        url: 'http://example.com',
        query: {
          foo: 'bar'
        },
        port: 3000
      });
      output.should.equal('http://example.com:3000/?foo=bar');
    });
  });

  describe('parse', () => {
    it('returns data passed', () => {
      model.parse({ data: 1 }).should.eql({ data: 1 });
    });
  });

  describe('parseError', () => {
    it('returns data passed extednded with the status code', () => {
      model.parseError(500, { data: 1 }).should.eql({ status: 500, data: 1 });
      model.parseError(400, { data: 'message' }).should.eql({ status: 400, data: 'message' });
    });
  });
});
