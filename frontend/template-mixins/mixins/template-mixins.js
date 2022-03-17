/* eslint-disable no-param-reassign, max-len, consistent-return */
'use strict';

const fs = require('fs');
const path = require('path');

const Hogan = require('hogan.js');
const _ = require('underscore');

const renderer = require('./render');

const PANELMIXIN = 'partials/mixins/panel';
const PARTIALS = [
  'partials/forms/input-text-group',
  'partials/forms/input-submit',
  'partials/forms/select',
  'partials/forms/checkbox',
  'partials/forms/textarea-group',
  'partials/forms/option-group'
];

// This returns a middleware that places mixins against the `res.locals` object.
//
// It should be given:
// - options:
//   - viewDirectory: the folder in which templates are found in.
//   - viewEngine: the type of view, defaults to 'html'.
//   - sharedTranslationsKey: used to find translations relatively within
//     the translations.json. Useful for field and button labels.
module.exports = function (options) {
  const compiled = {};
  const templateCache = {};

  function maxlength(field) {
    const validation = field.validate || [];
    const ml = _.findWhere(validation, { type: 'maxlength' }) || _.findWhere(validation, { type: 'exactlength' });
    if (ml) {
      return _.isArray(ml.arguments) ? ml.arguments[0] : ml.arguments;
    }
    return null;
  }

  function type(field) {
    return field.type || 'text';
  }

  function classNameString(name) {
    if (_.isArray(name)) {
      return name.join(' ');
    }
    return name;
  }

  function classNames(field, prop) {
    prop = prop || 'className';
    if (field[prop]) {
      return classNameString(field[prop]);
    }
    return '';
  }

  return function (req, res, next) {
    const roots = [].concat(req.app.get('views')).concat(options.viewsDirectory);
    const View = req.app.get('view');

    // wrap in try catch to throw an error if any one template cannot be resolved
    try {
      PARTIALS.forEach(relativeTemplatePath => {
        if (compiled[relativeTemplatePath]) {
          return;
        }
        const viewExtension = '.' + options.viewEngine;
        const engines = {};
        engines[viewExtension] = {};
        const view = new View(relativeTemplatePath, {
          defaultEngine: options.viewEngine,
          root: roots,
          engines: engines
        });
        if (!view.path) {
          throw new Error('Could not find template file: ' + relativeTemplatePath);
        }
        const compiledTemplate = Hogan.compile(fs.readFileSync(view.path).toString());
        compiled[relativeTemplatePath] = compiledTemplate;
      });
    } catch (e) {
      return next(e);
    }

    const hoganRender = renderer(res);

    const t = function (key) {
      return hoganRender(req.translate(options.sharedTranslationsKey + key), this);
    };

    // Like t() but returns null on failed translations
    const conditionalTranslate = function (key) {
      key = options.sharedTranslationsKey + key;
      const translated = req.translate(key);
      return translated !== key ? translated : null;
    };

    const getTranslationKey = function (field, key, property) {
      return field[property] ? field[property] : 'fields.' + key + '.' + property;
    };

    function readTemplate(name) {
      if (templateCache[name]) {
        return templateCache[name];
      }
      const data = fs.readFileSync(`${name}.${options.viewEngine}`).toString();
      templateCache[name] = data;
      return data;
    }

    /*
     * helper function which takes a child string which
     * can either be the name of a partial in the format
     * partial/{partial-name}, the name of a template mixin
     * or a raw template string to render
     */
    function getTemplate(child) {
      res.locals.partials = res.locals.partials || {};


      const re = /^partials\/(.+)/i;
      const match = child.match(re);

      if (match) {
        return readTemplate(res.locals.partials['partials-' + match[1]]);
      } else if (child === 'html' || res.locals[child]) {
        if (res.locals.partials['partials-mixins-panel']) {
          return readTemplate(res.locals.partials['partials-mixins-panel']);
        }
        const panelPath = path.join(options.viewsDirectory, PANELMIXIN);
        return readTemplate(panelPath);
      }
      return child;
    }

    function isRequired(field) {
      if (field.required !== undefined) {
        return field.required;
      } else if (field.validate) {
        return field.validate.indexOf('required') > -1;
      }
      return false;
    }

    function renderMixin() {
      return function () {
        if (this.child) {
          if (this.child === 'html') {
            try {
              const key = this.toggle;
              return res.locals.fields.find(function (field) {
                return field.key === key;
              }).html;
            } catch (err) {
              const msg = `html property not set on field: ${this.toggle}. Did you forget to use a component?`;
              next(new Error(msg));
            }
          }
          if (this[this.child]) {
            return this[this.child]().call(this, this.toggle);
          }
        }
      };
    }

    function renderChild() {
      return function () {
        if (this.child) {
          const templateString = getTemplate(this.child, this.toggle);
          const template = Hogan.compile(templateString);
          return template.render(Object.assign({
            renderMixin: renderMixin.bind(this)
          }, res.locals, this), _.mapObject(res.locals.partials, function (partialpath) {
            return readTemplate(partialpath);
          }));
        }
      };
    }

    // eslint-disable-next-line complexity
    function inputText(key, extension) {
      extension = extension || {};

      const field = Object.assign({}, this.options.fields[key] || options.fields[key]);
      const hKey = getTranslationKey(field, key, 'hint');
      const lKey = getTranslationKey(field, key, 'label');
      const hint = conditionalTranslate(hKey);
      const required = isRequired(field);
      const autocomplete = field.autocomplete || extension.autocomplete;

      return Object.assign({}, extension, {
        id: key,
        className: extension.className || classNames(field),
        type: extension.type || type(field),
        value: this.values && this.values[key],
        label: t(lKey),
        labelClassName: classNames(field, 'labelClassName') || 'form-label',
        formGroupClassName: classNames(field, 'formGroupClassName') || extension.formGroupClassName || 'govuk-form-group',
        hint: hint,
        hintId: extension.hintId || (hint ? key + '-hint' : null),
        error: this.errors && this.errors[key],
        maxlength: maxlength(field) || extension.maxlength,
        required: required,
        pattern: extension.pattern,
        date: extension.date,
        autocomplete: autocomplete,
        child: field.child,
        attributes: field.attributes,
        renderChild: renderChild.bind(this)
      });
    }

    function optionGroup(key, opts) {
      opts = opts || {};
      const field = Object.assign({}, this.options.fields[key] || options.fields[key]);
      const legend = field.legend;

      let legendClassName;
      let legendValue = 'fields.' + key + '.legend';
      if (legend) {
        if (legend.className) {
          legendClassName = classNameString(legend.className);
        }
        if (typeof legend.value !== 'undefined') {
          legendValue = legend.value;
        }
      }
      return {
        key: key,
        error: this.errors && this.errors[key],
        legend: t(legendValue),
        legendClassName: legendClassName,
        role: opts.type === 'radio' ? 'radiogroup' : 'group',
        ariaRequired: opts.type === 'radio',
        hint: conditionalTranslate(getTranslationKey(field, key, 'hint')),
        options: _.map(field.options, function (obj) {
          let selected = false;
          let label;
          let value;
          let toggle;
          let child;
          let optionHint;

          if (typeof obj === 'string') {
            value = obj;
            label = 'fields.' + key + '.options.' + obj + '.label';
            optionHint = 'fields.' + key + '.options.' + obj + '.hint';
          } else {
            value = obj.value;
            label = obj.label || 'fields.' + key + '.options.' + obj.value + '.label';
            toggle = obj.toggle;
            child = obj.child;
            optionHint = obj.hint || 'fields.' + key + '.options.' + obj.value + '.hint';
          }

          if (this.values && this.values[key] !== undefined) {
            const selectedValue = this.values[key];
            selected = Array.isArray(selectedValue)
              ? selectedValue.indexOf(value) > -1
              : selectedValue === value;
          }

          return {
            label: t(label) || '',
            value: value,
            type: opts.type,
            selected: selected,
            toggle: toggle,
            child: child,
            optionHint: conditionalTranslate(optionHint) || ''
          };
        }, this),
        className: classNames(field),
        renderChild: renderChild.bind(this)
      };
    }

    // eslint-disable-next-line complexity
    function checkbox(key, opts) {
      opts = opts || {};
      const field = Object.assign({}, this.options.fields[key] || options.fields[key]);
      opts.required = opts.required || false;
      opts.toggle = field.toggle;
      let selected = false;
      const fieldLabel = field.label ? field.label : false;
      if (this.values && this.values[key] !== undefined) {
        selected = this.values[key].toString() === 'true';
      }
      return Object.assign(opts, {
        key: key,
        error: this.errors && this.errors[key],
        invalid: this.errors && this.errors[key] && opts.required,
        label: t(fieldLabel || 'fields.' + key + '.label'),
        selected: selected,
        className: classNames(field) || 'block-label',
        child: field.child,
        renderChild: renderChild.bind(this)
      });
    }

    const mixins = {
      'input-text': {
        path: 'partials/forms/input-text-group',
        renderWith: inputText
      },
      'input-text-compound': {
        path: 'partials/forms/input-text-group',
        renderWith: inputText,
        options: {
          compound: true
        }
      },
      'input-text-code': {
        path: 'partials/forms/input-text-group',
        renderWith: inputText,
        options: {
          className: 'input-code'
        }
      },
      'input-number': {
        path: 'partials/forms/input-text-group',
        renderWith: inputText,
        options: {
          pattern: '[0-9]*'
        }
      },
      'input-phone': {
        path: 'partials/forms/input-text-group',
        renderWith: inputText,
        options: {
          maxlength: 18
        }
      },
      'input-file': {
        path: 'partials/forms/input-text-group',
        renderWith: inputText,
        options: {
          type: 'file'
        }
      },
      textarea: {
        path: 'partials/forms/textarea-group',
        renderWith: inputText
      },
      'radio-group': {
        path: 'partials/forms/option-group',
        renderWith: optionGroup,
        options: {
          type: 'radio'
        }
      },
      'checkbox-group': {
        path: 'partials/forms/option-group',
        renderWith: optionGroup,
        options: {
          type: 'checkbox'
        }
      },
      select: {
        path: 'partials/forms/select',
        renderWith: inputText,
        options: optionGroup
      },
      checkbox: {
        path: 'partials/forms/checkbox',
        renderWith: checkbox
      },
      'checkbox-compound': {
        path: 'partials/forms/checkbox',
        renderWith: checkbox,
        options: {
          compound: true
        }
      },
      'checkbox-required': {
        path: 'partials/forms/checkbox',
        renderWith: checkbox,
        options: {
          required: true
        }
      },
      'input-submit': {
        handler: function () {
          return function (props) {
            props = (props || '').split(' ');
            const def = 'next';
            const value = props[0] || def;
            const id = props[1];

            const obj = {
              value: t('buttons.' + value),
              id: id
            };
            return compiled['partials/forms/input-submit'].render(obj);
          };
        }
      },
      'input-date': {
        handler: function () {
          /**
          * props: '[value] [id]'
          */
          return function (key) {
            const field = Object.assign({}, this.options.fields[key] || options.fields[key]);
            key = hoganRender(key, this);
            // Exact unless there is a inexact property against the fields key.
            const isExact = field.inexact !== true;

            let autocomplete = field.autocomplete || {};
            if (autocomplete === 'off') {
              autocomplete = {
                day: 'off',
                month: 'off',
                year: 'off'
              };
            } else if (typeof autocomplete === 'string') {
              autocomplete = {
                day: autocomplete + '-day',
                month: autocomplete + '-month',
                year: autocomplete + '-year'
              };
            }

            const parts = [];

            if (isExact) {
              const dayPart = compiled['partials/forms/input-text-group'].render(inputText.call(this, key + '-day', { pattern: '[0-9]*', min: 1, max: 31, maxlength: 2, hintId: key + '-hint', date: true, autocomplete: autocomplete.day }));
              parts.push(dayPart);
            }

            const monthPart = compiled['partials/forms/input-text-group'].render(inputText.call(this, key + '-month', { pattern: '[0-9]*', min: 1, max: 12, maxlength: 2, hintId: key + '-hint', date: true, autocomplete: autocomplete.month }));
            const yearPart = compiled['partials/forms/input-text-group'].render(inputText.call(this, key + '-year', { pattern: '[0-9]*', maxlength: 4, hintId: key + '-hint', date: true, formGroupClassName: 'form-group-year', autocomplete: autocomplete.year }));

            return parts.concat(monthPart, yearPart).join('\n');
          };
        }
      }
    };

    // loop through mixins object and attach their handler methods
    // to res.locals['mixin-name'].
    _.each(mixins, function (mixin, name) {
      const handler = _.isFunction(mixin.handler) ? mixin.handler : function () {
        return function (key) {
          this.options = this.options || {};
          this.options.fields = this.options.fields || {};
          key = hoganRender(key, this);
          return compiled[mixin.path]
            .render(mixin.renderWith.call(this, key, _.isFunction(mixin.options)
              ? mixin.options.call(this, key)
              : mixin.options
            ));
        };
      };
      res.locals[name] = handler;
    });

    res.locals.renderField = function () {
      return function (key) {
        if (key) {
          const fields = this.fields || res.locals.fields;
          const field = fields.find(f => f.key === key);
          if (field) {
            Object.assign(this, field);
          } else {
            throw new Error('Could not find field: ' + key);
          }
        }
        if (this.disableRender) {
          return null;
        }
        if (this.html) {
          return this.html;
        }
        const mixin = this.mixin || 'input-text';
        if (mixin && res.locals[mixin] && typeof res.locals[mixin] === 'function') {
          return res.locals[mixin]().call(Object.assign({}, res.locals), this.key);
        }
        throw new Error('Mixin: "' + mixin + '" not found');
      };
    };

    next();
  };
};
