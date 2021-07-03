'use strict';

const reqres = require('reqres');
const mix = require('mixwith').mix;
const Form = require('../../../controller').BaseController;

const sandbox = require('mocha-sandbox');

const methodNames = [
  '_getErrors',
  '_getValues',
  '_locals',
  'render',
  '_process',
  '_validate',
  'saveValues',
  'successHandler'
];

describe('Hooks', () => {

  let req;
  let res;

  const Hooks = require('../../../controller/behaviour-hooks');

  class Controller extends mix(Form).with(Hooks) {}

  beforeEach(() => {
    req = reqres.req();
    res = reqres.res();
    methodNames.forEach(method => {
      // make render and successHandler terminate as normal
      if (method === 'render') {
        sinon.stub(Form.prototype, method).callsFake((q, s) => {
          s.render();
        });
      } else if (method === 'successHandler') {
        sinon.stub(Form.prototype, method).callsFake((q, s) => {
          s.redirect();
        });
      } else {
        sinon.stub(Form.prototype, method).yields();
      }
    });
  });
  afterEach(() => {
    methodNames.forEach(method => {
      Form.prototype[method].restore();
    });
  });

  it('passes params to child', done => {
    req.params = {
      foo: 'bar'
    };
    req.form = {
      options: {
        fields: {
          field: {
            hooks: {
              'pre-getErrors': sinon.stub().yields()
            }
          }
        }
      }
    };
    Form.prototype._getErrors.restore();
    sinon.stub(Form.prototype, '_getErrors').callsFake((r) => {
      expect(r.params.foo).to.be.equal('bar');
      done();
    });
    const controller = new Controller({});
    controller.get(req, res, sinon.stub());
  });

  describe('get pipeline', () => {

    it('calls getErrors lifecycle hooks', (done) => {
      const fields = {
        field: {
          hooks: {
            'pre-getErrors': sinon.stub().yields(),
            'post-getErrors': sinon.stub().yields()
          }
        }
      };
      const controller = new Controller({fields});
      controller.get(req, res, sinon.stub());

      res.on('end', sandbox(() => {
        expect(fields.field.hooks['pre-getErrors']).to.have.been.calledOnce;
        expect(fields.field.hooks['pre-getErrors']).to.have.been.calledWith(req, res);
        expect(Form.prototype._getErrors).to.have.been.calledOnce;
        expect(Form.prototype._getErrors).to.have.been.calledWith(req, res);
        expect(fields.field.hooks['post-getErrors']).to.have.been.calledOnce;
        expect(fields.field.hooks['post-getErrors']).to.have.been.calledWith(req, res);
        expect(fields.field.hooks['pre-getErrors']).to.have.been.calledBefore(Form.prototype._getErrors);
        expect(fields.field.hooks['post-getErrors']).to.have.been.calledAfter(Form.prototype._getErrors);
      }, done));
    });

    it('calls getValues lifecycle hooks', (done) => {
      const fields = {
        field: {
          hooks: {
            'pre-getValues': sinon.stub().yields(),
            'post-getValues': sinon.stub().yields()
          }
        }
      };
      const controller = new Controller({fields});
      controller.get(req, res, sinon.stub());

      res.on('end', sandbox(() => {
        expect(fields.field.hooks['pre-getValues']).to.have.been.calledOnce;
        expect(fields.field.hooks['pre-getValues']).to.have.been.calledWith(req, res);
        expect(Form.prototype._getValues).to.have.been.calledOnce;
        expect(Form.prototype._getValues).to.have.been.calledWith(req, res);
        expect(fields.field.hooks['post-getValues']).to.have.been.calledOnce;
        expect(fields.field.hooks['post-getValues']).to.have.been.calledWith(req, res);
        expect(fields.field.hooks['pre-getValues']).to.have.been.calledBefore(Form.prototype._getValues);
        expect(fields.field.hooks['post-getValues']).to.have.been.calledAfter(Form.prototype._getValues);
      }, done));
    });

    it('calls locals lifecycle hooks', (done) => {
      const fields = {
        field: {
          hooks: {
            'pre-locals': sinon.stub().yields(),
            'post-locals': sinon.stub().yields()
          }
        }
      };
      const controller = new Controller({fields});
      controller.get(req, res, sinon.stub());

      res.on('end', sandbox(() => {
        expect(fields.field.hooks['pre-locals']).to.have.been.calledOnce;
        expect(fields.field.hooks['pre-locals']).to.have.been.calledWith(req, res);
        expect(Form.prototype._locals).to.have.been.calledOnce;
        expect(Form.prototype._locals).to.have.been.calledWith(req, res);
        expect(fields.field.hooks['post-locals']).to.have.been.calledOnce;
        expect(fields.field.hooks['post-locals']).to.have.been.calledWith(req, res);
        expect(fields.field.hooks['pre-locals']).to.have.been.calledBefore(Form.prototype._locals);
        expect(fields.field.hooks['post-locals']).to.have.been.calledAfter(Form.prototype._locals);
      }, done));
    });

    it('calls render "pre" lifecycle hooks only because render terminates', (done) => {
      const fields = {
        field: {
          hooks: {
            'pre-render': sinon.stub().yields(),
            'post-render': sinon.stub().yields()
          }
        }
      };
      const controller = new Controller({fields});
      controller.get(req, res, sinon.stub());

      res.on('end', sandbox(() => {
        expect(fields.field.hooks['pre-render']).to.have.been.calledOnce;
        expect(fields.field.hooks['pre-render']).to.have.been.calledWith(req, res);
        expect(Form.prototype.render).to.have.been.calledOnce;
        expect(Form.prototype.render).to.have.been.calledWith(req, res);
        expect(fields.field.hooks['post-render']).not.to.have.been.called;

        expect(fields.field.hooks['pre-render']).to.have.been.calledBefore(Form.prototype.render);
      }, done));
    });

  });

  describe('post pipeline', () => {

    it('calls process lifecycle hooks', (done) => {
      const fields = {
        field: {
          hooks: {
            'pre-process': sinon.stub().yields(),
            'post-process': sinon.stub().yields()
          }
        }
      };
      const controller = new Controller({fields});
      controller.post(req, res, sinon.stub());

      res.on('end', sandbox(() => {
        expect(fields.field.hooks['pre-process']).to.have.been.calledOnce;
        expect(fields.field.hooks['pre-process']).to.have.been.calledWith(req, res);
        expect(Form.prototype._process).to.have.been.calledOnce;
        expect(Form.prototype._process).to.have.been.calledWith(req, res);
        expect(fields.field.hooks['post-process']).to.have.been.calledOnce;
        expect(fields.field.hooks['post-process']).to.have.been.calledWith(req, res);
        expect(fields.field.hooks['pre-process']).to.have.been.calledBefore(Form.prototype._process);
        expect(fields.field.hooks['post-process']).to.have.been.calledAfter(Form.prototype._process);
      }, done));
    });

    it('calls validate lifecycle hooks', (done) => {
      const fields = {
        field: {
          hooks: {
            'pre-validate': sinon.stub().yields(),
            'post-validate': sinon.stub().yields()
          }
        }
      };
      const controller = new Controller({fields});
      controller.post(req, res, sinon.stub());

      res.on('end', sandbox(() => {
        expect(fields.field.hooks['pre-validate']).to.have.been.calledOnce;
        expect(fields.field.hooks['pre-validate']).to.have.been.calledWith(req, res);
        expect(Form.prototype._validate).to.have.been.calledOnce;
        expect(Form.prototype._validate).to.have.been.calledWith(req, res);
        expect(fields.field.hooks['post-validate']).to.have.been.calledOnce;
        expect(fields.field.hooks['post-validate']).to.have.been.calledWith(req, res);
        expect(fields.field.hooks['pre-validate']).to.have.been.calledBefore(Form.prototype._validate);
        expect(fields.field.hooks['post-validate']).to.have.been.calledAfter(Form.prototype._validate);
      }, done));
    });

    it('calls saveValues lifecycle hooks', (done) => {
      const fields = {
        field: {
          hooks: {
            'pre-saveValues': sinon.stub().yields(),
            'post-saveValues': sinon.stub().yields()
          }
        }
      };
      const controller = new Controller({fields});
      controller.post(req, res, sinon.stub());

      res.on('end', sandbox(() => {
        expect(fields.field.hooks['pre-saveValues']).to.have.been.calledOnce;
        expect(fields.field.hooks['pre-saveValues']).to.have.been.calledWith(req, res);
        expect(Form.prototype.saveValues).to.have.been.calledOnce;
        expect(Form.prototype.saveValues).to.have.been.calledWith(req, res);
        expect(fields.field.hooks['post-saveValues']).to.have.been.calledOnce;
        expect(fields.field.hooks['post-saveValues']).to.have.been.calledWith(req, res);
        expect(fields.field.hooks['pre-saveValues']).to.have.been.calledBefore(Form.prototype.saveValues);
        expect(fields.field.hooks['post-saveValues']).to.have.been.calledAfter(Form.prototype.saveValues);
      }, done));
    });

    it('calls successHandler "pre" lifecycle hooks only because successHandler terminates', (done) => {
      const fields = {
        field: {
          hooks: {
            'pre-successHandler': sinon.stub().yields(),
            'post-successHandler': sinon.stub().yields()
          }
        }
      };
      const controller = new Controller({fields});
      controller.post(req, res, sinon.stub());

      res.on('end', sandbox(() => {
        expect(fields.field.hooks['pre-successHandler']).to.have.been.calledOnce;
        expect(fields.field.hooks['pre-successHandler']).to.have.been.calledWith(req, res);
        expect(Form.prototype.successHandler).to.have.been.calledOnce;
        expect(Form.prototype.successHandler).to.have.been.calledWith(req, res);

        expect(fields.field.hooks['post-successHandler']).not.to.have.been.called;
        expect(fields.field.hooks['pre-successHandler']).to.have.been.calledBefore(Form.prototype.successHandler);
      }, done));
    });

  });

  describe('error handling', () => {

    it('stops execution pipeline if a hook fails', (done) => {
      const error = new Error('test error');
      const fields = {
        field: {
          hooks: {
            'pre-getErrors': sinon.stub().yields(error)
          }
        }
      };
      const controller = new Controller({fields});
      controller.get(req, res, sandbox((err) => {
        expect(fields.field.hooks['pre-getErrors']).to.have.been.calledOnce;
        expect(fields.field.hooks['pre-getErrors']).to.have.been.calledWith(req, res);
        expect(Form.prototype._getErrors).not.to.have.been.called;
        expect(err).to.equal(error);
      }, done));
    });

  });

});
