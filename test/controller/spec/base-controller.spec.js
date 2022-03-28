'use strict';

const Form = require('../../../controller/base-controller');
const validators = require('../../../controller/validation/validators');
const formatters = require('../../../controller/formatting/formatters');
const FormError = require('../../../controller/validation-error');

const _ = require('lodash');
const EventEmitter = require('events').EventEmitter;

describe('Form Controller', () => {
  beforeEach(() => {
    sinon.spy(EventEmitter.prototype, 'emit');
  });

  afterEach(() => {
    EventEmitter.prototype.emit.restore();
  });

  it('exports a constructor', () => {
    Form.should.be.a('function');
  });

  it('implements event emitter', () => {
    const form = new Form({ template: 'index' });
    form.should.be.an.instanceOf(EventEmitter);
  });

  it('doesn\'t throw if template is undefined', () => {
    const fn = () => new Form({});
    fn.should.not.throw();
  });

  it('throws if options are undefined', () => {
    const fn = () => new Form();
    fn.should.throw();
  });

  it('has `get` and `post` methods', () => {
    const form = new Form({ template: 'index' });
    form.get.should.be.a('function');
    form.post.should.be.a('function');
  });

  it('has a `requestHandler` method', () => {
    const form = new Form({ template: 'index' });
    form.requestHandler.should.be.a('function');
  });

  describe('requestHandler', () => {
    let form;
    let handler;
    let req;
    let res;
    let cb;

    beforeEach(() => {
      form = new Form({ template: 'index' });
      sinon.stub(form, 'get').yields();
      sinon.stub(form, 'post').yields();
      // use a spy instead of a stub so that the length is unaffected
      sinon.spy(form, 'errorHandler');
      req = request({
        url: '/test',
        params: {}
      });
      res = {
        send: sinon.stub()
      };
      cb = () => {};
    });

    it('returns a function', () => {
      form.requestHandler().should.be.a('function');
    });

    describe('returned function', () => {
      it('calls form.get in response to get requests', () => {
        req.method = 'GET';
        handler = form.requestHandler();
        handler(req, res, cb);
        form.get.should.have.been.calledWith(req, res);
        form.get.should.have.been.calledOn(form);
      });

      it('calls form.post in response to post requests', () => {
        req.method = 'POST';
        handler = form.requestHandler();
        handler(req, res, cb);
        form.post.should.have.been.calledWith(req, res);
        form.post.should.have.been.calledOn(form);
      });

      it('calls error handler if method calls back with an error', done => {
        req.method = 'POST';
        form.post.yields({ error: 'message' });
        handler = form.requestHandler();
        handler(req, res, () => {
          form.errorHandler.should.have.been.calledOnce;
          form.errorHandler.should.have.been.calledWith({ error: 'message' }, req, res);
          form.errorHandler.should.have.been.calledOn(form);
          done();
        });
      });

      it('calls any additional middlewares before invoking request handlers', done => {
        const middleware = sinon.stub().yields();
        req.method = 'GET';
        form.use(middleware);
        handler = form.requestHandler();
        handler(req, res, () => {
          middleware.should.have.been.calledWith(req, res);
          middleware.should.have.been.calledBefore(form.get);
          done();
        });
      });

      it('keeps url params from parent routers', done => {
        const router = require('express').Router();
        req.method = 'GET';
        req.url = '/test/123';
        // eslint-disable-next-line no-shadow
        form.use((req, res, next) => {
          try {
            req.params.id.should.equal('123');
            next();
          } catch (e) {
            done(e);
          }
        });
        router.route('/test/:id').all(form.requestHandler());
        router(req, res, done);
      });

      it('throws a 405 on unsupported methods', done => {
        req.method = 'PUT';
        handler = form.requestHandler();
        handler(req, res, err => {
          err.statusCode.should.equal(405);
          done();
        });
      });
    });
  });

  describe('configure', () => {
    let form;
    let req;
    let res;
    let cb;

    beforeEach(() => {
      form = new Form({
        template: 'index',
        next: '/next',
        fields: {
          field: 'name'
        }
      });
      req = request({
        path: '/index',
        baseUrl: '/base'
      });
      res = {
        render: sinon.stub(),
        locals: {}
      };
      cb = sinon.stub();
      sinon.spy(form, '_configure');
      sinon.stub(form, 'configure').yields();
    });

    it('is called as part of `get` pipeline', () => {
      form.get(req, res, cb);
      form._configure.should.have.been.calledOnce.and.calledWith(req, res);
    });

    it('is called as part of `post` pipeline', () => {
      form.post(req, res, cb);
      form._configure.should.have.been.calledOnce.and.calledWith(req, res);
    });

    it('calls through to form.configure', () => {
      form._configure(req, res, cb);
      form.configure.should.have.been.calledOnce.and.calledWith(req, res, cb);
    });

    it('writes form options to `req.form.options`', () => {
      form._configure(req, res, cb);
      req.form.options.should.deep.equal(form.options);
    });

    it('clones form options to `req.form.options` to avoid config mutation', () => {
      form._configure(req, res, cb);
      req.form.options.should.not.equal(form.options);
    });

    it('performs a deep clone of form options', () => {
      // eslint-disable-next-line no-shadow
      form.configure = sinon.spy((req, res, next) => {
        req.form.options.fields.field = 'mutated';
        next();
      });
      form._configure(req, res, cb);
      req.form.options.fields.field.should.equal('mutated');
      form.options.fields.field.should.equal('name');
    });
  });

  describe('get', () => {
    let form;
    let req;
    let res;
    let cb;

    beforeEach(() => {
      form = new Form({
        template: 'index',
        next: '/next',
        fields: {
          field: 'name'
        }
      });
      req = request({
        path: '/index',
        baseUrl: '/base'
      });
      res = {
        render: sinon.stub(),
        locals: {}
      };
      cb = sinon.stub();
      sinon.stub(Form.prototype, 'getValues').yields(null, {});
      sinon.stub(Form.prototype, 'getErrors').returns({});
      sinon.stub(Form.prototype, 'render');
    });

    afterEach(() => {
      Form.prototype.getValues.restore();
      Form.prototype.getErrors.restore();
      Form.prototype.render.restore();
    });

    it('calls form.getValues', () => {
      form.get(req, res, cb);
      form.getValues.should.have.been.calledWith(req, res);
      form.getValues.should.have.been.calledOn(form);
    });

    it('sets values to req.form.values', () => {
      Form.prototype.getValues.yields(null, { foo: 'bar' });
      form.get(req, res, cb);
      req.form.values.should.eql({ foo: 'bar' });
    });

    it('defaults req.form.values to an empty object', () => {
      Form.prototype.getValues.yields(null);
      form.get(req, res, cb);
      req.form.values.should.eql({ });
    });

    it('calls form.render', () => {
      form.get(req, res, cb);
      form.render.should.have.been.calledOnce;
      form.render.should.have.been.calledWith(req, res);
    });

    it('passes any errors to the rendered template', () => {
      form.getErrors.returns({ field: { message: 'error' } });
      form.get(req, res, cb);
      res.locals.errors.should.eql({ field: { message: 'error' } });
    });

    it('passes output of getValues to the rendered template', () => {
      form.getValues.yields(null, { values: [1] });
      form.get(req, res, cb);
      res.locals.values.should.eql({ values: [1] });
    });

    it('calls callback with error if getValues fails', () => {
      form.getValues.yields({ error: 'message' });
      form.get(req, res, cb);
      cb.should.have.been.calledOnce;
      cb.should.have.been.calledWith({ error: 'message' });
    });

    it('includes form options in rendered response', () => {
      form.get(req, res, cb);
      res.locals.options.should.eql(form.options);
    });

    it('sets the action property on res.locals', () => {
      form.get(req, res, cb);
      res.locals.action.should.equal('/base/index');

      req.baseUrl = '/';
      form.get(req, res, cb);
      res.locals.action.should.equal('/index');
    });

    it('sets values to res.locals before calling controller.locals', () => {
      let values;
      form.getValues.yields(null, { values: [1] });
      // need to do the assertion outside of middleware because express
      // wraps middleware invocation in try/catch so swallows failures
      form.locals = (_req, _res) => {
        values = _res.locals.values;
      };
      form.get(req, res, cb);
      values.should.eql({ values: [1] });
    });
  });

  describe('post', () => {
    let form;
    let req;
    let res;
    let cb;

    beforeEach(() => {
      cb = sinon.stub();
      form = new Form({
        template: 'index',
        next: 'success',
        fields: {
          field: { formatter: 'uppercase', validate: 'required' },
          email: { validate: ['required', 'email'] },
          name: {
            validate: ['required', { type: 'minlength', arguments: [10] }, { type: 'maxlength', arguments: 20 }]
          },
          place: { validate: 'required' },
          bool: { formatter: 'boolean' },
          options: { options: ['one', { value: 'two' }, 'three'] }
        }
      });
      req = request({
        flash: sinon.stub(),
        body: {
          field: 'value',
          name: 'Joe Smith',
          email: 'test@example.com',
          bool: 'true'
        }
      });
      res = {};
      sinon.stub(Form.prototype, 'validate').yields(null);
      sinon.stub(Form.prototype, 'setErrors');
      sinon.stub(Form.prototype, 'saveValues').yields(null);
      sinon.stub(Form.prototype, 'getValues').yields(null, {});
      sinon.stub(Form.prototype, 'successHandler');
      _.each(validators, (fn, key) => {
        sinon.stub(validators, key).returns(true);
      });
    });

    afterEach(() => {
      Form.prototype.validate.restore();
      Form.prototype.setErrors.restore();
      Form.prototype.saveValues.restore();
      Form.prototype.getValues.restore();
      Form.prototype.successHandler.restore();
      _.each(validators, (fn, key) => {
        validators[key].restore();
      });
    });

    it('returns an error if an unknown validator is specified', () => {
      form = new Form({
        template: 'index',
        fields: {
          field: { validate: 'unknown' }
        }
      });
      form.post(req, res, cb);

      const errArg = cb.firstCall.args[0];
      expect(errArg).to.be.instanceof(Error);
      expect(errArg.message).to.equal('Undefined validator:unknown');
    });

    it('ignores an unknown formatter', () => {
      form = new Form({
        template: 'index',
        fields: {
          field: { formatter: 'unknown' }
        }
      });
      const fn = () => form.post(req, res, cb);
      fn.should.not.throw();
    });

    it('supports functions as formatters', () => {
      form = new Form({
        template: 'index',
        fields: {
          field: { formatter: ['uppercase', v => v.replace('A', 'E')] }
        }
      });
      req.body.field = 'value';
      form.post(req, res, cb);
      req.form.values.field.should.equal('VELUE');
    });

    it('applies formatter to array of values', () => {
      form = new Form({
        template: 'index',
        fields: {
          field: { formatter: 'uppercase' }
        }
      });
      req.body.field = ['value', 'another value'];
      form.post(req, res, cb);
      req.form.values.field.should.be.eql(['VALUE', 'ANOTHER VALUE']);
    });

    it('writes field values to req.form.values', () => {
      form.post(req, res, cb);
      req.form.values.should.have.keys([
        'field',
        'email',
        'name',
        'place',
        'bool',
        'options'
      ]);
    });

    it('sets values to req.form.historicalValues', () => {
      Form.prototype.getValues.yields(null, { foo: 'bar' });
      form.post(req, res, cb);
      req.form.historicalValues.should.eql({ foo: 'bar' });
    });

    it('defaults req.form.historicalValues to an empty object', () => {
      Form.prototype.getValues.yields(null);
      form.post(req, res, cb);
      req.form.historicalValues.should.eql({ });
    });

    it('sets errors to null', () => {
      form.post(req, res, cb);
      form.setErrors.should.have.been.calledWithExactly(null, req, res);
    });

    it('calls callback with error if _process fails', () => {
      cb = sinon.stub();
      sinon.stub(form, '_process').yields('error');
      form.post(req, res, cb);
      cb.should.have.been.calledOnce;
      cb.should.have.been.calledWith('error');
    });

    it('formats posted values according to `fields` option', () => {
      form.post(req, res, cb);
      req.form.values.field.should.equal('VALUE');
      req.form.values.bool.should.equal(true);
    });

    it('creates a validate array when validate is a string or field options exist', () => {
      form.post(req, res, cb);
      expect(req.form.options.fields.bool.validate).to.be.undefined;
      req.form.options.fields.place.validate.should.eql(['required']);
      req.form.options.fields.options.validate.length.should.equal(1);
    });

    it('validates the fields', () => {
      form.post(req, res, cb);
      validators.required.should.have.been.calledWith('VALUE');
    });

    it('validates fields with multiple validators defined', () => {
      form.post(req, res, cb);
      validators.required.should.have.been.calledWith('test@example.com');
      validators.email.should.have.been.calledWith('test@example.com');
    });

    it('validates fields with parameterised validators defined', () => {
      req.body = {
        name: '  John Smith  '
      };
      form.post(req, res, cb);
      validators.required.should.have.been.calledWith('John Smith');
      validators.minlength.should.have.been.calledWith('John Smith', 10);
    });

    it('validates fields with parameterised validators defined as single values', () => {
      req.body = {
        name: 'A name longer than twenty characters'
      };
      form.post(req, res, cb);
      validators.maxlength.should.have.been.calledWith('A name longer than twenty characters', 20);
    });

    it('adds an equality validator if field has options defined', () => {
      req.body = {
        options: 'number'
      };
      form.post(req, res, cb);
      validators.equal.should.have.been.calledOnce;
      validators.equal.should.have.been.calledWith('number', 'one', 'two', 'three');
    });

    it('does not keep adding equality validators if one already exists', () => {
      req.body = {
        options: 'number'
      };
      form.post(req, res, cb);
      validators.equal.should.have.been.calledOnce;
      form.post(req, res, cb);
      validators.equal.should.have.been.calledTwice;
      req.form.options.fields.options.validate.length.should.equal(1);
    });

    it('calls out to form.validate', () => {
      form.post(req, res, cb);
      form.validate.should.have.been.calledWith(req, res);
      form.validate.should.have.been.calledOn(form);
    });

    describe('sanitise inputs', () => {
      const tests = [
        { value: 'HELLO\/*TEST*\/WORLD1', expected: 'HELLOTESTWORLD1' },
        { value: 'HELLO|WORLD2', expected: 'HELLOWORLD2' },
        { value: 'HELLO&&WORLD3', expected: 'HELLO&WORLD3' },
        { value: 'HELLO@@WORLD4', expected: 'HELLO@WORLD4' },
        { value: 'HELLO/..;/WORLD5', expected: 'HELLOWORLD5' },
        { value: 'HELLO......WORLD6', expected: 'HELLO.WORLD6' },
        { value: 'HELLO/eTc/paSsWdWORLD7', expected: 'HELLOWORLD7' },
        { value: 'HELLOC:\\WORLD8', expected: 'HELLOWORLD8' },
        { value: 'HELLOcMd.ExEWORLD9', expected: 'HELLOWORLD9' },
        { value: 'HELLO<WORLD10', expected: 'HELLO<-WORLD10' },
        { value: 'HELLO>WORLD11', expected: 'HELLO>-WORLD11' },
        { value: 'HELLO[WORLD12', expected: 'HELLO[-WORLD12' },
        { value: 'HELLO]WORLD13', expected: 'HELLO]-WORLD13' },
        { value: 'HELLO~WORLD14', expected: 'HELLO~-WORLD14' },
        { value: 'HELLO&#WORLD15', expected: 'HELLO&#-WORLD15' },
        { value: 'HELLO%UWORLD16', expected: 'HELLO%U-WORLD16' },
        {
          value: '1/*2*/3|4&&5@@6..7/etc/PASSwd8C:\\9Cmd.eXe10/..;/11<12>13[14]15~16&#17%U18',
          expected: '1234&5@6.7891011<-12>-13[-14]-15~-16&#-17%U-18'
        },
        { value: 'Test User', expected: 'Test User'},
        { value: '123 Test Street', expected: '123 Test Street'},
        { value: 'London', expected: 'London'},
        { value: 'United Kingdom', expected: 'United Kingdom'},
        { value: '2022-01-01', expected: '2022-01-01' }
      ];

      tests.forEach(({value, expected}) => {
        it('sanitisation returns correct data', function () {
          req.form = {
            values: {
              value: value
            }
          };
          form._sanitize(req, res, cb);
          req.form.values.value.should.equal(expected);
        });
      });
    });

    describe('valid inputs', () => {
      it('calls form.saveValues', () => {
        form.post(req, res, cb);
        form.saveValues.should.have.been.calledWith(req, res);
        form.saveValues.should.have.been.calledOn(form);
      });

      it('calls form.successHandler if saved successfully', () => {
        form.post(req, res, cb);
        form.successHandler.should.have.been.calledWith(req, res);
        form.successHandler.should.have.been.calledOn(form);
      });

      it('calls callback if not saved successfully', () => {
        form.saveValues.yields({ error: true });
        form.post(req, res, cb);
        cb.should.have.been.calledWith({ error: true });
      });
    });

    describe('invalid inputs', () => {
      it('calls callback with validation errors matching failed validation type', () => {
        validators.email.returns(false);
        req.body.email = 'foo';
        form.post(req, res, cb);
        cb.should.have.been.calledOnce;
        Object.keys(cb.args[0][0]).should.eql(['email']);
        _.each(cb.args[0][0], (err, key) => {
          err.type.should.equal('email');
          err.key.should.equal(key);
        });
      });

      it('does not continue validating if field validation fails', () => {
        validators.required.returns(false);
        form.post(req, res, cb);
        cb.should.have.been.called;
        form.validate.should.not.have.been.called;
      });

      it('validation of a field stops at the first error', () => {
        validators.required.withArgs('test@example.com').returns(false);
        form.post(req, res, cb);
        cb.should.have.been.calledOnce;
        Object.keys(cb.args[0][0]).should.eql(['email']);
        _.each(cb.args[0][0], (err, key) => {
          err.type.should.equal('required');
          err.key.should.equal(key);
        });
        validators.email.should.not.have.been.called;
      });

      it('all fields are validated', () => {
        validators.required.returns(false);
        req.body = { field: 'value', email: 'foo', name: 'John' };
        form.post(req, res, cb);
        cb.should.have.been.calledOnce;
        Object.keys(cb.args[0][0]).should.eql(['field', 'email', 'name', 'place']);
        _.each(cb.args[0][0], (err, key) => {
          err.type.should.equal('required');
          err.key.should.equal(key);
        });
        validators.email.should.not.have.been.called;
      });

      it('creates instances of Error class with validation errors', done => {
        validators.required.returns(false);
        req.body = { field: 'value', email: 'foo', name: 'John' };
        form.post(req, res, err => {
          _.each(err, e => {
            e.should.be.an.instanceOf(form.ValidationError);
          });
          done();
        });
      });
    });

    describe('invalid form-level validation', () => {
      beforeEach(() => {
        Form.prototype.validate.yields({ field: 'invalid' });
      });

      it('calls callback with validation errors', () => {
        form.post(req, res, cb);
        cb.should.have.been.calledWith({ field: 'invalid' });
      });
    });
  });

  describe('render', () => {
    let form;
    let req;
    let res;
    let cb;

    beforeEach(done => {
      form = new Form({
        template: 'index',
        next: '/next',
        fields: {
          field: 'name'
        }
      });
      req = {};
      res = {
        render: sinon.stub()
      };
      cb = sinon.stub();
      form._configure(req, res, done);
    });

    it('renders the provided template', () => {
      form.render(req, res, cb);
      res.render.should.have.been.calledWith('index');
    });

    it('throws an error if no template provided', () => {
      req.form.options.template = undefined;
      form.render(req, res, cb);
      cb.should.have.been.calledOnce;

      const errArg = cb.firstCall.args[0];
      expect(errArg).to.be.instanceof(Error);
      expect(errArg.message).to.equal('A template must be provided');
    });
  });

  describe('getNextStep', () => {
    let form;
    let req;
    let res;

    beforeEach(done => {
      form = new Form({ template: 'index', next: '/next-page' });
      req = request({
        params: {},
        body: { field: 'value' },
        flash: sinon.stub()
      });
      res = {
        redirect: sinon.stub()
      };
      form._configure(req, res, done);
    });

    it('redirects to `next` page', () => {
      form.getNextStep(req, res).should.be.equal('/next-page');
    });

    it('prefixes redirect url with req.baseUrl', () => {
      req.baseUrl = '/base';
      form.getNextStep(req, res).should.be.equal('/base/next-page');
    });

    describe('with forks, and _getForkTarget returns /fork', () => {
      beforeEach(() => {
        sinon.stub(Form.prototype, '_getForkTarget').returns('/fork');
        req.form.options.forks = [];
      });

      afterEach(() => {
        Form.prototype._getForkTarget.restore();
      });

      it('calls _getForkTarget if forks are present', () => {
        form.getNextStep(req, res);
        Form.prototype._getForkTarget.should.have.been.calledOnce;
      });

      it('prefixes result of _getForkTarget with req.baseUrl if present', () => {
        req.baseUrl = '/base';
        form.getNextStep(req, res).should.be.equal('/base/fork');
      });
    });
  });

  describe('getForkTarget', () => {
    const req = {};
    const res = {};
    let form;

    beforeEach(done => {
      sinon.stub(Form.prototype, '_getForkTarget');
      form = new Form({ template: 'index', next: '/next-page' });
      form._configure(req, res, done);
    });

    afterEach(() => {
      Form.prototype._getForkTarget.restore();
    });

    it('calls _getForkTarget with req and res', () => {
      form.getForkTarget(req, res);
      Form.prototype._getForkTarget.should.have.been.calledOnce
        .and.calledWithExactly(req, res);
    });
  });

  describe('_getForkTarget', () => {
    let form;
    let req;
    let res;

    beforeEach(done => {
      form = new Form({ template: 'index', next: '/next-page' });
      req = request({
        params: {},
        body: { field: 'value' },
        flash: sinon.stub(),
        form: { values: {} }
      });
      res = {};
      form._configure(req, res, done);
    });

    it('returns the fork target if the condition config is met', () => {
      req.form.values['example-radio'] = 'conditionMet';
      req.form.options.forks = [{
        target: '/target-page',
        condition: {
          field: 'example-radio',
          value: 'conditionMet'
        }
      }];
      form._getForkTarget(req, {}).should.contain('/target-page');
    });

    it('returns the fork target if the condition config is met in historical values map', () => {
      req.form.historicalValues = {
        'example-radio': 'conditionMet'
      };
      req.form.options.forks = [{
        target: '/target-page',
        condition: {
          field: 'example-radio',
          value: 'conditionMet'
        }
      }];
      form._getForkTarget(req, {}).should.contain('/target-page');
    });

    it('returns the original next if the condition config is not met in historical values map', () => {
      req.form.historicalValues = {
        'example-radio': 'conditionNotMet'
      };
      req.form.options.forks = [{
        target: '/target-page',
        condition: {
          field: 'example-radio',
          value: 'conditionMet'
        }
      }];
      form._getForkTarget(req, {}).should.contain('/next-page');
    });

    it('returns the original next target if the condition config is not met', () => {
      req.form.values['example-radio'] = 'conditionNotMet';
      req.form.options.forks = [{
        target: '/target-page',
        condition: {
          field: 'example-radio',
          value: 'conditionMet'
        }
      }];
      form._getForkTarget(req, {}).should.equal('/next-page');
    });

    it('returns the original next target if the condition config value is not present', () => {
      delete req.form.values['example-radio'];
      req.form.options.forks = [{
        target: '/target-page',
        condition: {
          field: 'example-radio',
          value: 'conditionMet'
        }
      }];
      form._getForkTarget(req, {}).should.equal('/next-page');
    });

    it('returns the fork target if the condition function is met', () => {
      req.form.options.forks = [{
        target: '/target-page',
        condition: () => true
      }];
      form._getForkTarget(req, {}).should.contain('/target-page');
    });

    it('returns the original next target if the condition function is not met', () => {
      req.form.options.forks = [{
        target: '/target-page',
        condition: () => false
      }];
      form._getForkTarget(req, {}).should.equal('/next-page');
    });

    describe('with more than one fork', () => {
      describe('when the fields are the same', () => {
        beforeEach(() => {
          req.form.values = {
            'example-radio': 'condition-met'
          };
          req.form.options.forks = [{
            target: '/target-page',
            condition: {
              field: 'example-radio',
              value: 'condition-met'
            }
          }, {
            target: '/target-page-2',
            condition: {
              field: 'example-radio',
              value: 'condition-met'
            }
          }];
        });

        it('retuns the last forks\' target if each condition is met', () => {
          form._getForkTarget(req, {}).should.contain('/target-page-2');
        });
      });

      describe('when the fields are different', () => {
        beforeEach(() => {
          req.form.options.forks = [{
            target: '/target-page',
            condition: {
              field: 'example-radio',
              value: 'conditionMet'
            }
          }, {
            target: '/target-page-2',
            condition: {
              field: 'example-email',
              value: 'conditionMet'
            }
          }];
        });

        it('returns the last forks\' target if each condition is met', () => {
          req.form.values = {
            'example-radio': 'conditionMet',
            'example-email': 'conditionMet'
          };
          form._getForkTarget(req, {}).should.contain('/target-page-2');
        });
      });
    });
  });

  describe('successHandler', () => {
    let form;
    let req;
    let res;
    beforeEach(() => {
      sinon.stub(Form.prototype, 'getNextStep');
      form = new Form({ template: 'index' });
      req = request({
        params: {},
        body: { field: 'value' },
        flash: sinon.stub()
      });
      res = {
        redirect: sinon.stub()
      };
    });

    afterEach(() => {
      Form.prototype.getNextStep.restore();
    });

    it('emits "complete" event', () => {
      form.successHandler(req, res);
      form.emit.withArgs('complete').should.have.been.calledOnce;
      form.emit.withArgs('complete').should.have.been.calledOn(form);
      form.emit.should.have.been.calledWithExactly('complete', req, res);
    });
  });

  describe('errorHandler', () => {
    let form;
    let req;
    let res;
    let err;

    beforeEach(() => {
      err = new FormError('field');
      form = new Form({ template: 'index', next: '/success' });
      req = request({
        path: '/index',
        originalUrl: '/app/index',
        form: {
          values: { field: 'value' }
        }
      });
      res = {
        redirect: sinon.stub()
      };
    });

    it('redirects to req.originalUrl if no redirecting error is defined', () => {
      form = new Form({ template: 'index' });
      form.errorHandler({ field: err }, req, res);
      res.redirect.should.have.been.calledWith('/app/index');
    });

    it('redirects to req.originalUrl if not all errors have a redirect value', () => {
      err = {
        'field-a': new form.ValidationError('field-a'),
        'field-b': new form.ValidationError('field-b', { redirect: '/exitpage' })
      };
      form.errorHandler(err, req, res);
      res.redirect.should.have.been.calledWith('/app/index');
    });

    it('redirects to error redirect if all errors have a redirect value', () => {
      err.redirect = '/exitpage';
      form.errorHandler({ field: err }, req, res);
      res.redirect.should.have.been.calledWith('/exitpage');
    });

    it('redirects to another site if defined', () => {
      err.redirect = 'http://www.gov.uk/';
      req.originalUrl = '/foo';
      form.errorHandler({ field: err }, req, res);
      res.redirect.should.have.been.calledWith('http://www.gov.uk/');
    });

    it('redirects to another secure site if defined', () => {
      err.redirect = 'https://www.gov.uk/';
      req.originalUrl = '/foo';
      form.errorHandler({ field: err }, req, res);
      res.redirect.should.have.been.calledWith('https://www.gov.uk/');
    });

    it('calls callback if error is not a validation error', () => {
      const cb = sinon.stub();
      err = new Error('message');
      form.errorHandler(err, req, res, cb);
      cb.should.have.been.calledOnce;
      cb.should.have.been.calledWith(err);
    });
  });

  describe('_validate', () => {
    describe('sharing of errors defined with validator groups', () => {
      let form;
      let req;
      let res;
      let cb;

      beforeEach(done => {
        form = new Form({
          template: 'index',
          next: 'error',
          fields: {
            'is-thing-a': {
              validate: [
                { type: 'required', group: 'is-thing' }
              ]
            },
            'is-thing-b': {
              validate: [
                { type: 'required', group: 'is-thing' }
              ]
            },
            'is-thing-c': {
              validate: [
                { type: 'required' }
              ]
            }
          }
        });
        req = request({
          flash: sinon.stub(),
          form: {
            values: {
              'is-thing-a': '',
              'is-thing-b': '',
              'is-thing-c': ''
            }
          }
        });
        res = {};
        cb = sinon.stub();

        form._configure(req, res, done);
      });

      it('should *only* place errors against a single key if creating validator belongs to a group', () => {
        form._validate(req, res, cb);
        cb.should.be.calledWith(sinon.match({
          'is-thing': new FormError('is-thing', { type: 'required' }),
          'is-thing-c': new FormError('is-thing-c', { type: 'required' })
        }));
      });
    });

    describe('dependent fields', () => {
      let form;
      let req;
      let res;
      let cb;
      let customFormatters;

      beforeEach(() => {
        customFormatters = Object.assign({}, formatters, {
          'boolean-force'(value) {
            let state;
            if (value === true || value === 'true') {
              state = true;
            } else if (value === false || value === 'false') {
              state = false;
            } else {
              state = undefined;
            }

            return !!state;
          }
        });
        res = {};
        cb = sinon.stub();
      });

      it('should clean the values with an appropriately formatted empty value if a dependency is not met', () => {
        form = new Form({
          template: 'index',
          next: 'error',
          formatters: customFormatters,
          fields: {
            'is-thing': {
              formatter: 'boolean-force',
              validate: [
                'required'
              ]
            },
            'is-thing-b': {
              formatter: 'boolean-force',
              validate: [
                'required'
              ],
              dependent: 'is-thing'
            },
            'is-thing-notes': {
              validate: [
                'required'
              ],
              dependent: {
                field: 'is-thing',
                value: 'true'
              }
            }
          }
        });
        req = request({
          flash: sinon.stub(),
          form: {
            values: {
              // Some preformatted booleans come in.
              'is-thing': false,
              'is-thing-b': true,
              'is-thing-notes': 'some notes'
            }
          }
        });
        form._configure(req, res, () => {});
        form._validate(req, res, cb);
        cb.should.not.be.calledWithMatch({});

        // Notice how the string which misses its dependency is
        // formatted to an empty string, while the boolean-force formatted
        // field that can only equal true or false becomes false.
        req.form.values.should.eql({
          'is-thing': false,
          'is-thing-b': false,
          'is-thing-notes': ''
        });
      });

      it('should be validated if the dependency exists in the step\'s fields and the value matches', () => {
        form = new Form({
          template: 'index',
          formatters: customFormatters,
          fields: {
            'is-thing': {
              validate: [
                'required'
              ]
            },
            'is-thing-b': {
              validate: [
                'required'
              ],
              dependent: {
                field: 'is-thing',
                value: 'true'
              }
            }
          }
        });

        req = request({
          form: {
            values: {
              'is-thing': 'true',
              'is-thing-b': ''
            }
          }
        });
        form._configure(req, res, () => {});
        form._validate(req, res, cb);
        cb.should.have.been.calledWith(sinon.match({
          'is-thing-b': new form.ValidationError('is-thing-b', { type: 'required' })
        }));
      });

      it('should be validated if the dependency doesn\'t exist in the step\'s fields', () => {
        form = new Form({
          template: 'index',
          formatters: customFormatters,
          fields: {
            'is-thing': {
              validate: [
                'required'
              ]
            },
            'is-thing-b': {
              validate: [
                'required'
              ],
              dependent: {
                field: 'is-not-a-thing',
                value: 'true'
              }
            }
          }
        });

        req = request({
          form: {
            values: {
              'is-thing': 'true',
              'is-thing-b': ''
            }
          }
        });
        form._configure(req, res, () => {});
        form._validate(req, res, cb);
        cb.should.have.been.calledWith(sinon.match({
          'is-thing-b': new form.ValidationError('is-thing-b', { type: 'required' })
        }));
      });

      it('shouldn\'t be validated if the dependency exists but the value doesn\'t match', () => {
        form = new Form({
          template: 'index',
          formaters: customFormatters,
          fields: {
            'is-thing': {
              validate: [
                'required'
              ]
            },
            'is-thing-b': {
              validate: [
                'required'
              ],
              dependent: {
                field: 'is-thing',
                value: 'false'
              }
            }
          }
        });

        req = request({
          form: {
            values: {
              'is-thing': 'false',
              'is-thing-b': ''
            }
          }
        });
        form._configure(req, res, () => {});
        form._validate(req, res, cb);
        cb.should.have.been.calledWith();
      });
    });
  });
});
