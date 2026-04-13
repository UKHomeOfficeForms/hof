/* eslint-disable no-param-reassign, max-len, consistent-return */
'use strict';

const fs = require('fs');
const path = require('path');

const nunjucks = require('nunjucks');

const renderer = require('./render');

const PANELMIXIN = 'partials/mixins/panel';
const PARTIALS = [
  'partials/forms/input-text-group',
  'partials/forms/input-text-date',
  'partials/forms/input-submit',
  'partials/forms/grouped-inputs-select',
  'partials/forms/grouped-inputs-text',
  'partials/forms/select',
  'partials/forms/checkbox',
  'partials/forms/textarea-group',
  'partials/forms/option-group',
  'partials/forms/checkbox-group'
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

  function formatToArray(value) {
    // account for values being an array or a single object
    if (Array.isArray(value)) {
      return value;
    }
    if (value !== undefined && value !== null) {
      return [value];
    }
    return [];
  }

  function maxlength(field) {
    const validations = formatToArray(field.validate);
    const ml = validations.find(validation => validation?.type === 'maxlength' || validation?.type === 'exactlength');
    if (ml) {
      return Array.isArray(ml.arguments) ? ml.arguments[0] : ml.arguments;
    }
    return null;
  }

  function maxword(field) {
    const validations = formatToArray(field.validate);
    const mw = validations.find(validation => validation?.type === 'maxword');
    if (mw) {
      return Array.isArray(mw.arguments) ? mw.arguments[0] : mw.arguments;
    }
    return null;
  }

  function type(field) {
    return field.type || 'text';
  }

  function classNameString(name) {
    if (Array.isArray(name)) {
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

  function isPrefixOrSuffix(field, prefixOrSuffix) {
    const attributes = Array.isArray(field) ? field : [];
    const item = attributes.find(attribute => attribute[prefixOrSuffix] !== undefined);
    return item ? item[prefixOrSuffix] : undefined;
  }

  return function (req, res, next) {
    const roots = [].concat(req.app.get('views')).concat(options.viewsDirectory);
    const View = req.app.get('view');

    // use nunjucks environment for resolving includes/partials from the
    // project's views roots for this request.
    const nunjucksEnv = (req && req.app && req.app.locals && req.app.locals.nunjucksEnv);


    // helper: resolve a template file path by trying express View, configured viewsDirectory and app roots
    function resolveTemplateFile(name) {
      const viewExt = '.' + (options.viewEngine || 'html');
      const engines = {};
      engines[viewExt] = {};
      const view = new View(name, {
        defaultEngine: options.viewEngine,
        root: roots,
        engines: engines
      });

      const candidates = [];
      if (view && view.path) {
        candidates.push(view.path);
        candidates.push(view.path + viewExt);
      }
      if (options.viewsDirectory) {
        candidates.push(path.join(options.viewsDirectory, name + viewExt));
        candidates.push(path.join(options.viewsDirectory, name));
      }
      (roots || []).forEach(r => {
        candidates.push(path.join(r, name + viewExt));
        candidates.push(path.join(r, name));
      });

      const uniq = Array.from(new Set(candidates.map(p => path.resolve(p))));

      const found = uniq.find(p => fs.existsSync(p) && fs.lstatSync(p).isFile());
      if (!found) {
        throw new Error('Could not find template file: ' + name + ' (checked: ' + uniq.join(', ') + ')');
      }
      return found;
    }

    // wrap in try catch to throw an error if any one template cannot be resolved
    try {
      PARTIALS.forEach(relativeTemplatePath => {
        if (compiled[relativeTemplatePath]) return;
        const filePath = resolveTemplateFile(relativeTemplatePath);
        compiled[relativeTemplatePath] = fs.readFileSync(filePath, 'utf8').toString();
      });
    } catch (e) {
      return next(e);
    }

    const nunjucksRender = renderer(res);

    const t = function (key) {
      return nunjucksRender(req.translate(options.sharedTranslationsKey + key), this);
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

    // tries multiple candidate paths and caches source
    function readTemplate(name) {
      if (!name) { return ''; }
      if (templateCache[name]) { return templateCache[name]; }

      // if compiled preloaded partial exists, return that
      if (compiled[name]) {
        templateCache[name] = compiled[name];
        return compiled[name];
      }

      // if looks like a raw template string, return as-is
      if (typeof name === 'string' && (name.indexOf('<') !== -1 || name.indexOf('{%') !== -1 || name.indexOf('{{') !== -1)) {
        templateCache[name] = name;
        return name;
      }

      const viewExt = '.' + (options.viewEngine || 'html');
      const candidates = [];
      candidates.push(path.resolve(name));
      candidates.push(path.resolve(name + viewExt));
      if (options.viewsDirectory) {
        candidates.push(path.resolve(options.viewsDirectory, name + viewExt));
        candidates.push(path.resolve(options.viewsDirectory, name));
      }
      (roots || []).forEach(r => {
        candidates.push(path.resolve(r, name + viewExt));
        candidates.push(path.resolve(r, name));
      });

      // deduplicate and find existing file
      const uniq = Array.from(new Set(candidates));
      let found;
      for (let i = 0; i < uniq.length; i++) {
        const p = uniq[i];
        if (fs.existsSync(p) && fs.lstatSync(p).isFile()) {
          found = p;
          break;
        }
      }
      // fallback to express View resolution
      if (!found) {
        const engines = {};
        engines[viewExt] = {};
        const view = new View(name, {
          defaultEngine: options.viewEngine,
          root: roots,
          engines: engines
        });
        if (view && view.path && fs.existsSync(view.path)) {
          found = view.path;
        }
      }

      if (!found) {
        throw new Error('Could not find template file: ' + name + ' (checked: ' + uniq.join(', ') + ')');
      }

      const data = fs.readFileSync(found, 'utf8').toString();
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
      if (!this.child) return '';

      if (this.child === 'html') {
        try {
          const key = this.toggle;
          const field = res.locals.fields.find(f => f.key === key);
          if (!field.html) {
            throw new Error(`html property not set on field: ${key}`);
          }
          return new nunjucks.runtime.SafeString(field.html);
        } catch (err) {
          next(err);
        }
      }
      // Look for mixin attached to res.locals
      const mixin = res.locals[this.child];
      if (typeof mixin === 'function') {
        // call mixin with toggle context
        const rendered = mixin.call(res.locals, this.toggle);
        return new nunjucks.runtime.SafeString(rendered);
      }
      return '';
    }

    function renderChild(option) {
      if (!option.child) return '';

      const templateString = getTemplate(option.child, option.toggle);

      const ctx = {
        ...res.locals,
        ...option,
        renderMixin: renderMixin.bind(option)
      };
      // render with nunjucks environment so {% include %} works against roots
      return nunjucksEnv.renderString(templateString, ctx);
    }

    // eslint-disable-next-line complexity
    function inputText(key, extension) {
      extension = extension || {};

      const field = Object.assign({}, this.options.fields[key] || options.fields[key]);
      const hKey = getTranslationKey(field, key, 'hint');
      const lKey = getTranslationKey(field, key, 'label');
      const hint = conditionalTranslate(hKey);
      const required = isRequired(field);
      const labelClassName = classNames(field, 'labelClassName');
      const autocomplete = field.autocomplete || extension.autocomplete || 'off';
      const selectItems = field.options?.map(option => ({
        value: option.value,
        text: t(option.label),
        selected: option.selected
      }));
      // govUk components set the attribute property as { attribute: value }
      // but in hof, some attributes can be found in the field.validate object as [attribute, { type: attribute, value: value }]
      // and field.attributes object with the format [{ type: attribute, value: value }]
      const rules = formatToArray(field.validate);
      const validation = rules.reduce((acc, rule) => {
        // convert required, maxlength, min and max attributes in field.validate object to govuk component compatible format
        if (rule === 'required') {
          acc['aria-required'] = 'true';
        } else if (field.maxlengthAttribute && rule.type === 'maxlength' || rule.type === 'min' || rule.type === 'max') {
          acc[rule.type] = rule.arguments;
        }
        return acc;
      }, { 'aria-required': 'false' });

      // convert field.attributes object into govuk component compatible format
      const baseAttributes = (field.attributes || []).reduce((acc, attr) => {
        if (attr.attribute) {
          acc[attr.attribute] = attr.value;
        }
        return acc;
      }, {});

      const attributes = {
        ...baseAttributes,
        ...validation,
        ...(this.errors && this.errors[key] && { 'aria-invalid': 'true' })
      };

      const disabled = field.disabled;

      return Object.assign({}, extension, {
        id: key,
        className: extension.className || classNames(field),
        type: extension.type || type(field),
        value: this.values && this.values[key],
        label: t(lKey),
        labelClassName: labelClassName,
        formGroupClassName: classNames(field, 'formGroupClassName') || extension.formGroupClassName,
        hint: hint,
        amountWithUnitSelectItemClassName: 'grouped-inputs__item',
        hintId: extension.hintId || (hint ? key + '-hint' : null),
        error: this.errors && this.errors[key],
        maxlengthAttribute: field.maxlengthAttribute === true,
        maxlength: maxlength(field) || extension.maxlength,
        maxword: maxword(field) || extension.maxword,
        required: validation.required || required,
        pattern: validation.pattern || extension.pattern,
        date: extension.date,
        amountWithUnitSelect: extension.amountWithUnitSelect,
        autocomplete: autocomplete,
        child: field.child,
        isPageHeading: field.isPageHeading,
        attributes: attributes,
        disabled: disabled,
        prefix: isPrefixOrSuffix(field.attributes, 'prefix'),
        suffix: isPrefixOrSuffix(field.attributes, 'suffix'),
        isMaxlengthOrMaxword: maxlength(field) || extension.maxlength || maxword(field) || extension.maxword,
        items: selectItems,
        renderChild: renderChild.bind(this)
      });
    }

    function optionGroup(key, opts, pKey = key) {
      opts = opts || {};
      const field = Object.assign({}, this.options.fields[key] || options.fields[key] || {});
      const legend = field.legend;
      const detail = field.detail;
      const warningValue = 'fields.' + key + '.warning';
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

      // map options into a structure suitable for the nunjucks partial that will render them
      const optsArr = (field.options || []).map(obj => {
        let selected = false;
        let label;
        let value;
        let toggle;
        let child;
        let optionHint;
        let useHintText;

        if (typeof obj === 'string') {
          value = obj;
          // pKey - optional param that demotes parent key for group components - set to key param val by default
          label = 'fields.' + pKey + '.options.' + obj + '.label';
          optionHint = 'fields.' + pKey + '.options.' + obj + '.hint';
        } else {
          value = obj.value;
          label = obj.label || 'fields.' + pKey + '.options.' + obj.value + '.label';
          toggle = obj.toggle;
          child = obj.child;
          useHintText = obj.useHintText;
          optionHint = obj.hint || 'fields.' + pKey + '.options.' + obj.value + '.hint';
        }

        if (this.values && this.values[key] !== undefined) {
          const selectedValue = this.values[key];
          selected = Array.isArray(selectedValue)
            ? selectedValue.indexOf(value) > -1
            : selectedValue === value;
        }

        // Translate/format label and optionHint using helpers so they are ready for nunjucks partial
        const renderedLabel = function () {
          try { return t.call(this, label) || ''; } catch (e) { return ''; }
        }.call(this);

        const renderedOptionHint = function () {
          if (useHintText) return optionHint;
          try {
            return conditionalTranslate.call(this, optionHint) || '';
          } catch (e) {
            return '';
          }
        }.call(this);

        return {
          label: renderedLabel,
          value: value,
          type: opts.type,
          selected: selected,
          radioOption: opts.type === 'radio',
          toggle: toggle,
          child: child,
          optionHint: renderedOptionHint
        };
      }, this);

      return {
        key: key,
        error: this.errors && this.errors[key],
        legend: t(legendValue),
        legendClassName: legendClassName,
        role: opts.type === 'radio' ? 'radiogroup' : 'group',
        isPageHeading: field.isPageHeading,
        isWarning: field.isWarning,
        warning: t(warningValue),
        detail: detail ? detail : '',
        hint: conditionalTranslate(getTranslationKey(field, key, 'hint')),
        options: optsArr,
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
        hint: conditionalTranslate(getTranslationKey(field, key, 'hint')),
        selected: selected,
        className: classNames(field) || 'govuk-label govuk-checkboxes__label',
        child: field.child,
        renderChild: renderChild.bind(this)
      });
    }

    const mixins = {
      inputText: {
        path: 'partials/forms/input-text-group',
        renderWith: inputText
      },
      inputTextCompound: {
        path: 'partials/forms/input-text-group',
        renderWith: inputText,
        options: {
          compound: true
        }
      },
      inputTextCode: {
        path: 'partials/forms/input-text-group',
        renderWith: inputText,
        options: {
          className: 'input-code'
        }
      },
      inputNumber: {
        path: 'partials/forms/input-text-group',
        renderWith: inputText,
        options: {
          pattern: '[0-9]*'
        }
      },
      inputPhone: {
        path: 'partials/forms/input-text-group',
        renderWith: inputText,
        options: {
          maxlength: 18,
          className: 'govuk-input'
        }
      },
      inputFile: {
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
      radioGroup: {
        path: 'partials/forms/option-group',
        renderWith: optionGroup,
        options: {
          type: 'radio'
        }
      },
      'checkbox-group': {
        path: 'partials/forms/checkbox-group',
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
      inputSubmit: {
        handler: function (props) {
          props = (props || '').split(' ');
          const def = 'next';
          const value = props[0] || def;
          const id = props[1];
          const obj = {
            value: t('buttons.' + value),
            id: id,
            text: t('buttons.' + value)
          };
          const template = `${compiled['partials/forms/input-submit']}{{ inputSubmit(value, text, id) }}`;
          return new nunjucks.runtime.SafeString(
            nunjucksEnv.renderString(template, obj)
          );
        }
      },
      'input-date': {
        handler: function () {
          /**
          * props: '[value] [id]'
          */
          return function (key) {
            const field = Object.assign({}, this.options.fields[key] || options.fields[key]);
            key = nunjucksRender(key, this);
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
            const isThisRequired = field.validate ? field.validate.indexOf('required') > -1 : false;
            const formGroupClassName = (field.formGroup && field.formGroup.className) ? field.formGroup.className : '';
            const classNameDay = (field.controlsClass && field.controlsClass.day) ? field.controlsClass.day : 'govuk-date-input__input govuk-input--width-2';
            const classNameMonth = (field.controlsClass && field.controlsClass.month) ? field.controlsClass.month : 'govuk-date-input__input govuk-input--width-2';
            const classNameYear = (field.controlsClass && field.controlsClass.year) ? field.controlsClass.year : 'govuk-date-input__input govuk-input--width-4';

            const parts = [];

            if (isExact) {
              const dayPart = nunjucksEnv.renderString(compiled['partials/forms/input-text-date'], inputText.call(this, key + '-day', { inputmode: 'numeric', min: 1, max: 31, maxlength: 2, hintId: key + '-hint', date: true, autocomplete: autocomplete.day, formGroupClassName, className: classNameDay, isThisRequired }));
              parts.push(dayPart);
            }

            const monthPart = nunjucksEnv.renderString(compiled['partials/forms/input-text-date'], inputText.call(this, key + '-month', { inputmode: 'numeric', min: 1, max: 12, maxlength: 2, hintId: key + '-hint', date: true, autocomplete: autocomplete.month, formGroupClassName, className: classNameMonth, isThisRequired }));
            const yearPart = nunjucksEnv.renderString(compiled['partials/forms/input-text-date'], inputText.call(this, key + '-year', { inputmode: 'numeric', maxlength: 4, hintId: key + '-hint', date: true, autocomplete: autocomplete.year, formGroupClassName, className: classNameYear, isThisRequired }));

            return parts.concat(monthPart, yearPart).join('\n');
          };
        }
      },
      'input-amount-with-unit-select': {
        handler: function () {
          return function (key) {
            key = (key === '{{key}}' || key === '' || key === undefined) ? nunjucksRender(key, this) : key;
            const field = Object.assign({}, this.options.fields[key] || options.fields[key]);

            let autocomplete = field.autocomplete || 'off';
            if (autocomplete === 'off') {
              autocomplete = { amount: 'off' };
            } else if (typeof autocomplete === 'string') {
              autocomplete = { amount: autocomplete + '-amount' };
            }

            const formGroupClassName = (field.formGroup && field.formGroup.className) ? field.formGroup.className : '';
            const classNameAmount = (field.controlsClass && field.controlsClass.amount) ? field.controlsClass.amount : 'govuk-input--width-3';
            const classNameUnit = (field.controlsClass && field.controlsClass.unit) ? field.controlsClass.unit : 'govuk-input--width-5';

            const parts = [];

            // basically does the '_.each(mixins, function (mixin, name)' part manually (which renders the HTML
            // for both child components and looks for a 'renderWith' and optional 'Options' method to use)
            const amountPart = nunjucksEnv.renderString(compiled['partials/forms/grouped-inputs-text'], inputText.call(this,
              key + '-amount', {
                formGroupClassName,
                autocomplete: autocomplete.amount,
                className: classNameAmount,
                amountWithUnitSelect: true
              }
            ));

            const unitPart = nunjucksEnv.renderString(compiled['partials/forms/grouped-inputs-select'], inputText.call(this, key + '-unit',
              optionGroup.call(this,
                key + '-unit', {
                  formGroupClassName,
                  className: classNameUnit,
                  amountWithUnitSelect: true
                },
                key
              )));

            return parts.concat(amountPart, unitPart).join('\n');
          };
        }
      }
    };
    Object.entries(mixins || {}).forEach(([name, mixin]) => {
      if (typeof mixin.handler === 'function') {
        res.locals[name] = mixin.handler.bind(res.locals);
        return;
      }

      // for mixins with renderWith
      res.locals[name] = function (key) {
        const ctxThis = this || res.locals;   // ensure context
        ctxThis.options = ctxThis.options || {};
        ctxThis.options.fields = ctxThis.options.fields || {};

        key = nunjucksRender(key, ctxThis);

        const rendered = mixin.renderWith.call(
          ctxThis,
          key,
          typeof mixin.options === 'function' ? mixin.options.call(ctxThis, key) : mixin.options
        );
        const ctx = Object.assign({}, res.locals, rendered);
        // try to render by template name first so relative imports/includes resolve via loader roots
        const viewExt = (options && options.viewEngine) ? '.' + options.viewEngine : '.html';
        const templateName = mixin.path + viewExt;
        try {
          return new nunjucks.runtime.SafeString(
            nunjucksEnv.render(templateName, ctx)
          );
        } catch (err) {
          // fallback to rendering the compiled string (older behaviour)
          return new nunjucks.runtime.SafeString(
            nunjucksEnv.renderString(compiled[mixin.path], ctx)
          );
        }
      }.bind(res.locals);
    });

    function renderFieldImpl(key) {
      // Accept either:
      // - a string key
      // - a field object (with .key and other props)
      // - undefined (use this as already-populated field)
      const baseCtx = this;
      const fields = (baseCtx && baseCtx.options && baseCtx.options.fields) || res.locals.fields || [];

      if (key && typeof key === 'object') {
        // called with the full field object
        Object.assign(this, key);
      } else if (typeof key === 'string' && key.length) {
        const field = fields.find(f => f.key === key);
        if (!field) {
          throw new Error('Could not find field: ' + key);
        }
        key = field;
      } else {
        key = baseCtx;
      }

      const ctx = Object.assign({}, res.locals, baseCtx, key);

      if (ctx.disableRender) {
        return null;
      }

      if (ctx.html) {
        return ctx.html;
      }

      const mixin = key.mixin || 'inputText';

      if (mixin && res.locals[mixin] && typeof res.locals[mixin] === 'function') {
        return res.locals[mixin].call(ctx, ctx.key || (ctx && ctx.key));
      }
      throw new Error('Mixin: "' + mixin + '" not found');
    }

    res.locals.renderField = function () {
      if (arguments.length === 0) {
        // return a callable for block-style usage
        const self = this;
        return function (key) {
          return renderFieldImpl.call(self, key);
        };
      }

      // handle (options, key)
      if (arguments.length === 2) {
        const opts = arguments[0];
        const key = arguments[1];

        const ctx = Object.create(this);
        ctx.options = opts;

        return renderFieldImpl.call(ctx, key);
      }

      // direct call
      return renderFieldImpl.call(this, arguments[0]);
    };

    next();
  };
};
