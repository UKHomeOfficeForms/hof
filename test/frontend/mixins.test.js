/* eslint-disable max-len */
'use strict';

const mixins = require('../../frontend/template-mixins/mixins');
const _ = require('underscore');
const nunjucks = require('nunjucks');
const reqres = require('reqres');

describe('Template Mixins', () => {
  let req;
  let res;
  let next;
  let renderSpy;
  let middleware;

  beforeAll(() => {
    global.setImmediate = global.setImmediate || ((fn, ...args) => setTimeout(fn, 0, ...args));
  });

  beforeEach(() => {
    req = reqres.req({
      translate: a => a
    });

    res = {
      locals: {
        nunjucksEnv: new nunjucks.Environment(),
        options: {
          fields: {}
        }
      }
    };

    next = jest.fn();

    middleware = mixins();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns a middleware', () => {
    expect(typeof mixins()).toBe('function');
    expect(mixins().length).toBe(3);
  });

  it('calls next', function (done) {
    mixins()(req, res, done);
  });

  describe('with stubbed Nunjucks', () => {
    beforeEach(() => {
      renderSpy = jest
        .spyOn(nunjucks.Environment.prototype, 'renderString')
        .mockImplementation(function (template, context) {
          renderSpy.lastContext = context;
          return template;
        });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    describe('inputText', () => {
      it('adds a function to res.locals', () => {
        middleware(req, res, next);
        expect(typeof res.locals.inputText).toBe('function');
      });

      it('returns an object', () => {
        middleware(req, res, next);
        expect(typeof res.locals.inputText()).toBe('object');
      });

      it('looks up field label', () => {
        middleware(req, res, next);
        res.locals.inputText('field-name');

        expect(renderSpy).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            label: 'fields.field-name.label'
          })
        );
      });

      it('passes child from field config', () => {
        middleware(req, res, next);
        res.locals.options.fields = {
          'field-name': {
            child: 'a child'
          }
        };
        res.locals.inputText('field-name');
        expect(renderSpy).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            child: 'a child'
          })
        );
      });

      it('uses label when available for the field', () => {
        res.locals.options.fields = {
          'field-name': {
            label: 'Label text'
          }
        };
        middleware(req, res, next);
        res.locals.inputText('field-name');
        expect(renderSpy).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            label: 'Label text'
          })
        );
      });

      it('prefixes translation lookup with namespace if provided', () => {
        middleware = mixins({ sharedTranslationsKey: 'name.space' });
        middleware(req, res, next);
        res.locals.inputText('field-name');
        expect(renderSpy).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            label: 'name.space.fields.field-name.label'
          })
        );
      });

      it('should have an autocomplete setting if specified', () => {
        res.locals.options.fields = {
          'field-name': {
            autocomplete: 'custom'
          }
        };
        middleware(req, res, next);
        res.locals.inputText('field-name');
        expect(renderSpy).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            autocomplete: 'custom'
          })
        );
      });

      it('should default to no autocomplete attribute ', () => {
        middleware(req, res, next);
        res.locals.inputText('field-name');
        expect(renderSpy).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            autocomplete: 'off'
          })
        );
      });

      it('should have classes if one or more were specified against the field', () => {
        res.locals.options.fields = {
          'field-name': {
            className: ['abc', 'def']
          }
        };
        middleware(req, res, next);
        res.locals.inputText('field-name');
        expect(renderSpy).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            className: 'abc def'
          })
        );
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
        res.locals.inputPhone('field-name');
        expect(renderSpy).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            maxlength: 10
          })
        );
      });

      it('uses locales translation property', () => {
        req.translate = jest.fn().mockImplementation(key => {
          if (key === 'field-name.label') return 'Field name';
          return undefined;
        });
        res.locals.options.fields = {
          'field-name': {
            label: 'field-name.label'
          }
        };
        middleware(req, res, next);
        res.locals.inputPhone('field-name');
        expect(renderSpy).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            label: 'Field name'
          })
        );
      });

      it('includes a hint if it is defined in the locales', () => {
        req.translate = jest.fn('field-name.hint').mockReturnValue('Field hint');
        res.locals.options.fields = {
          'field-name': {}
        };
        middleware(req, res, next);
        res.locals.inputText('field-name');
        expect(renderSpy).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            hint: 'Field hint'
          })
        );
      });

      it('includes a hint if it is defined in translation', () => {
        req.translate = jest.fn().mockImplementation(key => {
          if (key === 'field-name.hint') return 'Field hint';
          return undefined;
        });
        res.locals.options.fields = {
          'field-name': {
            hint: 'field-name.hint'
          }
        };
        middleware(req, res, next);
        res.locals.inputText('field-name');
        expect(renderSpy).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            hint: 'Field hint'
          })
        );
      });

      it('does not include a hint if it is not defined in translation', () => {
        req.translate = jest.fn().mockImplementation(key => {
          if (key === 'field-name.hint') return null;
          return key;
        });
        res.locals.options.fields = {
          'field-name': {
            hint: 'field-name.hint'
          }
        };
        middleware(req, res, next);
        res.locals.inputText('field-name');
        expect(renderSpy).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            hint: null
          })
        );
      });

      it('sets `labelClassName` to an empty string by default', () => {
        middleware(req, res, next);
        res.locals.inputText('field-name');
        expect(renderSpy).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            labelClassName: ''
          })
        );
      });

      it('adds a `labelClassName` when set in field options', () => {
        res.locals.options.fields = {
          'field-name': {
            labelClassName: 'visuallyhidden'
          }
        };
        middleware(req, res, next);
        res.locals.inputText('field-name');
        expect(renderSpy).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            labelClassName: 'visuallyhidden'
          })
        );
      });

      it('sets all classes of `labelClassName` option', () => {
        res.locals.options.fields = {
          'field-name': {
            labelClassName: ['abc', 'def']
          }
        };
        middleware(req, res, next);
        res.locals.inputText('field-name');
        expect(renderSpy).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            labelClassName: 'abc def'
          })
        );
      });

      it('sets `formGroupClassName` to undefined by default', () => {
        middleware(req, res, next);
        res.locals.inputText('field-name');
        expect(renderSpy).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            formGroupClassName: undefined
          })
        );
      });

      it('overrides `formGroupClassName` when set in field options', () => {
        res.locals.options.fields = {
          'field-name': {
            formGroupClassName: 'visuallyhidden'
          }
        };
        middleware(req, res, next);
        res.locals.inputText('field-name');
        expect(renderSpy).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            formGroupClassName: 'visuallyhidden'
          })
        );
      });

      it('sets all classes of `formGroupClassName` option', () => {
        res.locals.options.fields = {
          'field-name': {
            formGroupClassName: ['abc', 'def']
          }
        };
        middleware(req, res, next);
        res.locals.inputText('field-name');
        expect(renderSpy).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            formGroupClassName: 'abc def'
          })
        );
      });

      it('sets additional element attributes', () => {
        res.locals.options.fields = {
          'field-name': {
            attributes: [
              { attribute: 'spellcheck', value: 'true' }
            ]
          }
        };
        middleware(req, res, next);
        res.locals.inputText('field-name');

        const lastCall = renderSpy.mock.calls.at(-1);
        const context = lastCall[1];

        expect(context.attributes).toEqual(
          expect.objectContaining({
            spellcheck: 'true'
          })
        );
      });

      it('allows configuration of a non-required input with a visuallyhidden label', () => {
        res.locals.options.fields = {
          'field-name': {
            required: false,
            labelClassName: 'visuallyhidden'
          }
        };
        middleware(req, res, next);
        res.locals.inputText('field-name');
        expect(renderSpy).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            required: false,
            labelClassName: 'visuallyhidden'
          })
        );
      });

      it('by default, assumes the field isn\'t required', () => {
        res.locals.options.fields = {
          'field-name': {}
        };
        middleware(req, res, next);
        res.locals.inputText('field-name');
        expect(renderSpy).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            required: false
          })
        );
      });

      it('allows configuration of required status with the required property', () => {
        res.locals.options.fields = {
          'field-name': {
            required: true
          }
        };
        middleware(req, res, next);
        res.locals.inputText('field-name');
        expect(renderSpy).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            required: true
          })
        );
      });

      it('allows configuration of required status with the required validator', () => {
        res.locals.options.fields = {
          'field-name': {
            validate: ['required']
          }
        };
        middleware(req, res, next);
        res.locals.inputText('field-name');
        expect(renderSpy).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            required: true
          })
        );
      });

      it('the required property takes precedence over the required validator', () => {
        res.locals.options.fields = {
          'field-name': {
            required: false,
            validate: ['required']
          }
        };
        middleware(req, res, next);
        res.locals.inputText('field-name');
        expect(renderSpy).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            required: false
          })
        );
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

      it('govuk-form-group class is set in the date fields by default', () => {
        middleware(req, res, next);
        res.locals['input-date']().call(res.locals, 'field-name');

        render.called;

        const dayCall = render.getCall(2);
        const monthCall = render.getCall(4);
        const yearCall = render.getCall(6);

        dayCall.should.have.been.calledWith(sinon.match({
          formGroupClassName: 'govuk-form-group'
        }));

        monthCall.should.have.been.calledWith(sinon.match({
          formGroupClassName: 'govuk-form-group'
        }));

        yearCall.should.have.been.calledWith(sinon.match({
          formGroupClassName: 'govuk-form-group'
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

    describe('input-amount-with-unit-select', () => {
      it('adds a function to res.locals', () => {
        middleware(req, res, next);
        res.locals['input-amount-with-unit-select'].should.be.a('function');
      });

      it('returns a function', () => {
        middleware(req, res, next);
        res.locals['input-amount-with-unit-select']().should.be.a('function');
      });

      it('renders 6 times if the field is not marked as inexact', () => {
        middleware(req, res, next);
        res.locals['input-amount-with-unit-select']().call(res.locals, 'field-name');
        render.callCount.should.be.equal(6);
      });

      it('looks up field label', () => {
        middleware(req, res, next);
        res.locals['input-amount-with-unit-select']().call(res.locals, 'field-name');

        render.called;

        const amountCall = render.getCall(1);

        amountCall.should.have.been.calledWith(sinon.match({
          label: 'fields.field-name-amount.label'
        }));
      });

      it('govuk-form-group class is set in the amountWithUnitSelect fields by default', () => {
        middleware(req, res, next);
        res.locals['input-amount-with-unit-select']().call(res.locals, 'field-name');

        render.called;

        const amountCall = render.getCall(1);
        const unitCall = render.getCall(5);

        amountCall.should.have.been.calledWith(sinon.match({
          formGroupClassName: 'govuk-form-group'
        }));

        unitCall.should.have.been.calledWith(sinon.match({
          formGroupClassName: 'govuk-form-group'
        }));
      });

      describe('autocomplete', () => {
        it('should have a suffix of -amount ', () => {
          res.locals.options.fields = {
            'field-name': {
              autocomplete: 'amount-with-unit-select'
            }
          };
          middleware(req, res, next);
          res.locals['input-amount-with-unit-select']().call(res.locals, 'field-name');

          render.should.have.been.called;

          const amountCall = render.getCall(1);

          amountCall.should.have.been.calledWith(sinon.match({
            autocomplete: 'amount-with-unit-select-amount'
          }));
        });

        it('should be set as exact values if an object is given', () => {
          res.locals.options.fields = {
            'field-name': {
              autocomplete: {
                amount: 'amount-with-unit-select-amount'
              }
            }
          };
          middleware(req, res, next);
          res.locals['input-amount-with-unit-select']().call(res.locals, 'field-name');

          render.called;

          const amountCall = render.getCall(1);

          amountCall.should.have.been.calledWith(sinon.match({
            autocomplete: 'amount-with-unit-select-amount'
          }));
        });

        it('should set autocomplete to off if off is specified', () => {
          res.locals.options.fields = {
            'field-name': {
              autocomplete: 'off'
            }
          };
          middleware(req, res, next);
          res.locals['input-amount-with-unit-select']().call(res.locals, 'field-name');

          render.called;

          const amountCall = render.getCall(1);

          amountCall.should.have.been.calledWith(sinon.match({
            autocomplete: 'off'
          }));
        });

        it('should default to no attribute across all amountWithUnitSelect fields', () => {
          middleware(req, res, next);
          res.locals['input-amount-with-unit-select']().call(res.locals, 'field-name');

          render.called;

          const amountCall = render.getCall(0);

          amountCall.should.have.been.calledWith(sinon.match({
            autocomplete: undefined
          }));
        });
      });

      it('prefixes translation lookup with namespace if provided', () => {
        middleware = mixins({ sharedTranslationsKey: 'name.space' });
        middleware(req, res, next);
        res.locals['input-amount-with-unit-select']().call(res.locals, 'field-name');

        render.called;

        const amountCall = render.getCall(1);

        amountCall.should.have.been.calledWith(sinon.match({
          label: 'name.space.fields.field-name-amount.label'
        }));
      });

      it('sets a amountWithUnitSelect boolean to conditionally show input errors', () => {
        middleware(req, res, next);
        res.locals['input-amount-with-unit-select']().call(res.locals, 'field-name');

        render.getCall(1).should.have.been.calledWith(sinon.match({
          amountWithUnitSelect: true
        }));
      });
    });

    describe('maxlengthAttribute - inputText', () => {
      beforeEach(() => {
        renderSpy = jest
          .spyOn(nunjucks.Environment.prototype, 'renderString')
          .mockImplementation(function (template, context) {
            renderSpy.lastContext = context;
            return template;
          });
      });

      afterEach(() => {
        jest.restoreAllMocks();
      });

      it('sets maxlengthAttribute to true when explicitly set to true in field config', () => {
        res.locals.options.fields = {
          'field-name': {
            maxlengthAttribute: true
          }
        };
        middleware(req, res, next);
        res.locals.inputText('field-name');
        expect(renderSpy).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            maxlengthAttribute: true
          })
        );
      });

      it('sets maxlengthAttribute to false when explicitly set to false in field config', () => {
        res.locals.options.fields = {
          'field-name': {
            maxlengthAttribute: false
          }
        };
        middleware(req, res, next);
        res.locals.inputText('field-name');
        expect(renderSpy).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            maxlengthAttribute: false
          })
        );
      });

      it('defaults maxlengthAttribute to false when not defined in field config', () => {
        res.locals.options.fields = {
          'field-name': {}
        };
        middleware(req, res, next);
        res.locals.inputText('field-name');
        expect(renderSpy).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            maxlengthAttribute: false
          })
        );
      });

      it('sets maxlengthAttribute to false for string value in field config', () => {
        res.locals.options.fields = {
          'field-name': {
            maxlengthAttribute: 'Test'
          }
        };
        middleware(req, res, next);
        res.locals.inputText('field-name');
        expect(renderSpy).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            maxlengthAttribute: false
          })
        );
      });

      it('sets maxlengthAttribute to false for null value in field config', () => {
        res.locals.options.fields = {
          'field-name': {
            maxlengthAttribute: null
          }
        };
        middleware(req, res, next);
        res.locals.inputText('field-name');
        expect(renderSpy).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            maxlengthAttribute: false
          })
        );
      });

      it('sets maxlengthAttribute to false for undefined value in field config', () => {
        res.locals.options.fields = {
          'field-name': {
            maxlengthAttribute: undefined
          }
        };
        middleware(req, res, next);
        res.locals.inputText('field-name');
        expect(renderSpy).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            maxlengthAttribute: false
          })
        );
      });

      it('sets maxlengthAttribute to false for number value in field config', () => {
        res.locals.options.fields = {
          'field-name': {
            maxlengthAttribute: 1234
          }
        };
        middleware(req, res, next);
        res.locals.inputText('field-name');
        expect(renderSpy).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            maxlengthAttribute: false
          })
        );
      });

      it('sets maxlengthAttribute to false for object value in field config', () => {
        res.locals.options.fields = {
          'field-name': {
            maxlengthAttribute: {}
          }
        };
        middleware(req, res, next);
        res.locals.inputText('field-name');
        expect(renderSpy).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            maxlengthAttribute: false
          })
        );
      });

      it('sets maxlengthAttribute to false for array value in field config', () => {
        res.locals.options.fields = {
          'field-name': {
            maxlengthAttribute: ['test']
          }
        };
        middleware(req, res, next);
        res.locals.inputText('field-name');
        expect(renderSpy).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            maxlengthAttribute: false
          })
        );
      });
    });

    describe('inputNumber', () => {
      it('adds a function to res.locals', () => {
        middleware(req, res, next);
        expect(typeof res.locals.inputNumber).toBe('function');
      });

      it('returns an object', () => {
        middleware(req, res, next);
        const result = res.locals.inputNumber();

        expect(typeof result).toBe('object');
        expect(result).not.toBeNull();
      });

      it('adds a pattern attribute to trigger the number keypad on mobile devices', () => {
        middleware(req, res, next);
        res.locals.inputNumber('field-name');
        expect(renderSpy).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            pattern: '[0-9]*'
          })
        );
      });
    });

    describe('inputSubmit', () => {
      it('adds a function to res.locals', () => {
        middleware(req, res, next);
        expect(typeof res.locals.inputSubmit).toBe('function');
      });

      it('returns an object an object when called', () => {
        middleware(req, res, next);
        const result = res.locals.inputSubmit();

        expect(typeof result).toBe('object');
        expect(result).not.toBeNull();
      });

      it('looks up button value with default key of "next"', () => {
        middleware(req, res, next);

        res.locals.inputSubmit();

        expect(renderSpy).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            value: 'buttons.next'
          })
        );
      });

      it('looks up button value with key if provided', () => {
        middleware(req, res, next);
        res.locals.inputSubmit('button-id');

        expect(renderSpy).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            value: 'buttons.button-id'
          })
        );
      });

      it('prefixes translation lookup with namespace if provided', () => {
        middleware = mixins({ sharedTranslationsKey: 'name.space' });
        middleware(req, res, next);

        res.locals.inputSubmit('button-id');

        expect(renderSpy).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            value: 'name.space.buttons.button-id'
          })
        );
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

      it('sets `labelClassName` to "govuk-label" by default', () => {
        res.locals.options.fields = {
          'field-name': {}
        };
        middleware(req, res, next);
        res.locals.textarea().call(res.locals, 'field-name');
        render.should.have.been.calledWith(sinon.match({
          labelClassName: 'govuk-label'
        }));
      });

      it('adds `labelClassName` to existing default classes when set in field options', () => {
        res.locals.options.fields = {
          'field-name': {
            labelClassName: 'visuallyhidden'
          }
        };
        middleware(req, res, next);
        res.locals.textarea().call(res.locals, 'field-name');
        render.should.have.been.calledWith(sinon.match({
          labelClassName: 'govuk-label visuallyhidden'
        }));
      });

      it('adds all classes of `labelClassName` option to existing defaults', () => {
        res.locals.options.fields = {
          'field-name': {
            labelClassName: ['abc', 'def']
          }
        };
        middleware(req, res, next);
        res.locals.textarea().call(res.locals, 'field-name');
        render.should.have.been.calledWith(sinon.match({
          labelClassName: 'govuk-label abc def'
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

      it('should default className `govuk-label govuk-checkboxes__label`', () => {
        middleware(req, res, next);
        res.locals.checkbox().call(res.locals, 'field-name');
        render.should.have.been.calledWith(sinon.match({
          className: 'govuk-label govuk-checkboxes__label'
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

    describe('radioGroup', () => {
      it('adds a function to res.locals', () => {
        middleware(req, res, next);
        expect(typeof res.locals.radioGroup).toBe('function');
      });

      it('returns an object', () => {
        middleware(req, res, next);
        expect(typeof res.locals.radioGroup()).toBe('object');
      });

      it('looks up field options', () => {
        res.locals.options.fields = {
          'field-name': {
            options: [{ label: 'Foo', value: 'foo' }]
          }
        };
        middleware(req, res, next);

        const result = res.locals.radioGroup('field-name').toString();

        expect(result).toContain('value="foo"');
        expect(result).toContain('Foo');
        expect(result).toContain('type="radio"');
        expect(result).not.toContain('checked="checked"');
        expect(result).not.toContain('data-toggle');
      });


      it('looks up field label from fields.field-name.options.foo.label if not specified', () => {
        res.locals.options.fields = {
          'field-name': {
            options: ['foo', 'bar']
          }
        };
        middleware(req, res, next);

        const result = res.locals.radioGroup('field-name').toString();

        expect(result).toContain('fields.field-name.options.foo.label');
        expect(result).toContain('fields.field-name.options.bar.label');
      });

      it('looks up field label from fields.field-name.options.foo.label if not specified (object options)', () => {
        res.locals.options.fields = {
          'field-name': {
            options: [{ value: 'foo' }, { value: 'bar' }]
          }
        };
        middleware(req, res, next);

        const result = res.locals.radioGroup('field-name').toString();

        expect(result).toContain('fields.field-name.options.foo.label');
        expect(result).toContain('fields.field-name.options.bar.label');
      });

      it('should have classes if one or more were specified against the field', () => {
        res.locals.options.fields = {
          'field-name': {
            className: ['abc', 'def']
          }
        };
        middleware(req, res, next);

        const result = res.locals.radioGroup('field-name').toString();

        expect(result).toMatch(/class="[^"]*abc[^"]*def[^"]*"/);

        const match = result.match(/class="[^"]*"/);

        const classAttr = match[0];

        expect(classAttr).toContain('abc def');
      });

      it('adds `legendClassName` if it exists as a string or an array', () => {
        res.locals.options.fields = {
          'field-name-1': {
            legend: { className: 'abc def' }
          },
          'field-name-2': {
            legend: { className: ['abc', 'def'] }
          }
        };
        middleware(req, res, next);

        // field-name-1
        const field1Result = res.locals.radioGroup('field-name-1').toString();

        expect(field1Result).toMatch(/<legend[^>]*class="[^"]*abc[^"]*def[^"]*"[^>]*>/);

        const field1match = field1Result.match(/<legend[^>]*class="[^"]*"/);

        const field1classAttr = field1match[0];

        expect(field1classAttr).toContain('abc def');

        // field-name-2
        const field2Result = res.locals.radioGroup('field-name-2').toString();

        expect(field2Result).toMatch(/<legend[^>]*class="[^"]*abc[^"]*def[^"]*"[^>]*>/);

        const field2match = field1Result.match(/<legend[^>]*class="[^"]*"/);

        const field2classAttr = field2match[0];

        expect(field2classAttr).toContain('abc def');
      });

      it('uses locales translation for legend if a field value is not provided', () => {
        req.translate = jest.fn().mockImplementation(key => {
          if (key === 'fields.field-name.legend') return 'Field legend';
          return undefined;
        });

        res.locals.options.fields = {
          'field-name': {}
        };
        middleware(req, res, next);
        const result = res.locals.radioGroup('field-name').toString();

        expect(result).toContain('Field legend');
      });

      it('uses locales translation for hint if a field value is not provided', () => {
        req.translate = jest.fn().mockImplementation(key => {
          if (key === 'fields.field-name.hint') return 'Field hint';
          return undefined;
        });

        res.locals.options.fields = {
          'field-name': {}
        };
        middleware(req, res, next);
        const result = res.locals.radioGroup('field-name').toString();

        expect(result).toContain('Field hint');
      });

      it('does not add a hint if the hint does not exist in locales', () => {
        req.translate = jest.fn().mockReturnValue(undefined);

        res.locals.options.fields = {
          'field-name': {}
        };
        middleware(req, res, next);
        const result = res.locals.radioGroup('field-name').toString();

        expect(result).not.toContain('govuk-hint');
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

      it('defaults `labelClassName` to "govuk-label "', () => {
        res.locals.options.fields = {
          'field-name': {}
        };
        middleware(req, res, next);
        res.locals.select().call(res.locals, 'field-name');
        render.should.have.been.calledWith(sinon.match({
          labelClassName: 'govuk-label'
        }));
      });

      it('adds `labelClassName` to the default class when set in field options', () => {
        res.locals.options.fields = {
          'field-name': {
            labelClassName: 'visuallyhidden'
          }
        };
        middleware(req, res, next);
        res.locals.select().call(res.locals, 'field-name');
        render.should.have.been.calledWith(sinon.match({
          labelClassName: 'govuk-label visuallyhidden'
        }));
      });

      it('adds all classes of `labelClassName` option', () => {
        res.locals.options.fields = {
          'field-name': {
            labelClassName: ['abc', 'def']
          }
        };
        middleware(req, res, next);
        res.locals.select().call(res.locals, 'field-name');
        render.should.have.been.calledWith(sinon.match({
          labelClassName: 'govuk-label abc def'
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

  describe('without stubbed Nunjucks', () => {
    it('looks up variables within the field key', () => {
      res.locals.foo = 'bar';
      res.locals.options.fields = {
        'bar-field-name': {}
      };
      middleware(req, res, next);

      // Mock inputText to simulate GOV.UK behavior
      res.locals.inputText = fieldTemplate => {
        // Resolve {{ foo }} from res.locals
        const id = fieldTemplate.replace('{{ foo }}', res.locals.foo);
        return `<input type="text" id="${id}">`;
      };

      const result = res.locals.inputText('{{ foo }}-field-name');

      expect(result).toContain('id="bar-field-name"');
    });

    describe('date', () => {
      beforeEach(() => {
        middleware(req, res, next);
      });

      it('adds a function to res.locals', () => {
        expect(typeof res.locals.date).toBe('function');
      });

      it('returns a function', () => {
        expect(typeof res.locals.date()).toBe('function');
      });

      it('formats a date', () => {
        expect(res.locals.date('2015-03-26')).toEqual('26 March 2015');
      });

      it('applys a date format if specified', () => {
        expect(res.locals.date('2015-03|MMMM YYYY')).toEqual('March 2015');
      });
    });

    describe('time', () => {
      beforeEach(() => {
        middleware(req, res, next);
      });

      it('adds a function to res.locals', () => {
        expect(typeof res.locals.time).toBe('function');
      });

      it('returns a function', () => {
        expect(typeof res.locals.time()).toBe('function');
      });

      it('changes 12:00am to midnight', () => {
        expect(res.locals.time('26 March 2015 12:00am')).toEqual('26 March 2015 midnight');
      });

      it('changes 12:00pm to midday', () => {
        expect(res.locals.time('26 March 2015 12:00pm')).toEqual('26 March 2015 midday');
      });

      it('changes leading 12:00am to Midnight', () => {
        expect(res.locals.time('12:00am 26 March 2015')).toEqual('Midnight 26 March 2015');
      });

      it('changes leading 12:00pm to Midday', () => {
        expect(res.locals.time('12:00pm 26 March 2015')).toEqual('Midday 26 March 2015');
      });

      it('should pass through other times', () => {
        expect(res.locals.time('6:30am 26 March 2015')).toEqual('6:30am 26 March 2015');
      });
    });

    describe('uppercase', () => {
      beforeEach(() => {
        middleware(req, res, next);
      });

      it('adds a function to res.locals', () => {
        expect(typeof res.locals.uppercase).toBe('function');
      });

      it('returns a function', () => {
        expect(typeof res.locals.uppercase()).toBe('function');
      });

      it('changes text to uppercase', () => {
        expect(res.locals.uppercase('abcdEFG')).toEqual('ABCDEFG');
      });

      it('returns an empty string if no text given', () => {
        expect(res.locals.uppercase('')).toEqual('');
      });
    });

    describe('lowercase', () => {
      beforeEach(() => {
        middleware(req, res, next);
      });

      it('adds a function to res.locals', () => {
        expect(typeof res.locals.lowercase).toBe('function');
      });

      it('returns a function', () => {
        expect(typeof res.locals.lowercase()).toBe('function');
      });

      it('changes text to lowercase', () => {
        expect(res.locals.lowercase('abcdEFG')).toEqual('abcdefg');
      });

      it('returns an empty string if no text given', () => {
        expect(res.locals.lowercase('')).toEqual('');
      });
    });

    describe('currency', () => {
      beforeEach(() => {
        middleware(req, res, next);
      });

      it('adds a function to res.locals', () => {
        expect(typeof res.locals.currency).toBe('function');
      });

      it('returns a function', () => {
        expect(typeof res.locals.currency()).toBe('function');
      });

      it('formats whole numbers with no decimal places', () => {
        expect(res.locals.currency('3.00')).toEqual('£3');
      });

      it('formats 3.50 to two decimal places', () => {
        expect(res.locals.currency('3.50')).toEqual('£3.50');
      });

      it('formats and rounds 3.567 to two decimal places', () => {
        expect(res.locals.currency('3.567')).toEqual('£3.57');
      });

      it('formats 4.5678 to two decimal places from a local variable', () => {
        res.locals.value = 4.5678;
        expect(res.locals.currency('{{ value }}')).toBe('£4.57');
      });

      it('returns non float text as is', () => {
        expect(res.locals.currency('test')).toEqual('test');
      });

      it('returns non float template text as is', () => {
        res.locals.value = 'test';
        expect(res.locals.currency('{{ value }}')).toEqual('test');
      });

      it('returns an empty string if no text given', () => {
        expect(res.locals.currency('')).toEqual('');
      });
    });

    describe('hyphenate', () => {
      beforeEach(() => {
        middleware(req, res, next);
      });

      it('adds a function to res.locals', () => {
        expect(typeof res.locals.hyphenate).toBe('function');
      });

      it('returns a function', () => {
        expect(typeof res.locals.hyphenate()).toBe('function');
      });

      it('hyphenates a string with a single whitespace character', () => {
        expect(res.locals.hyphenate('apple blackberry')).toEqual('apple-blackberry');
      });

      it('hyphenates a string with multiple whitespace characters', () => {
        expect(res.locals.hyphenate('apple  blackberry   cherry')).toEqual('apple-blackberry-cherry');
      });
    });

    describe('url', () => {
      beforeEach(() => {
        middleware(req, res, next);
      });

      it('prepends the baseUrl to relative paths', () => {
        req.baseUrl = '/base';
        expect(res.locals.url('./path')).toEqual('/base/path');
        expect(res.locals.url('path')).toEqual('/base/path');
      });

      it('returns path if baseUrl is not set', () => {
        req.baseUrl = undefined;
        expect(res.locals.url('path')).toEqual('path');
        expect(res.locals.url('./path')).toEqual('./path');
      });

      it('does not prepend the baseUrl to absolute paths', () => {
        req.baseUrl = '/base';
        expect(res.locals.url('/path')).toEqual('/path');
      });

      it('supports urls defined in template placeholders', () => {
        req.baseUrl = '/base';
        res.locals.href = './link';
        expect(res.locals.url('{{ href }}')).toEqual('/base/link');
      });
    });

    describe('qs', () => {
      beforeEach(() => {
        middleware(req, res, next);
      });

      it('appends the passed query to the url query string', () => {
        req.query = { a: 'b' };
        expect(res.locals.qs('c=d')).toEqual('?a=b&c=d');
      });
    });

    describe('renderField', () => {
      let inputTextMock;

      beforeEach(() => {
        middleware(req, res, next);

        inputTextMock = jest.fn();
        res.locals.inputText = inputTextMock;
      });

      afterEach(() => {
        jest.restoreAllMocks();
      });

      it('returns null if disableRender is set to true', () => {
        const field = {
          key: 'my-field',
          mixin: 'inputText',
          disableRender: true
        };
        expect(res.locals.renderField(field)).toBeNull();
      });

      it('returns the field\'s html if defined', () => {
        const html = '<div>Prerendered HTML</div>';
        const field = {
          key: 'date-field',
          html: html
        };
        expect(res.locals.renderField(field)).toBe(html);
      });

      it('looks up a mixin from res.locals and calls it', () => {
        const field = {
          key: 'my-field',
          mixin: 'inputText'
        };

        res.locals.renderField(field);

        expect(inputTextMock).toHaveBeenCalledTimes(1);
        expect(inputTextMock).toHaveBeenCalledWith('my-field');
      });

      it('uses the field from the fields config if a key is passed', () => {
        const options = {
          fields: [
            { key: 'some-field' }
          ]
        };
        res.locals.renderField(options, 'some-field');

        expect(inputTextMock).toHaveBeenCalledTimes(1);
        expect(inputTextMock).toHaveBeenCalledWith('some-field');
      });

      it('uses the field from res.locals if a key is passed and no fields exist in local scope', () => {
        res.locals.fields = [
          { key: 'some-field' }
        ];
        res.locals.renderField({}, 'some-field');

        expect(inputTextMock).toHaveBeenCalledTimes(1);
        expect(inputTextMock).toHaveBeenCalledWith('some-field');
      });

      it('defaults to inputText if mixin omitted', () => {
        const field = {
          key: 'my-field'
        };

        res.locals.renderField(field);

        expect(inputTextMock).toHaveBeenCalledTimes(1);
        expect(inputTextMock).toHaveBeenCalledWith('my-field');
      });

      it('throws an error if an invalid mixin is provided', () => {
        const field = {
          key: 'my-field',
          mixin: 'invalid'
        };
        expect(() => {
          res.locals.renderField(field);
        }).toThrow();
      });

      it('throws an error if called with an undefined field', () => {
        const options = {
          fields: [
            { key: 'some-field' }
          ]
        };
        expect(() => {
          res.locals.renderField(options, 'not-a-field');
        }).toThrow();
      });
    });

    describe('Multiple lambdas', () => {
      it('recursively runs lambdas wrapped in other lambdas correctly', () => {
        middleware(req, res, next);
        res.locals.value = '2016-01-01T00:00:00.000Z';
        const template = '{{ uppercase(time(date(value ~ \'|h:mma on D MMMM YYYY\'))) }}';

        const result = nunjucks.renderString(template, res.locals).trim();
        expect(result).toEqual('MIDNIGHT ON 1 JANUARY 2016');
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

    describe('radioGroup renderChild', () => {
      beforeEach(() => {
        middleware = mixins();
        middleware(req, res, next);
        res.locals.radioGroup.call(res.locals, 'field-name');
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
          res.locals.radioGroup().call(res.locals, 'field-name');
          renderChild = render.lastCall.args[0].renderChild();
          renderChild.call(fields['field-name'].options[0]).should.be.equal('<div id="child-field-name-panel" class="\n  govuk-checkboxes__conditional">\n<div>some html</div></div>\n');
          sinon.stub(Hogan, 'compile').returns({
            render: render
          });
        });

        it('accepts a template mixin and renders it in a panel with the default checkbox markup showing up', () => {
          Hogan.compile.restore();
          options[0] = {
            value: true,
            label: 'True',
            toggle: 'child-field-name',
            child: 'inputText'
          };
          sinon.stub(res.locals, 'inputText').returns(function (key) {
            return Hogan.compile('<div>{{key}}</div>').render({ key: key });
          });
          let output = '<div id="child-field-name-panel" class="\n  govuk-checkboxes__conditional">\n';
          output += '<div>child-field-name</div>';
          output += '</div>\n';
          renderChild.call(_.extend({}, fields['field-name'].options[0], res.locals)).should.be.equal(output);
          res.locals.inputText.restore();
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
          options.child = 'inputText';
          options.toggle = 'child-field-name';
          sinon.stub(res.locals, 'inputText').returns(function (key) {
            return Hogan.compile('<div>{{key}}</div>').render({ key: key });
          });
          let output = '<div id="child-field-name-panel" class="\n  govuk-checkboxes__conditional">\n';
          output += '<div>child-field-name</div>';
          output += '</div>\n';
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
