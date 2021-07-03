'use strict';

const _ = require('lodash');
const response = require('reqres').res;
const request = require('reqres').req;
const proxyquire = require('proxyquire');
const ErrorClass = require('../../../controller/validation-error');

let BaseController = require('../../../controller/base-controller');

describe('controller', () => {

  let Controller;
  let controller;

  beforeEach(() => {
    Controller = proxyquire('../../../controller/controller', {
      './base-controller': BaseController
    });
    sinon.stub(BaseController.prototype, 'use');
    sinon.stub(BaseController.prototype, 'locals').returns({foo: 'bar'});
  });

  it('sets the correct error class to the instance', () => {
    controller = new Controller({});
    controller.ValidationError.should.equal(ErrorClass);
  });

  afterEach(() => {
    BaseController.prototype.use.restore();
    BaseController.prototype.locals.restore();
  });

  describe('methods', () => {

    beforeEach(() => {
      sinon.stub(BaseController.prototype, 'getNextStep');
    });

    afterEach(() => {
      BaseController.prototype.getNextStep.restore();
    });

    describe('.get()', () => {
      const req = {};

      let res;

      beforeEach(() => {
        sinon.stub(BaseController.prototype, 'get');
        controller = new Controller({
          template: 'foo'
        });
        res = response({
          locals: {
            partials: {
              step: 'default-template'
            }
          }
        });
      });

      afterEach(() => {
        BaseController.prototype.get.restore();
      });

      it('calls super', () => {
        controller.get(req, res, _.noop);
        BaseController.prototype.get.should.have.been.calledOnce
          .and.calledWithExactly(req, res, _.noop);
      });

      it('calls res.render with the template', () => {
        controller.get(req, res, _.noop);
        res.render.should.have.been.calledOnce;
      });

      it('sets template to res.locals.partials.step if view lookup error', () => {
        res.render = (template, cb) => cb(new Error('Failed to lookup view'));
        controller.get(req, res, _.noop);
        controller.options.template.should.be.equal('default-template');
      });

    });

    describe('.getBackLink()', () => {
      const req = {};
      const res = {
        locals: {}
      };

      beforeEach(() => {
        res.locals.backLink = '';
        req.baseUrl = '/base';
        req.params = {};
        controller = new Controller({
          template: 'foo'
        });
      });

      it('returns an empty string if res.locals.backLink is an empty string', () => {
        controller.getBackLink(req, res).should.be.equal('');
      });

      it('returns null if res.locals.backLink is null', () => {
        res.locals.backLink = null;
        should.not.exist(controller.getBackLink(req, res));
      });

      it('returns the backLink unaltered if not editing and baseUrl is set', () => {
        res.locals.backLink = 'backLink';
        controller.getBackLink(req, res).should.be.equal('backLink');
      });

      it('prepends a slash if baseUrl is /', () => {
        res.locals.backLink = 'backLink';
        req.baseUrl = '/';
        controller.getBackLink(req, res).should.be.equal('/backLink');
      });

      it('prepends a slash if baseUrl is an empty string', () => {
        res.locals.backLink = 'backLink';
        req.baseUrl = '';
        controller.getBackLink(req, res).should.be.equal('/backLink');
      });

      it('appends /edit if editing', () => {
        req.params.action = 'edit';
        res.locals.backLink = 'backLink';
        controller.getBackLink(req, res).should.be.equal('backLink/edit');
      });

      it('appends /edit and prepends a slash if editing and baseUrl not set', () => {
        req.params.action = 'edit';
        req.baseUrl = '/';
        res.locals.backLink = 'backLink';
        controller.getBackLink(req, res).should.be.equal('/backLink/edit');
      });
    });

    describe('.locals()', () => {

      let req;
      let res;

      beforeEach((done) => {
        req = {
          form: {
            errors: {}
          },
          translate: () => '',
          params: {}
        };
        res = response();
        sinon.stub(Controller.prototype, 'getBackLink');
        controller = new Controller({
          template: 'foo',
          route: '/bar'
        });
        controller._configure(req, res, done);
      });

      afterEach(() => {
        Controller.prototype.getBackLink.restore();
      });

      it('always extends from parent locals', () => {
        controller.locals(req, res).should.have.property('foo').and.always.equal('bar');
      });

      it('calls getBackLink', () => {
        controller.locals(req, res);
        Controller.prototype.getBackLink.should.have.been.calledOnce;
      });

      it('returns errorLength.single if there is one error', () => {
        req.form.errors = {
          one: true
        };
        controller.locals(req, res).should.have.property('errorLength')
          .and.deep.equal({
            single: true
          });
      });

      it('returns errorLength.multiple if there is more than one error', () => {
        req.form.errors = {
          one: true,
          two: true
        };
        controller.locals(req, res).should.have.property('errorLength')
          .and.deep.equal({
            multiple: true
          });
      });

      it('returns errorLength undefined if req.form.errors is not set', () => {
        delete req.form.errors;
        controller.locals(req, res).should.have.property('errorLength')
          .and.be.undefined;
      });

      describe('with fields', () => {
        let locals;
        beforeEach(() => {
          req.form.options.fields = {
            'a-field': {
              mixin: 'input-text',
              foo: 'bar'
            },
            'another-field': {
              mixin: 'input-number',
              disableRender: true
            }
          };
          locals = controller.locals(req, res);
        });

        it('should have added a fields array to return object', () => {
          locals.should.have.property('fields').and.be.an('array');
          locals.fields[0].should.be.eql(Object.assign({}, req.form.options.fields['a-field'], { key: 'a-field' }));
          locals.fields[1].should.be.eql(Object.assign({}, req.form.options.fields['another-field'], { key: 'another-field' }));
        });
      });

      describe('with locals', () => {
        beforeEach(() => {
          res.locals = {};
          res.locals.values = {
            'field-one': 1,
            'field-two': 2,
            'field-three': 3,
            'field-four': 4
          };

          req.form.options = {
            steps: {
              '/one': {
                fields: ['field-one', 'field-two']
              },
              '/two': {
                fields: ['field-three', 'field-four']
              }
            },
            locals: {
              test: 'bar',
            },
            route: '/baz'
          };
        });

        it('should expose test in locals', () => {
          controller.locals(req, res).should.have.property('test').and.equal('bar');
        });
      });
    });

    describe('.getNextStep()', () => {
      let req;
      let res;
      let getStub;

      beforeEach((done) => {
        getStub = sinon.stub();
        getStub.returns(['/']);
        req = request();
        res = response();
        req.sessionModel = {
          reset: sinon.stub(),
          get: getStub
        };
        controller = new Controller({template: 'foo'});
        BaseController.prototype.getNextStep.returns('/');
        BaseController.prototype.getValues = function(myReq, myRes, callback) {
            callback();
        };
        controller._configure(req, res, done);
      });

      describe('when the action is "edit"', () => {
        it('appends "edit" to the path', () => {
          req.form.options.continueOnEdit = true;
          req.params.action = 'edit';
          controller.getNextStep(req).should.contain('/edit');
        });
      });

      describe('when the action is "edit" and continueOnEdit option is falsey', () => {
        it('appends "confirm" to the path', () => {
          req.form.options.continueOnEdit = false;
          req.params.action = 'edit';
          controller.getNextStep(req).should.contain('/confirm');
        });
      });

      describe('when the action is "edit" and continueOnEdit is truthy', () => {
        it('appends "/edit" to the path if next page is not /confirm', () => {
          BaseController.prototype.getNextStep.returns('/step');
          req.form.options.continueOnEdit = true;
          req.params.action = 'edit';
          getStub.returns(['/step']);
          controller.getNextStep(req).should.contain('/edit');
        });

        it('doesn\'t append "/edit" to the path if next page is /confirm', () => {
          BaseController.prototype.getNextStep.returns('/confirm');
          req.form.options.continueOnEdit = true;
          req.params.action = 'edit';
          controller.getNextStep(req).should.not.contain('/edit');
        });
      });

      describe('with a fork', () => {
        beforeEach(() => {
          getStub = sinon.stub();
          req.sessionModel = {
            reset: sinon.stub(),
            get: getStub
          };
          req.form.values = {};
          req.form.historicalValues = {};
          BaseController.prototype.getNextStep.returns('/next-page');
        });

        describe('when the condition config is met', () => {

          it('the next step is the fork target', () => {
            req.form.values['example-radio'] = 'superman';
            req.form.options.forks = [{
              target: '/target-page',
              condition: {
                field: 'example-radio',
                value: 'superman'
              }
            }];
            controller.getNextStep(req, {}).should.contain('/target-page');
          });
        });

        describe('when the condition config is met by a historical form', () => {
          it('the next step is the fork target', () => {
            req.form.historicalValues = {'example-radio': 'superman'};
            req.form.options.forks = [{
              target: '/target-page',
              condition: {
                field: 'example-radio',
                value: 'superman'
              }
            }];
            controller.getNextStep(req, {}).should.contain('/target-page');
          });
        });

        describe('when the condition config is not met', () => {
          it('the next step is the original next target', () => {
            req.form.values['example-radio'] = 'superman';
            req.form.options.forks = [{
              target: '/target-page',
              condition: {
                field: 'example-radio',
                value: 'lex luther'
              }
            }];
            controller.getNextStep(req, {}).should.equal('/next-page');
          });
        });

        describe('when the condition config is not met by a historical form', () => {
          it('the next step is the original next target', () => {
            req.form.historicalValues = {'example-radio': 'superman'};
            req.form.options.forks = [{
              target: '/target-page',
              condition: {
                field: 'example-radio',
                value: 'lex luther'
              }
            }];
            controller.getNextStep(req, {}).should.equal('/next-page');
          });
        });

        describe('when the condition config is not met and historical values are not present', () => {
          it('the next step is the original next target', () => {
            req.form.historicalValues = null;
            req.form.options.forks = [{
              target: '/target-page',
              condition: {
                field: 'example-radio',
                value: 'lex luther'
              }
            }];
            controller.getNextStep(req, {}).should.equal('/next-page');
          });
        });

        describe('when the condition is => met', () => {
          it('the next step is the fork target', () => {
            req.form.values['example-radio'] = 'superman';
            req.form.options.forks = [{
              target: '/target-page',
              condition(r) {
                return r.form.values['example-radio'] === 'superman';
              }
            }];
            controller.getNextStep(req, {}).should.contain('/target-page');
          });
        });

        describe('when the condition is => not met', () => {

          it('the next step is the origin next target', () => {
            req.form.values['example-radio'] = 'superman';
            req.form.options.forks = [{
              target: '/target-page',
              condition(r) {
                return r.form.values['example-radio'] === 'batman';
              }
            }];
            controller.getNextStep(req, {}).should.equal('/next-page');
          });
        });

        describe('when the action is "edit" and we\'ve been down the fork', () => {
          it('should return /confirm if baseUrl is not set', () => {
            getStub.returns(['/target-page']);
            req.form.values['example-radio'] = 'superman';
            req.form.options.forks = [{
              target: '/target-page',
              condition(r) {
                return r.form.values['example-radio'] === 'superman';
              }
            }];
            req.form.options.continueOnEdit = false;
            req.params.action = 'edit';
            controller.getNextStep(req).should.equal('/confirm');
          });

          it('should follow fork if fork has `continueOnEdit` set to true', () => {
            getStub.returns(['/target-page']);
            req.form.values['example-radio'] = 'superman';
            req.form.options.forks = [{
              target: '/target-page',
              continueOnEdit: true,
              condition(r) {
                return r.form.values['example-radio'] === 'superman';
              }
            }];
            req.form.options.continueOnEdit = false;
            req.params.action = 'edit';
            controller.getNextStep(req).should.equal('/target-page/edit');
          });

          it('should return /a-base-url/confirm if baseUrl is set', () => {
            getStub.returns(['/target-page']);
            req.form.values['example-radio'] = 'superman';
            req.form.options.forks = [{
              target: '/target-page',
              condition(r) {
                return r.form.values['example-radio'] === 'superman';
              }
            }];
            req.form.options.continueOnEdit = false;
            req.params.action = 'edit';
            req.baseUrl = '/a-base-url';
            controller.getNextStep(req).should.equal('/a-base-url/confirm');
          });

          it('should append "edit" to the path if baseUrl is set and continueOnEdit is false', () => {
            getStub.returns(['/target-page']);
            req.form.values['example-radio'] = 'superman';
            req.form.options.forks = [{
              target: '/target-page',
              condition(r) {
                return r.form.values['example-radio'] === 'superman';
              }
            }];
            req.form.options.continueOnEdit = true;
            req.params.action = 'edit';
            req.baseUrl = '/a-base-url';
            controller.getNextStep(req).should.equal('/a-base-url/target-page/edit');
          });
        });

        describe('when the action is "edit" but we\'ve not been down the fork', () => {
          it('appends "edit" to the path', () => {
            req.form.values['example-radio'] = 'superman';
            req.form.options.forks = [{
              target: '/target-page',
              condition(r) {
                return r.form.values['example-radio'] === 'superman';
              }
            }];
            req.form.options.continueOnEdit = false;
            req.params.action = 'edit';
            controller.getNextStep(req).should.contain('/target-page');
          });
        });

        describe('when the action is "edit" and we\'ve been down the standard path', () => {
          it('appends "edit" to the path', () => {
            getStub.returns(['/next-page']);
            req.form.values['example-radio'] = 'clark-kent';
            controller.options.forks = [{
              target: '/target-page',
              condition(r) {
                return r.form.values['example-radio'] === 'superman';
              }
            }];
            controller.options.continueOnEdit = false;
            req.params.action = 'edit';
            controller.getNextStep(req).should.contain('/confirm');
          });
        });

        describe('when the action is "edit" but we\'ve not been down the standard path', () => {
          it('appends "edit" to the path', () => {
            req.form.values['example-radio'] = 'clark-kent';
            controller.options.forks = [{
              target: '/target-page',
              condition(r) {
                return r.form.values['example-radio'] === 'superman';
              }
            }];
            controller.options.continueOnEdit = false;
            req.params.action = 'edit';
            controller.getNextStep(req).should.contain('/next-page');
          });
        });

      });

      describe('with more than one fork', () => {

        describe('when the fields are the same', () => {

          beforeEach(() => {
            req.form.values = {
              'example-radio': 'superman'
            };
            req.form.options.forks = [{
              target: '/superman-page',
              condition: {
                field: 'example-radio',
                value: 'superman'
              }
            }, {
              target: '/batman-page',
              condition: {
                field: 'example-radio',
                value: 'superman'
              }
            }];
          });

          describe('and each condition is met', () => {
            it('the last forks\' target becomes the next step', () => {
              controller.getNextStep(req, {}).should.contain('/batman-page');
            });
          });

        });

        describe('when the fields are different', () => {

          beforeEach(() => {
            req.form.options.forks = [{
              target: '/superman-page',
              condition: {
                field: 'example-radio',
                value: 'superman'
              }
            }, {
              target: '/smallville-page',
              condition: {
                field: 'example-email',
                value: 'clarke@smallville.com'
              }
            }];
          });

          describe('and each condition is met', () => {
            beforeEach(() => {
              req.form.values = {
                'example-radio': 'superman',
                'example-email': 'clarke@smallville.com'
              };
            });
            it('the last forks\' target becomes the next step', () => {
              controller.getNextStep(req, {}).should.contain('/smallville-page');
            });
          });

          describe('and the first condition is met', () => {
            beforeEach(() => {
              req.form.values = {
                'example-radio': 'superman',
                'example-email': 'kent@smallville.com'
              };
            });
            it('the first forks\' target becomes the next step', () => {
              controller.getNextStep(req, {}).should.contain('/superman-page');
            });
          });

        });
      });

    });

    describe('.getErrorStep()', () => {
      const req = {};
      const res = {};
      const err = {};

      beforeEach((done) => {
        sinon.stub(BaseController.prototype, 'getErrorStep').returns('/');
        req.params = {};
        controller = new Controller({template: 'foo'});
        controller._configure(req, res, done);
      });

      afterEach(() => {
        BaseController.prototype.getErrorStep.restore();
      });

      describe('when the action is "edit" and the parent redirect is not edit', () => {
        it('appends "edit" to the path', () => {
          req.params.action = 'edit';
          controller.getErrorStep(err, req).should.match(/\/edit$/);
        });

        it('doesn\'t append "edit" to the path if "edit" is already present', () => {
          req.params.action = 'edit';
          BaseController.prototype.getErrorStep.returns('/a-path/edit/id');
          controller.getErrorStep(err, req).should.not.match(/\/edit$/);
        });
      });

    });

    describe('getTitle()', () => {
      let lookup;
      let fields;
      beforeEach(() => {
        lookup = sinon.stub();
        fields = {
          'field-one': {}
        };
      });

      it('calls lookup with the correct list of keys', () => {
        const expected = [
          'pages.step-one.header',
          'fields.field-one.label',
          'fields.field-one.legend'
        ];
        controller.getTitle('step-one', lookup, fields);
        lookup.firstCall.args[0].should.be.deep.equal(expected);
      });

      it('passes the locals hash to lookup as second arg', () => {
        const locals = {};
        controller.getTitle('step-one', lookup, fields, locals);
        lookup.firstCall.args[1].should.be.equal(locals);
      });
    });

    describe('getIntro()', () => {
      let lookup;
      beforeEach(() => {
        lookup = sinon.stub();
      });

      it('calls lookup with the correct list of keys', () => {
        const expected = [
          'pages.step-one.intro'
        ];
        controller.getIntro('step-one', lookup);
        lookup.firstCall.args[0].should.be.deep.equal(expected);
      });

      it('passes locals too lookup as second arg', () => {
        const locals = {};
        controller.getIntro('step-one', lookup, locals);
        lookup.firstCall.args[1].should.be.equal(locals);
      });
    });

    describe('getErrors', () => {

      let req;
      let res;
      let errors;

      beforeEach(() => {

        errors = {
          key1: {
            key: 'key1',
            type: 'required'
          },
          key2: {
            key: 'key2',
            type: 'maxlength',
            arguments: [10]
          },
          key3: {
            key: 'key3',
            type: 'before',
            arguments: [3, 'years']
          }
        };

        req = request();
        req.form = {};
        res = response();
        sinon.stub(controller, 'getErrors').returns(errors);
        sinon.stub(controller, 'getErrorMessage', e => `error for ${e.key}`);
      });

      afterEach(() => {
        controller.getErrors.restore();
        controller.getErrorMessage.restore();
      });

      it('sets response from `getErrors` onto req.form.errors', (done) => {
        controller._getErrors(req, res, () => {
          req.form.errors.should.have.keys('key1', 'key2', 'key3');
          done();
        });
      });

      it('adds a message property onto each error', (done) => {
        controller._getErrors(req, res, () => {
          req.form.errors.should.have.keys('key1', 'key2', 'key3');

          req.form.errors.key1.should.have.a.property('message');
          controller.getErrorMessage.should.have.been.calledWith(errors.key1, req, res);
          req.form.errors.key1.message.should.equal('error for key1');

          req.form.errors.key2.should.have.a.property('message');
          controller.getErrorMessage.should.have.been.calledWith(errors.key2, req, res);
          req.form.errors.key2.message.should.equal('error for key2');

          req.form.errors.key3.should.have.a.property('message');
          controller.getErrorMessage.should.have.been.calledWith(errors.key3, req, res);
          req.form.errors.key3.message.should.equal('error for key3');
          done();
        });
      });

    });

    describe('getErrorLength', () => {
      let req;
      let res;

      beforeEach(() => {
        req = request();
        req.form = {};
        res = response();
      });

      it('returns `{single:true}` if only one error is present', () => {
        req.form.errors = {
          one: {
            key: 'one'
          }
        };
        controller.getErrorLength(req, res).should.eql({ single: true });
      });

      it('returns `{multiple:true}` if more than one error is present', () => {
        req.form.errors = {
          one: {
            key: 'one'
          },
          two: {
            key: 'two'
          }
        };
        controller.getErrorLength(req, res).should.eql({ multiple: true });
      });

      it('returns undefined if no errors are present', () => {
        expect(controller.getErrorLength(req, res)).to.equal(undefined);
      });

    });

    describe('getErrorMessage', () => {

      let req;
      let res;

      beforeEach(() => {
        req = request();
        res = response();
        req.translate = sinon.stub().returns('');
      });

      it('uses the current error object properties to translate the message', () => {
        req.translate.withArgs('validation.key.custom').returns('This is a custom message');
        const error = new ErrorClass('key', { type: 'custom' });
        controller.getErrorMessage(error, req, res).should.equal('This is a custom message');
      });

      it('uses default error message for field if no field and type specific message is defined', () => {
        req.translate.withArgs('validation.key.default').returns('Default field message');
        const error = new ErrorClass('key', { type: 'required' });
        controller.getErrorMessage(error, req, res).should.equal('Default field message');
      });

      it('uses default error message for validation type if no field level message is defined', () => {
        req.translate.withArgs('validation.required').returns('Default required message');
        const error = new ErrorClass('key', { type: 'required' });
        controller.getErrorMessage(error, req, res).should.equal('Default required message');
      });

      it('uses global default error message if no type of field level messages are defined', () => {
        req.translate.withArgs('validation.default').returns('Global default');
        const error = new ErrorClass('key', { type: 'required' });
        controller.getErrorMessage(error, req, res).should.equal('Global default');
      });

      it('populates messages with field label', () => {
        req.translate.withArgs('validation.key.required').returns('Your {{label}} is required');
        req.translate.withArgs('fields.key.label').returns('Field label');
        const error = new ErrorClass('key', { type: 'required' });
        controller.getErrorMessage(error, req, res).should.equal('Your field label is required');
      });

      it('populates messages with legend', () => {
        req.translate.withArgs('validation.key.required').returns('Your {{legend}} is required');
        req.translate.withArgs('fields.key.legend').returns('date');
        const error = new ErrorClass('key', { type: 'required' });
        controller.getErrorMessage(error, req, res).should.equal('Your date is required');
      });

      it('populates maxlength messages with the maximum length', () => {
        req.translate.withArgs('validation.key.maxlength').returns('This must be less than {{maxlength}} characters');
        const error = new ErrorClass('key', { type: 'maxlength', arguments: [10] });
        controller.getErrorMessage(error, req, res).should.equal('This must be less than 10 characters');
      });

      it('populates minlength messages with the minimum length', () => {
        req.translate.withArgs('validation.key.minlength').returns('This must be no more than {{minlength}} characters');
        const error = new ErrorClass('key', { type: 'minlength', arguments: [10] });
        controller.getErrorMessage(error, req, res).should.equal('This must be no more than 10 characters');
      });

      it('populates exactlength messages with the required length', () => {
        req.translate.withArgs('validation.key.exactlength').returns('This must be {{exactlength}} characters');
        const error = new ErrorClass('key', { type: 'exactlength', arguments: [10] });
        controller.getErrorMessage(error, req, res).should.equal('This must be 10 characters');
      });

      it('populates before messages with the required difference', () => {
        req.translate.withArgs('validation.key.before').returns('This must be more than {{diff}} ago');
        const error = new ErrorClass('key', { type: 'before', arguments: [5, 'days'] });
        controller.getErrorMessage(error, req, res).should.equal('This must be more than 5 days ago');
      });

      it('populates after messages with the required difference', () => {
        req.translate.withArgs('validation.key.after').returns('This must be less than {{diff}} ago');
        const error = new ErrorClass('key', { type: 'after', arguments: [5, 'days'] });
        controller.getErrorMessage(error, req, res).should.equal('This must be less than 5 days ago');
      });

      it('populates custom messages with the required constiable', () => {
        req.translate.withArgs('validation.key.custom').returns('This must be {{custom}}');
        const error = new ErrorClass('key', { type: 'custom', arguments: ['dynamic'] });
        controller.getErrorMessage(error, req, res).should.equal('This must be dynamic');
      });

      it('populates messages with values from `res.locals` when present', () => {
        req.translate.withArgs('validation.key.required').returns('This must be a {{something}}');
        res.locals.something = 'value';
        const error = new ErrorClass('key', { type: 'required' });
        controller.getErrorMessage(error, req, res).should.equal('This must be a value');
      });

    });

  });

});
