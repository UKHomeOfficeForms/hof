'use strict';

const path = require('path');
const mixins = require('../../frontend/template-mixins/mixins');
const _ = require('underscore');
const Hogan = require('hogan.js');
const fs = require('fs');
const reqres = require('reqres');

describe('Template Mixins', () => {
  let req;
  let res;
  let next;
  let render;
  let middleware;

  beforeEach(() => {
    req = reqres.req({
      translate: a => a
    });
    res = {
      locals: {
        options: {
          fields: {}
        }
      }
    };
    next = sinon.stub();
    middleware = mixins();
  });

  it('returns a middleware', () => {
    mixins().should.be.a('function');
    mixins().length.should.equal(3);
  });

  it('calls next', function (done) {
    mixins()(req, res, done);
  });

  describe('with stubbed Hogan', () => {
    beforeEach(() => {
      render = sinon.stub();
      sinon.stub(Hogan, 'compile').callsFake(function (text) {
        return {
          render: render.returns(text)
        };
      });
      middleware = mixins();
    });

    afterEach(() => {
      Hogan.compile.restore();
    });

    describe('input-text', () => {
      it('adds a function to res.locals', () => {
        middleware(req, res, next);
        res.locals['input-text'].should.be.a('function');
      });

      it('returns a function', () => {
        middleware(req, res, next);
        res.locals['input-text']().should.be.a('function');
      });

      it('looks up field label', () => {
        middleware(req, res, next);
        res.locals['input-text']().call(res.locals, 'field-name');
        render.should.have.been.calledWith(sinon.match({
          label: 'fields.field-name.label'
        }));
      });

      it('looks up default field label if nothing is set', () => {
        middleware(req, res, next);
        res.locals['input-text']().call(res.locals, 'field-name');
        render.should.have.been.calledWith(sinon.match({
          label: 'fields.field-name.label'
        }));
      });

      it('passes child from field config', () => {
        middleware(req, res, next);
        res.locals.options.fields = {
          'field-name': {
            child: 'a child'
          }
        };
        res.locals['input-text']().call(res.locals, 'field-name');
        render.should.have.been.calledWith(sinon.match({
          child: 'a child'
        }));
      });

      it('uses label when available for the field', () => {
        res.locals.options.fields = {
          'field-name': {
            label: 'Label text'
          }
        };
        middleware(req, res, next);
        res.locals['input-text']().call(res.locals, 'field-name');
        render.should.have.been.calledWith(sinon.match({
          label: 'Label text'
        }));
      });

      it('prefixes translation lookup with namespace if provided', () => {
        middleware = mixins({ sharedTranslationsKey: 'name.space' });
        middleware(req, res, next);
        res.locals['input-text']().call(res.locals, 'field-name');
        render.should.have.been.calledWith(sinon.match({
          label: 'name.space.fields.field-name.label'
        }));
      });

      it('should have an autocomplete setting if specified', () => {
        res.locals.options.fields = {
          'field-name': {
            autocomplete: 'custom'
          }
        };
        middleware(req, res, next);
        res.locals['input-text']().call(res.locals, 'field-name');
        render.should.have.been.calledWith(sinon.match({
          autocomplete: 'custom'
        }));
      });

      it('should default to no autocomplete attribute ', () => {
        middleware(req, res, next);
        res.locals['input-text']().call(res.locals, 'field-name');
        render.should.have.been.calledWith(sinon.match({
          autocomplete: sinon.match.undefined
        }));
      });

      it('should have classes if one or more were specified against the field', () => {
        res.locals.options.fields = {
          'field-name': {
            className: ['abc', 'def']
          }
        };
        middleware(req, res, next);
        res.locals['input-text']().call(res.locals, 'field-name');
        render.should.have.been.calledWith(sinon.match({
          className: 'abc def'
        }));
      });

      it('uses maxlength property set at a field level over default option', () => {
        res.locals.options.fields = {
          'field-name': {
            validate: [
              { type: 'maxlength', arguments: 10 }
            ]
          }
        };
        middleware(req, res, next);
        res.locals['input-phone']().call(res.locals, 'field-name');
        render.should.have.been.calledWith(sinon.match({
          maxlength: 10
        }));
      });

      it('uses locales translation property', () => {
        req.translate = sinon.stub().withArgs('field-name.label').returns('Field name');
        res.locals.options.fields = {
          'field-name': {
            label: 'field-name.label'
          }
        };
        middleware(req, res, next);
        res.locals['input-phone']().call(res.locals, 'field-name');
        render.should.have.been.calledWith(sinon.match({
          label: 'Field name'
        }));
      });

      it('includes a hint if it is defined in the locales', () => {
        req.translate = sinon.stub().withArgs('field-name.hint').returns('Field hint');
        res.locals.options.fields = {
          'field-name': {
          }
        };
        middleware(req, res, next);
        res.locals['input-text']().call(res.locals, 'field-name');
        render.should.have.been.calledWith(sinon.match({
          hint: 'Field hint'
        }));
      });

      it('includes a hint if it is defined in translation', () => {
        req.translate = sinon.stub().withArgs('field-name.hint').returns('Field hint');
        res.locals.options.fields = {
          'field-name': {
            hint: 'field-name.hint'
          }
        };
        middleware(req, res, next);
        res.locals['input-text']().call(res.locals, 'field-name');
        render.should.have.been.calledWith(sinon.match({
          hint: 'Field hint'
        }));
      });

      it('does not include a hint if it is not defined in translation', () => {
        req.translate = sinon.stub().withArgs('field-name.hint').returns(null);
        res.locals.options.fields = {
          'field-name': {
            hint: 'field-name.hint'
          }
        };
        middleware(req, res, next);
        res.locals['input-text']().call(res.locals, 'field-name');
        render.should.have.been.calledWith(sinon.match({
          hint: null
        }));
      });

      it('sets `labelClassName` to "form-label" by default', () => {
        middleware(req, res, next);
        res.locals['input-text']().call(res.locals, 'field-name');
        render.should.have.been.calledWith(sinon.match({
          labelClassName: 'form-label'
        }));
      });

      it('overrides `labelClassName` when set in field options', () => {
        res.locals.options.fields = {
          'field-name': {
            labelClassName: 'visuallyhidden'
          }
        };
        middleware(req, res, next);
        res.locals['input-text']().call(res.locals, 'field-name');
        render.should.have.been.calledWith(sinon.match({
          labelClassName: 'visuallyhidden'
        }));
      });

      it('sets all classes of `labelClassName` option', () => {
        res.locals.options.fields = {
          'field-name': {
            labelClassName: ['abc', 'def']
          }
        };
        middleware(req, res, next);
        res.locals['input-text']().call(res.locals, 'field-name');
        render.should.have.been.calledWith(sinon.match({
          labelClassName: 'abc def'
        }));
      });

      it('sets `formGroupClassName` to "form-group" by default', () => {
        middleware(req, res, next);
        res.locals['input-text']().call(res.locals, 'field-name');
        render.should.have.been.calledWith(sinon.match({
          formGroupClassName: 'form-group'
        }));
      });

      it('overrides `formGroupClassName` when set in field options', () => {
        res.locals.options.fields = {
          'field-name': {
            formGroupClassName: 'visuallyhidden'
          }
        };
        middleware(req, res, next);
        res.locals['input-text']().call(res.locals, 'field-name');
        render.should.have.been.calledWith(sinon.match({
          formGroupClassName: 'visuallyhidden'
        }));
      });

      it('sets all classes of `formGroupClassName` option', () => {
        res.locals.options.fields = {
          'field-name': {
            formGroupClassName: ['abc', 'def']
          }
        };
        middleware(req, res, next);
        res.locals['input-text']().call(res.locals, 'field-name');
        render.should.have.been.calledWith(sinon.match({
          formGroupClassName: 'abc def'
        }));
      });

      it('sets additional element attributes', () => {
        res.locals.options.fields = {
          'field-name': {
            attributes: [
              { attribute: 'autocomplete', value: 'true' }
            ]
          }
        };
        middleware(req, res, next);
        res.locals['input-text']().call(res.locals, 'field-name');
        render.should.have.been.calledWith(sinon.match({
          attributes: [
            { attribute: 'autocomplete', value: 'true' }
          ]
        }));
      });

      it('allows configuration of a non-required input with a visuallyhidden label', () => {
        res.locals.options.fields = {
          'field-name': {
            required: false,
            labelClassName: 'visuallyhidden'
          }
        };
        middleware(req, res, next);
        res.locals['input-text']().call(res.locals, 'field-name');
        render.should.have.been.calledWith(sinon.match({
          required: false,
          labelClassName: 'visuallyhidden'
        }));
      });

      it('by default, assumes the field isn\'t required', () => {
        res.locals.options.fields = {
          'field-name': {}
        };
        middleware(req, res, next);
        res.locals['input-text']().call(res.locals, 'field-name');
        render.should.have.been.calledWith(sinon.match({
          required: false
        }));
      });

      it('allows configuration of required status with the required property', () => {
        res.locals.options.fields = {
          'field-name': {
            required: true
          }
        };
        middleware(req, res, next);
        res.locals['input-text']().call(res.locals, 'field-name');
        render.should.have.been.calledWith(sinon.match({
          required: true
        }));
      });

      it('allows configuration of required status with the required validator', () => {
        res.locals.options.fields = {
          'field-name': {
            validate: ['required']
          }
        };
        middleware(req, res, next);
        res.locals['input-text']().call(res.locals, 'field-name');
        render.should.have.been.calledWith(sinon.match({
          required: true
        }));
      });

      it('the required property takes precedence over the required validator', () => {
        res.locals.options.fields = {
          'field-name': {
            required: false,
            validate: ['required']
          }
        };
        middleware(req, res, next);
        res.locals['input-text']().call(res.locals, 'field-name');
        render.should.have.been.calledWith(sinon.match({
          required: false
        }));
      });
    });

    describe('input-date', () => {
      it('adds a function to res.locals', () => {
        middleware(req, res, next);
        res.locals['input-date'].should.be.a('function');
      });

      it('returns a function', () => {
        middleware(req, res, next);
        res.locals['input-date']().should.be.a('function');
      });

      it('renders 7 times if the field is not marked as inexact', () => {
        middleware(req, res, next);
        res.locals['input-date']().call(res.locals, 'field-name');
        render.callCount.should.be.equal(7);
      });

      it('renders 5 times if the field is marked as inexact', () => {
        res.locals.options.fields = {
          'field-name': {
            inexact: true
          }
        };
        middleware(req, res, next);
        res.locals['input-date']().call(res.locals, 'field-name');
        render.callCount.should.be.equal(5);
      });

      it('looks up field label', () => {
        middleware(req, res, next);
        res.locals['input-date']().call(res.locals, 'field-name');

        render.called;

        const dayCall = render.getCall(2);
        const monthCall = render.getCall(4);
        const yearCall = render.getCall(6);

        dayCall.should.have.been.calledWith(sinon.match({
          label: 'fields.field-name-day.label'
        }));

        monthCall.should.have.been.calledWith(sinon.match({
          label: 'fields.field-name-month.label'
        }));

        yearCall.should.have.been.calledWith(sinon.match({
          label: 'fields.field-name-year.label'
        }));
      });

      it('form-group-year class is set to the year field by default', () => {
        middleware(req, res, next);
        res.locals['input-date']().call(res.locals, 'field-name');

        render.called;

        const dayCall = render.getCall(2);
        const monthCall = render.getCall(4);
        const yearCall = render.getCall(6);

        dayCall.should.not.have.been.calledWith(sinon.match({
          formGroupClassName: 'form-group-year'
        }));

        monthCall.should.not.have.been.calledWith(sinon.match({
          formGroupClassName: 'form-group-year'
        }));

        yearCall.should.have.been.calledWith(sinon.match({
          formGroupClassName: 'form-group-year'
        }));
      });

      describe('autocomplete', () => {
        it('should have a suffix of -day -month and -year', () => {
          res.locals.options.fields = {
            'field-name': {
              autocomplete: 'bday'
            }
          };
          middleware(req, res, next);
          res.locals['input-date']().call(res.locals, 'field-name');

          render.should.have.been.called;

          const dayCall = render.getCall(2);
          const monthCall = render.getCall(4);
          const yearCall = render.getCall(6);

          dayCall.should.have.been.calledWith(sinon.match({
            autocomplete: 'bday-day'
          }));

          monthCall.should.have.been.calledWith(sinon.match({
            autocomplete: 'bday-month'
          }));

          yearCall.should.have.been.calledWith(sinon.match({
            autocomplete: 'bday-year'
          }));
        });

        it('should be set as exact values if an object is given', () => {
          res.locals.options.fields = {
            'field-name': {
              autocomplete: {
                day: 'day-type',
                month: 'month-type',
                year: 'year-type'
              }
            }
          };
          middleware(req, res, next);
          res.locals['input-date']().call(res.locals, 'field-name');

          render.called;

          const dayCall = render.getCall(2);
          const monthCall = render.getCall(4);
          const yearCall = render.getCall(6);

          dayCall.should.have.been.calledWith(sinon.match({
            autocomplete: 'day-type'
          }));

          monthCall.should.have.been.calledWith(sinon.match({
            autocomplete: 'month-type'
          }));

          yearCall.should.have.been.calledWith(sinon.match({
            autocomplete: 'year-type'
          }));
        });

        it('should set autocomplete to off if off is specified', () => {
          res.locals.options.fields = {
            'field-name': {
              autocomplete: 'off'
            }
          };
          middleware(req, res, next);
          res.locals['input-date']().call(res.locals, 'field-name');

          render.called;

          const dayCall = render.getCall(2);
          const monthCall = render.getCall(4);
          const yearCall = render.getCall(6);

          dayCall.should.have.been.calledWith(sinon.match({
            autocomplete: 'off'
          }));

          monthCall.should.have.been.calledWith(sinon.match({
            autocomplete: 'off'
          }));

          yearCall.should.have.been.calledWith(sinon.match({
            autocomplete: 'off'
          }));
        });

        it('should default to no attribute across all date fields', () => {
          middleware(req, res, next);
          res.locals['input-date']().call(res.locals, 'field-name');

          render.called;

          const dayCall = render.getCall(0);
          const monthCall = render.getCall(1);
          const yearCall = render.getCall(2);

          dayCall.should.have.been.calledWith(sinon.match({
            autocomplete: undefined
          }));

          monthCall.should.have.been.calledWith(sinon.match({
            autocomplete: undefined
          }));

          yearCall.should.have.been.calledWith(sinon.match({
            autocomplete: undefined
          }));
        });
      });

      it('prefixes translation lookup with namespace if provided', () => {
        middleware = mixins({ sharedTranslationsKey: 'name.space' });
        middleware(req, res, next);
        res.locals['input-date']().call(res.locals, 'field-name');

        render.called;

        const dayCall = render.getCall(2);
        const monthCall = render.getCall(4);
        const yearCall = render.getCall(6);

        dayCall.should.have.been.calledWith(sinon.match({
          label: 'name.space.fields.field-name-day.label'
        }));

        monthCall.should.have.been.calledWith(sinon.match({
          label: 'name.space.fields.field-name-month.label'
        }));

        yearCall.should.have.been.calledWith(sinon.match({
          label: 'name.space.fields.field-name-year.label'
        }));
      });

      it('sets a date boolean to conditionally show input errors', () => {
        middleware(req, res, next);
        res.locals['input-date']().call(res.locals, 'field-name');

        render.getCall(2).should.have.been.calledWith(sinon.match({
          date: true
        }));
        render.getCall(4).should.have.been.calledWith(sinon.match({
          date: true
        }));
        render.getCall(6).should.have.been.calledWith(sinon.match({
          date: true
        }));
      });
    });

    describe('input-number', () => {
      it('adds a function to res.locals', () => {
        middleware(req, res, next);
        res.locals['input-number'].should.be.a('function');
      });

      it('returns a function', () => {
        middleware(req, res, next);
        res.locals['input-number']().should.be.a('function');
      });

      it('adds a pattern attribute to trigger the number keypad on mobile devices', () => {
        middleware(req, res, next);
        res.locals['input-number']().call(res.locals, 'field-name');
        render.should.have.been.calledWith(sinon.match({
          pattern: '[0-9]*'
        }));
      });
    });

    describe('input-submit', () => {
      it('adds a function to res.locals', () => {
        middleware(req, res, next);
        res.locals['input-submit'].should.be.a('function');
      });

      it('returns a function', () => {
        middleware(req, res, next);
        res.locals['input-submit']().should.be.a('function');
      });

      it('looks up button value with default key of "next"', () => {
        middleware(req, res, next);
        res.locals['input-submit']().call(res.locals);
        render.should.have.been.calledWith(sinon.match({
          value: 'buttons.next'
        }));
      });

      it('looks up button value with key if provided', () => {
        middleware(req, res, next);
        res.locals['input-submit']().call(res.locals, 'button-id');
        render.should.have.been.calledWith(sinon.match({
          value: 'buttons.button-id'
        }));
      });

      it('prefixes translation lookup with namespace if provided', () => {
        middleware = mixins({ sharedTranslationsKey: 'name.space' });
        middleware(req, res, next);
        res.locals['input-submit']().call(res.locals, 'button-id');
        render.should.have.been.calledWith(sinon.match({
          value: 'name.space.buttons.button-id'
        }));
      });
    });

    describe('textarea', () => {
      it('adds a function to res.locals', () => {
        middleware(req, res, next);
        res.locals.textarea.should.be.a('function');
      });

      it('returns a function', () => {
        middleware(req, res, next);
        res.locals.textarea().should.be.a('function');
      });

      it('looks up field label', () => {
        middleware(req, res, next);
        res.locals.textarea().call(res.locals, 'field-name');
        render.should.have.been.calledWith(sinon.match({
          label: 'fields.field-name.label'
        }));
      });

      it('prefixes translation lookup with namespace if provided', () => {
        middleware = mixins({ sharedTranslationsKey: 'name.space' });
        middleware(req, res, next);
        res.locals.textarea().call(res.locals, 'field-name');
        render.should.have.been.calledWith(sinon.match({
          label: 'name.space.fields.field-name.label'
        }));
      });

      it('should have classes if one or more were specified against the field', () => {
        res.locals.options.fields = {
          'field-name': {
            className: ['abc', 'def']
          }
        };
        middleware(req, res, next);
        res.locals.textarea().call(res.locals, 'field-name');
        render.should.have.been.calledWith(sinon.match({
          className: 'abc def'
        }));
      });

      it('uses maxlength property set at a field level over default option', () => {
        res.locals.options.fields = {
          'field-name': {
            validate: [
              { type: 'maxlength', arguments: 10 }
            ]
          }
        };
        middleware(req, res, next);
        res.locals.textarea().call(res.locals, 'field-name');
        render.should.have.been.calledWith(sinon.match({
          maxlength: 10
        }));
      });

      it('uses locales translation property', () => {
        req.translate = sinon.stub().withArgs('field-name.label').returns('Field name');
        res.locals.options.fields = {
          'field-name': {
            label: 'field-name.label'
          }
        };
        middleware(req, res, next);
        res.locals.textarea().call(res.locals, 'field-name');
        render.should.have.been.calledWith(sinon.match({
          label: 'Field name'
        }));
      });

      it('sets `labelClassName` to "form-label" by default', () => {
        res.locals.options.fields = {
          'field-name': {}
        };
        middleware(req, res, next);
        res.locals.textarea().call(res.locals, 'field-name');
        render.should.have.been.calledWith(sinon.match({
          labelClassName: 'form-label'
        }));
      });

      it('overrides `labelClassName` when set in field options', () => {
        res.locals.options.fields = {
          'field-name': {
            labelClassName: 'visuallyhidden'
          }
        };
        middleware(req, res, next);
        res.locals.textarea().call(res.locals, 'field-name');
        render.should.have.been.calledWith(sinon.match({
          labelClassName: 'visuallyhidden'
        }));
      });

      it('sets all classes of `labelClassName` option', () => {
        res.locals.options.fields = {
          'field-name': {
            labelClassName: ['abc', 'def']
          }
        };
        middleware(req, res, next);
        res.locals.textarea().call(res.locals, 'field-name');
        render.should.have.been.calledWith(sinon.match({
          labelClassName: 'abc def'
        }));
      });

      it('sets additional element attributes', () => {
        res.locals.options.fields = {
          'field-name': {
            attributes: [
              { attribute: 'spellcheck', value: 'true' },
              { attribute: 'autocapitalize', value: 'sentences' }
            ]
          }
        };
        middleware(req, res, next);
        res.locals.textarea().call(res.locals, 'field-name');
        render.should.have.been.calledWith(sinon.match({
          attributes: [
            { attribute: 'spellcheck', value: 'true' },
            { attribute: 'autocapitalize', value: 'sentences' }
          ]
        }));
      });
    });

    describe('checkbox', () => {
      beforeEach(() => {
      });

      it('adds a function to res.locals', () => {
        middleware(req, res, next);
        res.locals.checkbox.should.be.a('function');
      });

      it('returns a function', () => {
        middleware(req, res, next);
        res.locals.checkbox().should.be.a('function');
      });

      it('looks up field label', () => {
        middleware(req, res, next);
        res.locals.checkbox().call(res.locals, 'field-name');
        render.should.have.been.calledWith(sinon.match({
          label: 'fields.field-name.label'
        }));
      });

      it('prefixes translation lookup with namespace if provided', () => {
        middleware = mixins({ sharedTranslationsKey: 'name.space' });
        middleware(req, res, next);
        res.locals.checkbox().call(res.locals, 'field-name');
        render.should.have.been.calledWith(sinon.match({
          label: 'name.space.fields.field-name.label'
        }));
      });

      it('uses locales translation property', () => {
        req.translate = sinon.stub().withArgs('field-name.label').returns('Field name');
        res.locals.options.fields = {
          'field-name': {
            label: 'field-name.label'
          }
        };
        middleware(req, res, next);
        res.locals.checkbox().call(res.locals, 'field-name');
        render.should.have.been.calledWith(sinon.match({
          label: 'Field name'
        }));
      });

      it('should default className `block-label`', () => {
        middleware(req, res, next);
        res.locals.checkbox().call(res.locals, 'field-name');
        render.should.have.been.calledWith(sinon.match({
          className: 'block-label'
        }));
      });

      it('should override default className if one was specified against the field', () => {
        res.locals.options.fields = {
          'field-name': {
            className: 'overwritten'
          }
        };
        middleware(req, res, next);
        res.locals.checkbox().call(res.locals, 'field-name');
        render.should.have.been.calledWith(sinon.match({
          className: 'overwritten'
        }));
      });
    });

    describe('radio-group', () => {
      beforeEach(() => {
      });

      it('adds a function to res.locals', () => {
        middleware(req, res, next);
        res.locals['radio-group'].should.be.a('function');
      });

      it('returns a function', () => {
        middleware(req, res, next);
        res.locals['radio-group']().should.be.a('function');
      });

      it('looks up field options', () => {
        res.locals.options.fields = {
          'field-name': {
            options: [{
              label: 'Foo',
              value: 'foo'
            }]
          }
        };
        middleware(req, res, next);
        res.locals['radio-group']().call(res.locals, 'field-name');
        render.lastCall.should.have.been.calledWith(sinon.match(function (value) {
          const obj = value.options[0];
          return _.isMatch(obj, {
            label: 'Foo',
            value: 'foo',
            type: 'radio',
            selected: false,
            toggle: undefined
          });
        }));
      });

      it('looks up field label from fields.field-name.options.foo.label if not specified', () => {
        res.locals.options.fields = {
          'field-name': {
            options: ['foo', 'bar']
          }
        };
        middleware(req, res, next);
        res.locals['radio-group']().call(res.locals, 'field-name');
        render.lastCall.args[0].options[0].label.should.be.equal('fields.field-name.options.foo.label');
        render.lastCall.args[0].options[1].label.should.be.equal('fields.field-name.options.bar.label');
      });

      it('looks up field label from fields.field-name.options.foo.label if not specified (object options)', () => {
        res.locals.options.fields = {
          'field-name': {
            options: [{
              value: 'foo'
            }, {
              value: 'bar'
            }]
          }
        };
        middleware(req, res, next);
        res.locals['radio-group']().call(res.locals, 'field-name');
        render.lastCall.args[0].options[0].label.should.be.equal('fields.field-name.options.foo.label');
        render.lastCall.args[0].options[1].label.should.be.equal('fields.field-name.options.bar.label');
      });

      it('should have classes if one or more were specified against the field', () => {
        res.locals.options.fields = {
          'field-name': {
            className: ['abc', 'def']
          }
        };
        middleware(req, res, next);
        res.locals['radio-group']().call(res.locals, 'field-name');
        render.should.have.been.calledWith(sinon.match({
          className: 'abc def'
        }));
      });

      it('should have role: radiogroup', () => {
        res.locals.options.fields = {
          'field-name': {
          }
        };
        middleware(req, res, next);
        res.locals['radio-group']().call(res.locals, 'field-name');
        render.should.have.been.calledWith(sinon.match({
          role: 'radiogroup'
        }));
      });

      it('adds `legendClassName` if it exists as a string or an array', () => {
        res.locals.options.fields = {
          'field-name-1': {
            legend: {
              className: 'abc def'
            }
          },
          'field-name-2': {
            legend: {
              className: ['abc', 'def']
            }
          }
        };

        middleware(req, res, next);

        res.locals['radio-group']().call(res.locals, 'field-name-1');
        render.should.have.been.calledWith(sinon.match({
          legendClassName: 'abc def'
        }));

        res.locals['radio-group']().call(res.locals, 'field-name-2');
        render.should.have.been.calledWith(sinon.match({
          legendClassName: 'abc def'
        }));
      });

      it('uses locales translation for legend if a field value isn\'t provided', () => {
        req.translate = sinon.stub().withArgs('fields.field-name.legend').returns('Field legend');
        res.locals.options.fields = {
          'field-name': {}
        };
        middleware(req, res, next);
        res.locals['radio-group']().call(res.locals, 'field-name');
        render.should.have.been.calledWithExactly(sinon.match({
          legend: 'Field legend'
        }));
      });

      it('uses locales translation for hint if a field value isn\'t provided', () => {
        req.translate = sinon.stub().withArgs('fields.field-name.hint').returns('Field hint');
        res.locals.options.fields = {
          'field-name': {}
        };
        middleware(req, res, next);
        res.locals['radio-group']().call(res.locals, 'field-name');
        render.should.have.been.calledWithExactly(sinon.match({
          hint: 'Field hint'
        }));
      });

      it('doesn\'t add a hint if the hint doesn\'t exist in locales', () => {
        res.locals.options.fields = {
          'field-name': {}
        };
        middleware(req, res, next);
        res.locals['radio-group']().call(res.locals, 'field-name');
        render.should.have.been.calledWithExactly(sinon.match({
          hint: null
        }));
      });
    });

    describe('checkbox-group', () => {
      beforeEach(() => {
      });

      it('adds a function to res.locals', () => {
        middleware(req, res, next);
        res.locals['checkbox-group'].should.be.a('function');
      });

      it('returns a function', () => {
        middleware(req, res, next);
        res.locals['checkbox-group']().should.be.a('function');
      });

      it('looks up field options', () => {
        res.locals.options.fields = {
          'field-name': {
            options: [{
              label: 'Foo',
              value: 'foo'
            }, {
              label: 'Bar',
              value: 'bar'
            }, {
              label: 'Baz',
              hint: 'baz hint',
              value: 'baz'
            }]
          }
        };
        middleware(req, res, next);
        res.locals['checkbox-group']().call(res.locals, 'field-name');
        render.should.have.been.calledWith(sinon.match(function (value) {
          const options = [{
            label: 'Foo',
            value: 'foo',
            type: 'checkbox',
            selected: false,
            toggle: undefined
          }, {
            label: 'Bar',
            value: 'bar',
            type: 'checkbox',
            selected: false,
            toggle: undefined
          }, {
            label: 'Baz',
            value: 'baz',
            hint: 'baz hint',
            type: 'checkbox',
            selected: false,
            toggle: undefined
          }];
          return _.every(value.options, function (option, index) {
            return _.isMatch(option, options[index]);
          });
        }));
      });

      it('should have classes if one or more were specified against the field', () => {
        res.locals.options.fields = {
          'field-name': {
            className: ['abc', 'def']
          }
        };
        middleware(req, res, next);
        res.locals['checkbox-group']().call(res.locals, 'field-name');
        render.should.have.been.calledWith(sinon.match({
          className: 'abc def'
        }));
      });

      it('should have role: group', () => {
        res.locals.options.fields = {
          'field-name': {
          }
        };
        middleware(req, res, next);
        res.locals['checkbox-group']().call(res.locals, 'field-name');
        render.should.have.been.calledWith(sinon.match({
          role: 'group'
        }));
      });

      it('adds `legendClassName` if it exists as a string or an array', () => {
        res.locals.options.fields = {
          'field-name-1': {
            legend: {
              className: 'abc def'
            }
          },
          'field-name-2': {
            legend: {
              className: ['abc', 'def']
            }
          }
        };

        middleware(req, res, next);

        res.locals['checkbox-group']().call(res.locals, 'field-name-1');
        render.should.have.been.calledWith(sinon.match({
          legendClassName: 'abc def'
        }));

        res.locals['checkbox-group']().call(res.locals, 'field-name-2');
        render.should.have.been.calledWith(sinon.match({
          legendClassName: 'abc def'
        }));
      });

      it('uses locales translation for legend if a field value isn\'t provided', () => {
        req.translate = sinon.stub().withArgs('fields.field-name.legend').returns('Field legend');
        res.locals.options.fields = {
          'field-name': {}
        };
        middleware(req, res, next);
        res.locals['checkbox-group']().call(res.locals, 'field-name');
        render.should.have.been.calledWithExactly(sinon.match({
          legend: 'Field legend'
        }));
      });

      it('uses locales translation for hint if a field value isn\'t provided', () => {
        req.translate = sinon.stub().withArgs('fields.field-name.hint').returns('Field hint');
        res.locals.options.fields = {
          'field-name': {}
        };
        middleware(req, res, next);
        res.locals['checkbox-group']().call(res.locals, 'field-name');
        render.should.have.been.calledWithExactly(sinon.match({
          hint: 'Field hint'
        }));
      });

      it('doesn\'t add a hint if the hint doesn\'t exist in locales', () => {
        res.locals.options.fields = {
          'field-name': {}
        };
        middleware(req, res, next);
        res.locals['checkbox-group']().call(res.locals, 'field-name');
        render.should.have.been.calledWithExactly(sinon.match({
          hint: null
        }));
      });

      describe('multiple options selected', () => {
        beforeEach(() => {
          res.locals.options.fields = {
            'field-name': {
              options: [{
                label: 'Foo',
                value: 'foo'
              }, {
                label: 'Bar',
                value: 'bar'
              }, {
                label: 'Baz',
                value: 'baz'
              }]
            }
          };
        });

        it('marks foo and bar as selected', () => {
          res.locals.values = {
            'field-name': ['foo', 'bar']
          };
          middleware(req, res, next);
          res.locals['checkbox-group']().call(res.locals, 'field-name');
          const options = render.lastCall.args[0].options;
          _.pluck(options.filter(function (option) {
            return option.selected;
          }), 'value').should.be.eql(['foo', 'bar']);
        });

        it('marks foo, bar and baz as selected', () => {
          res.locals.values = {
            'field-name': ['foo', 'bar', 'baz']
          };
          middleware(req, res, next);
          res.locals['checkbox-group']().call(res.locals, 'field-name');
          const options = render.lastCall.args[0].options;
          _.pluck(options.filter(function (option) {
            return option.selected;
          }), 'value').should.be.eql(['foo', 'bar', 'baz']);
        });

        it('marks foo and baz as selected', () => {
          res.locals.values = {
            'field-name': ['foo', 'baz']
          };
          middleware(req, res, next);
          res.locals['checkbox-group']().call(res.locals, 'field-name');
          const options = render.lastCall.args[0].options;
          _.pluck(options.filter(function (option) {
            return option.selected;
          }), 'value').should.be.eql(['foo', 'baz']);
        });

        it('marks bar as selected', () => {
          res.locals.values = {
            'field-name': ['bar']
          };
          middleware(req, res, next);
          res.locals['checkbox-group']().call(res.locals, 'field-name');
          const options = render.lastCall.args[0].options;
          _.pluck(options.filter(function (option) {
            return option.selected;
          }), 'value').should.be.eql(['bar']);
        });
      });
    });

    describe('select', () => {
      beforeEach(() => {
      });

      it('adds a function to res.locals', () => {
        middleware(req, res, next);
        res.locals.select.should.be.a('function');
      });

      it('returns a function', () => {
        middleware(req, res, next);
        res.locals.select().should.be.a('function');
      });

      it('defaults `labelClassName` to "form-label"', () => {
        res.locals.options.fields = {
          'field-name': {}
        };
        middleware(req, res, next);
        res.locals.select().call(res.locals, 'field-name');
        render.should.have.been.calledWith(sinon.match({
          labelClassName: 'form-label'
        }));
      });

      it('overrides `labelClassName` when set in field options', () => {
        res.locals.options.fields = {
          'field-name': {
            labelClassName: 'visuallyhidden'
          }
        };
        middleware(req, res, next);
        res.locals.select().call(res.locals, 'field-name');
        render.should.have.been.calledWith(sinon.match({
          labelClassName: 'visuallyhidden'
        }));
      });

      it('sets all classes of `labelClassName` option', () => {
        res.locals.options.fields = {
          'field-name': {
            labelClassName: ['abc', 'def']
          }
        };
        middleware(req, res, next);
        res.locals.select().call(res.locals, 'field-name');
        render.should.have.been.calledWith(sinon.match({
          labelClassName: 'abc def'
        }));
      });

      it('includes a hint if it is defined in the locales', () => {
        req.translate = sinon.stub().withArgs('field-name.hint').returns('Field hint');
        res.locals.options.fields = {
          'field-name': {
          }
        };
        middleware(req, res, next);
        res.locals.select().call(res.locals, 'field-name');
        render.should.have.been.calledWith(sinon.match({
          hint: 'Field hint'
        }));
      });

      it('includes a hint if it is defined in translation', () => {
        req.translate = sinon.stub().withArgs('field-name.hint').returns('Field hint');
        res.locals.options.fields = {
          'field-name': {
            hint: 'field-name.hint'
          }
        };
        middleware(req, res, next);
        res.locals.select().call(res.locals, 'field-name');
        render.should.have.been.calledWith(sinon.match({
          hint: 'Field hint'
        }));
      });

      it('does not include a hint if it is not defined in translation', () => {
        req.translate = sinon.stub().withArgs('field-name.hint').returns(null);
        res.locals.options.fields = {
          'field-name': {
            hint: 'field-name.hint'
          }
        };
        middleware(req, res, next);
        res.locals.select().call(res.locals, 'field-name');
        render.should.have.been.calledWith(sinon.match({
          hint: null
        }));
      });

      it('sets labels to an empty string for translations that are returned as `undefined`', () => {
        req.translate = sinon.stub().returns(undefined);
        res.locals.options.fields = {
          'field-name': {
            options: [
              ''
            ]
          }
        };
        middleware(req, res, next);
        res.locals.select().call(res.locals, 'field-name');
        render.lastCall.should.have.been.calledWith(sinon.match(function (value) {
          const obj = value.options[0];
          return _.isMatch(obj, {
            label: '',
            selected: false,
            toggle: undefined,
            value: ''
          });
        }));
      });
    });
  });

  describe('without stubbed Hogan', () => {
    it('looks up variables within the field key', () => {
      res.locals.foo = 'bar';
      res.locals.options.fields = {
        'bar-field-name': {}
      };
      middleware(req, res, next);
      res.locals['input-text']().call(res.locals, '{{foo}}-field-name').should.contain('id="bar-field-name"');
    });

    describe('date', () => {
      beforeEach(() => {
        middleware(req, res, next);
      });

      it('adds a function to res.locals', () => {
        res.locals.date.should.be.a('function');
      });

      it('returns a function', () => {
        res.locals.date().should.be.a('function');
      });

      it('formats a date', () => {
        res.locals.date().call(res.locals, '2015-03-26').should.equal('26 March 2015');
      });

      it('applys a date format if specified', () => {
        res.locals.date().call(res.locals, '2015-03|MMMM YYYY').should.equal('March 2015');
      });
    });

    describe('time', () => {
      beforeEach(() => {
        middleware(req, res, next);
      });

      it('adds a function to res.locals', () => {
        res.locals.time.should.be.a('function');
      });

      it('returns a function', () => {
        res.locals.time().should.be.a('function');
      });

      it('changes 12:00am to midnight', () => {
        res.locals.time().call(res.locals, '26 March 2015 12:00am').should.equal('26 March 2015 midnight');
      });

      it('changes 12:00pm to midday', () => {
        res.locals.time().call(res.locals, '26 March 2015 12:00pm').should.equal('26 March 2015 midday');
      });

      it('changes leading 12:00am to Midnight', () => {
        res.locals.time().call(res.locals, '12:00am 26 March 2015').should.equal('Midnight 26 March 2015');
      });

      it('changes leading 12:00pm to Midday', () => {
        res.locals.time().call(res.locals, '12:00pm 26 March 2015').should.equal('Midday 26 March 2015');
      });

      it('should pass through other times', () => {
        res.locals.time().call(res.locals, '6:30am 26 March 2015').should.equal('6:30am 26 March 2015');
      });
    });

    describe('uppercase', () => {
      beforeEach(() => {
        middleware(req, res, next);
      });

      it('adds a function to res.locals', () => {
        res.locals.uppercase.should.be.a('function');
      });

      it('returns a function', () => {
        res.locals.uppercase().should.be.a('function');
      });

      it('changes text to uppercase', () => {
        res.locals.uppercase().call(res.locals, 'abcdEFG').should.equal('ABCDEFG');
      });

      it('returns an empty string if no text given', () => {
        res.locals.uppercase().call(res.locals).should.equal('');
      });
    });

    describe('lowercase', () => {
      beforeEach(() => {
        middleware(req, res, next);
      });

      it('adds a function to res.locals', () => {
        res.locals.lowercase.should.be.a('function');
      });

      it('returns a function', () => {
        res.locals.lowercase().should.be.a('function');
      });

      it('changes text to lowercase', () => {
        res.locals.lowercase().call(res.locals, 'abcdEFG').should.equal('abcdefg');
      });

      it('returns an empty string if no text given', () => {
        res.locals.lowercase().call(res.locals).should.equal('');
      });
    });

    describe('currency', () => {
      beforeEach(() => {
        middleware(req, res, next);
      });

      it('adds a function to res.locals', () => {
        res.locals.currency.should.be.a('function');
      });

      it('returns a function', () => {
        res.locals.currency().should.be.a('function');
      });

      it('formats whole numbers with no decimal places', () => {
        res.locals.currency().call(res.locals, '3.00').should.equal('£3');
      });

      it('formats 3.50 to two decimal places', () => {
        res.locals.currency().call(res.locals, '3.50').should.equal('£3.50');
      });

      it('formats and rounds 3.567 to two decimal places', () => {
        res.locals.currency().call(res.locals, '3.567').should.equal('£3.57');
      });

      it('formats 4.5678 to two decimal places from a local variable', () => {
        res.locals.value = 4.5678;
        res.locals.currency().call(res.locals, '{{value}}').should.equal('£4.57');
      });

      it('returns non float text as is', () => {
        res.locals.currency().call(res.locals, 'test').should.equal('test');
      });

      it('returns non float template text as is', () => {
        res.locals.value = 'test';
        res.locals.currency().call(res.locals, '{{value}}').should.equal('test');
      });

      it('returns an empty string if no text given', () => {
        res.locals.currency().call(res.locals).should.equal('');
      });
    });

    describe('hyphenate', () => {
      beforeEach(() => {
        middleware(req, res, next);
      });

      it('adds a function to res.locals', () => {
        res.locals.hyphenate.should.be.a('function');
      });

      it('returns a function', () => {
        res.locals.hyphenate().should.be.a('function');
      });

      it('hyphenates a string with a single whitespace character', () => {
        res.locals.hyphenate().call(res.locals, 'apple blackberry').should.equal('apple-blackberry');
      });

      it('hyphenates a string with multiple whitespace characters', () => {
        res.locals.hyphenate().call(res.locals, 'apple  blackberry   cherry').should.equal('apple-blackberry-cherry');
      });
    });

    describe('url', () => {
      beforeEach(() => {
        middleware(req, res, next);
      });

      it('prepends the baseUrl to relative paths', () => {
        req.baseUrl = '/base';
        res.locals.url().call(res.locals, './path').should.equal('/base/path');
        res.locals.url().call(res.locals, 'path').should.equal('/base/path');
      });

      it('returns path if baseUrl is not set', () => {
        req.baseUrl = undefined;
        res.locals.url().call(res.locals, 'path').should.equal('path');
        res.locals.url().call(res.locals, './path').should.equal('./path');
      });

      it('does not prepend the baseUrl to absolute paths', () => {
        req.baseUrl = '/base';
        res.locals.url().call(res.locals, '/path').should.equal('/path');
      });

      it('supports urls defined in template placeholders', () => {
        req.baseUrl = '/base';
        res.locals.href = './link';
        res.locals.url().call(res.locals, '{{href}}').should.equal('/base/link');
      });
    });

    describe('qs', () => {
      beforeEach(() => {
        middleware(req, res, next);
      });

      it('appends the passed query to the url query string', () => {
        req.query = { a: 'b' };
        res.locals.qs().call(res.locals, 'c=d').should.equal('?a=b&c=d');
      });
    });

    describe('renderField', () => {
      let inputTextStub;

      beforeEach(() => {
        middleware(req, res, next);
        inputTextStub = sinon.stub();
        sinon.stub(res.locals, 'input-text').returns(inputTextStub);
      });

      afterEach(() => {
        res.locals['input-text'].restore();
      });

      it('returns null if disableRender is set to true', () => {
        const field = {
          key: 'my-field',
          mixin: 'input-text',
          disableRender: true
        };
        expect(res.locals.renderField().call(field)).to.be.equal(null);
      });

      it('returns the field\'s html if defined', () => {
        const html = '<div>Prerendered HTML</div>';
        const field = {
          key: 'date-field',
          html: html
        };
        res.locals.renderField().call(field).should.be.equal(html);
      });

      it('looks up a mixin from res.locals and calls it', () => {
        const field = {
          key: 'my-field',
          mixin: 'input-text'
        };
        res.locals.renderField().call(field);
        inputTextStub.should.have.been.calledOnce
          .and.calledWith('my-field');
      });

      it('uses the field from the fields config if a key is passed', () => {
        const options = {
          fields: [
            { key: 'some-field' }
          ]
        };
        res.locals.renderField().call(options, 'some-field');
        inputTextStub.should.have.been.calledOnce
          .and.calledWith('some-field');
      });

      it('uses the field from res.locals if a key is passed and no `fields` exist in local scope', () => {
        res.locals.fields = [
          { key: 'some-field' }
        ];
        res.locals.renderField().call({}, 'some-field');
        inputTextStub.should.have.been.calledOnce
          .and.calledWith('some-field');
      });

      it('defaults to input-text if mixin omitted', () => {
        const field = {
          key: 'my-field'
        };
        res.locals.renderField().call(field);
        inputTextStub.should.have.been.calledOnce
          .and.calledWith('my-field');
      });

      it('throws an error if an invalid mixin is provided', () => {
        const field = {
          key: 'my-field',
          mixin: 'invalid'
        };
        expect(() => {
          res.locals.renderField().call(field);
        }).to.throw();
      });

      it('throws an error if called with an undefined field', () => {
        const options = {
          fields: [
            { key: 'some-field' }
          ]
        };
        expect(() => {
          res.locals.renderField().call(options, 'not-a-field');
        }).to.throw();
      });
    });

    describe('Multiple lambdas', () => {
      it('recursively runs lambdas wrapped in other lambdas correctly', () => {
        middleware(req, res, next);
        res.locals.value = '2016-01-01T00:00:00.000Z';
        const result = res.locals.uppercase().call(res.locals,
          '{{#time}}{{#date}}{{value}}|h:mma on D MMMM YYYY{{/date}}{{/time}}');
        result.should.equal('MIDNIGHT ON 1 JANUARY 2016');
      });
    });
  });

  describe('child templates', () => {
    let renderChild;
    let fields;
    let options;

    beforeEach(() => {
      render = sinon.stub();
      sinon.stub(Hogan, 'compile').returns({
        render: render
      });
    });

    afterEach(() => {
      Hogan.compile.restore();
    });

    describe('radio-group renderChild', () => {
      beforeEach(() => {
        middleware = mixins();
        middleware(req, res, next);
        res.locals['radio-group']().call(res.locals, 'field-name');
        renderChild = render.lastCall.args[0].renderChild;
      });

      it('is a function', () => {
        renderChild.should.be.a('function');
      });

      it('returns a function', () => {
        renderChild().should.be.a('function');
      });

      describe('called with child', () => {
        beforeEach(() => {
          options = [{}];
          fields = {
            'field-name': {
              options: options
            },
            'child-field-name': {}
          };
          renderChild = renderChild();
        });

        it('accepts an HTML template string', () => {
          Hogan.compile.restore();
          options[0] = {
            child: '<div>{{key}}</div>',
            key: 'value'
          };
          renderChild.call(fields['field-name'].options[0]).should.be.equal('<div>value</div>');
          sinon.stub(Hogan, 'compile').returns({
            render: render
          });
        });

        it('can lookup partial templates', () => {
          Hogan.compile.restore();
          const partialPath = path.resolve(__dirname, './test-partial.html').replace('.html', '');
          res.locals.partials = {
            'partials-test-partial': partialPath
          };
          options[0] = {
            child: '{{< partials-test-partial}}{{$title}}Title{{/title}}{{$content}}The content{{/content}}{{/partials-test-partial}}',
            key: 'value'
          };
          renderChild.call(fields['field-name'].options[0]).should.be.equal('<h1>Title</h1>\n<p>The content</p>\n');
          sinon.stub(Hogan, 'compile').returns({
            render: render
          });
        });

        it('renders raw html in a panel if specified', () => {
          Hogan.compile.restore();
          options[0] = {
            child: 'html',
            toggle: 'child-field-name'
          };
          res.locals.fields = [
            {
              key: 'child-field-name',
              html: '<div>some html</div>'
            }
          ];
          middleware(req, res, next);
          res.locals['radio-group']().call(res.locals, 'field-name');
          renderChild = render.lastCall.args[0].renderChild();
          renderChild.call(fields['field-name'].options[0]).should.be.equal('<div id="child-field-name-panel" class="reveal js-hidden">\n    <div class="panel-indent">\n<div>some html</div>    </div>\n</div>\n');
          sinon.stub(Hogan, 'compile').returns({
            render: render
          });
        });

        it('accepts a template mixin and renders it in a panel', () => {
          Hogan.compile.restore();
          options[0] = {
            value: true,
            label: 'True',
            toggle: 'child-field-name',
            child: 'input-text'
          };
          sinon.stub(res.locals, 'input-text').returns(function (key) {
            return Hogan.compile('<div>{{key}}</div>').render({ key: key });
          });
          let output = '<div id="child-field-name-panel" class="reveal js-hidden">';
          output += '\n    <div class="panel-indent">\n';
          output += '<div>child-field-name</div>';
          output += '    </div>';
          output += '\n</div>\n';
          renderChild.call(_.extend({}, fields['field-name'].options[0], res.locals)).should.be.equal(output);
          res.locals['input-text'].restore();
          sinon.stub(Hogan, 'compile').returns({
            render: render
          });
        });

        it('accepts a custom partial', () => {
          Hogan.compile.restore();
          res.locals.partials = {
            'partials-custom-partial': 'partials/custom-partial'
          };
          const customPartial = '<div>Custom Partial</div>';
          options[0] = {
            child: 'partials/custom-partial'
          };
          sinon.stub(fs, 'readFileSync')
            .withArgs('partials/custom-partial.html')
            .returns(customPartial);
          renderChild.call(fields['field-name'].options[0]).should.be.equal(customPartial);
          fs.readFileSync.restore();
          sinon.stub(Hogan, 'compile').returns({
            render: render
          });
        });
      });
    });

    describe('checkbox renderChild', () => {
      beforeEach(() => {
        middleware = mixins({ 'field-name': {} });
        middleware(req, res, next);
        res.locals.checkbox().call(res.locals, 'field-name');
        renderChild = render.lastCall.args[0].renderChild;
      });

      it('is a function', () => {
        renderChild.should.be.a('function');
      });

      it('returns a function', () => {
        renderChild().should.be.a('function');
      });

      describe('called with child', () => {
        beforeEach(() => {
          options = {};
          fields = {
            'field-name': options,
            'child-field-name': {}
          };
          renderChild = renderChild();
        });

        it('accepts an HTML template string', () => {
          Hogan.compile.restore();
          options.child = '<div>{{key}}</div>';
          options.key = 'value';
          renderChild.call(fields['field-name']).should.be.equal('<div>value</div>');
          sinon.stub(Hogan, 'compile').returns({
            render: render
          });
        });

        it('accepts a template mixin and renders it in a panel', () => {
          Hogan.compile.restore();
          options.child = 'input-text';
          options.toggle = 'child-field-name';
          sinon.stub(res.locals, 'input-text').returns(function (key) {
            return Hogan.compile('<div>{{key}}</div>').render({ key: key });
          });
          let output = '<div id="child-field-name-panel" class="reveal js-hidden">';
          output += '\n    <div class="panel-indent">\n';
          output += '<div>child-field-name</div>';
          output += '    </div>';
          output += '\n</div>\n';
          renderChild.call(_.extend({}, fields['field-name'], res.locals)).should.be.equal(output);
          sinon.stub(Hogan, 'compile').returns({
            render: render
          });
        });

        it('accepts a custom partial', () => {
          Hogan.compile.restore();
          res.locals.partials = {
            'partials-custom-partial': 'partials/custom-partial'
          };
          const customPartial = '<div>Custom Partial</div>';
          options.child = 'partials/custom-partial';
          sinon.stub(fs, 'readFileSync')
            .withArgs('partials/custom-partial.html')
            .returns(customPartial);
          renderChild.call(fields['field-name']).should.be.equal(customPartial);
          fs.readFileSync.restore();
          sinon.stub(Hogan, 'compile').returns({
            render: render
          });
        });
      });
    });
  });
});
