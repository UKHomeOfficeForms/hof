/* eslint-disable node/no-deprecated-api */
'use strict';

const config = require('../../../config/hof-defaults');
const isPdf = sinon.stub();
const Model = proxyquire('../model/apis/html-to-pdf-converter', {
  'is-pdf': isPdf
});

describe('PDF Model', () => {
  describe('url', () => {
    it('returns the pdf url', () => {
      const model = new Model();
      const url = model.url();
      expect(url).to.equal(config.apis.pdfConverter);
    });
  });

  describe('handleResponse', () => {
    beforeEach(() => {
      sinon.stub(Model.prototype, 'parseResponse');
    });

    afterEach(() => {
      Model.prototype.parseResponse.restore();
    });

    it('proxies the successful responses to model.parseResponse', () => {
      const model = new Model();
      isPdf.returns(true);
      const res = {
        statusCode: 200,
        body: Buffer(100)
      };
      const callback = sinon.stub();
      model.handleResponse(res, callback);
      expect(Model.prototype.parseResponse).to.have.been.calledWith(res.statusCode, res.body, callback);
    });

    it('passes errors to the callback', done => {
      const model = new Model();
      isPdf.returns(false);
      const res = {
        statusCode: 500,
        body: JSON.stringify({
          title: 'Error',
          message: 'There is an error'
        })
      };
      model.handleResponse(res, (err, body, statusCode) => {
        expect(err).to.be.an('error');
        expect(body).to.be.null;
        expect(statusCode).to.equal(res.statusCode);
        done();
      });
    });

    it('decorate 400 client errors with a title and message', done => {
      const model = new Model();
      isPdf.returns(false);
      const res = {
        statusCode: 400,
        body: JSON.stringify({
          code: 'ClientError',
          message: 'There is an error'
        })
      };
      model.handleResponse(res, (err, body, statusCode) => {
        expect(err).to.be.an('error');
        expect(err.title).to.equal(res.body.code);
        expect(err.message).to.equal(res.body.message);
        expect(body).to.be.null;
        expect(statusCode).to.equal(400);
        done();
      });
    });
  });
});
