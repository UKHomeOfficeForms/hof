'use strict';

const _ = require('underscore');
const deepCloneMerge = require('deep-clone-merge');

let globals = {
  isArray(array) {
    return Array.isArray(array);
  },

  isObject(object) {
    return object !== null && typeof object === 'object' && !Array.isArray(object);
  },

  isString(string) {
    return typeof string === 'string';
  },

  isNumber(number) {
    return typeof number === 'number';
  },

  isBoolean(bool) {
    return typeof bool === 'boolean';
  },

  startsWith(string, substring) {
    return typeof string === 'string' && string.startsWith(substring);
  },

  endsWith(string, substring) {
    return typeof string === 'string' && string.endsWith(substring);
  },

  merge(...source) {
    return _.pick(deepCloneMerge(...source), val => val !== undefined);
  },

  set(object, key, value) {
    return object[key] = value;
  },

  substring(string, start, end) {
    return typeof string === 'string' ? string.substring(start, end) : '';
  },

  getParams(ctx, params, ...base) {
    let opts = params && ctx(`options.fields.${params.id}`);
    let mergedItems = {};
    if (opts && opts.items && params && params.items) {
      let indexedParamItems = _.isArray(params.items) ? _.indexBy(params.items, 'value') : params.items;
      mergedItems = opts.items.map(i => {
        if (typeof i !== 'object') return i = { value: i };
        return deepCloneMerge(i, indexedParamItems[i.value]);
      });
    }

    return deepCloneMerge(...base, opts, params, mergedItems);
  },

  getValidator(ctx, params, type) {
    if (!params.validate) return;
    if (params.validate === type) return { type };
    if (!Array.isArray(params.validate)) return;
    if (params.validate.includes(type)) return { type };
    let validator = params.validate.filter(val => val.type === type)[0];
    if (!validator) return;
    return {
      type,
      arguments: Array.isArray(validator.arguments) ?
        validator.arguments : validator.arguments ?
          [validator.arguments] : []
    };

  },

  getAttributes(ctx, params, attributes) {
    return globals.merge(attributes, params.attributes);
  },

  getValidatorAttribute(ctx, params, type, value = true, falseValue = (typeof value === 'boolean' ? false : undefined)) {
    let validator = globals.getValidator(ctx, params, type);
    if (!validator) return falseValue;
    if (typeof value === 'number') return validator.arguments[value];
    return value;
  },

  getItems(ctx, params, value, required, setIdsBasedOnValues, defaults) {
    let translate = ctx('translate');
    let items = params.items || params.options || defaults || [];
    let conditionals = params.conditionals || {};
    let contentKey = 'fields.' + (params.contentKey || params.id);
    let placeholder = params.placeholder;
    if (placeholder === true) placeholder = { value: '' };
    if (placeholder) {
      let key = placeholder.key || contentKey + '.placeholder';
      placeholder.text = translate(key, { default: ' ' });
      if (required) placeholder.disabled = true;
      if (value === undefined || value === '') placeholder.selected = true;
      items = [placeholder].concat(items);
    }
    items = items.map((item, index) => {
      if (typeof item === 'string') item = { value: item };

      if (item.divider) {
        if (typeof item.divider !== 'string') {
          let key = item.key || [
            contentKey + '.divider.label',
            'fields.default.divider.label'
          ];
          item.divider = translate(key);
        }
        return item;
      }

      if (!item.text && !item.html) {
        let key = item.key || [
          contentKey + '.items.' + item.value + '.label',
          'fields.default.items.' + item.value + '.label'
        ];
        item.html = item.text = translate(key);
      }
      if (!item.name) item.name = params.id;
      if (item.value !== undefined) {
        if (Array.isArray(value) && value.includes(item.value)) item.selected = item.checked = true;
        if (value === item.value) item.selected = item.checked = true;
      }
      let conditional = conditionals[item.value];
      if (conditional) {
        if (!params.inline) {
          item.conditional = typeof conditional === 'string' ? { html: conditional } : conditional;
        } else if (conditional.id) {
          item.attributes = item.attributes || {};
          item.attributes['data-aria-controls'] = conditional.id;
        }
      }
      if (setIdsBasedOnValues) {
        let cleanedValue = String(item.value).replace(/[^a-zA-Z0-9]+/g, '');
        if (cleanedValue) item.id = params.id + '-' + cleanedValue;
      }
      if (item.id) {
        item.label = globals.merge({
          attributes: { id: item.id + '-label' }
        }, item.label);
      }

      // override id of first item to be field name for accessibility
      if (setIdsBasedOnValues && index === 0) item.id = params.id;

      if (!item.hint || (!item.hint.html && !item.hint.text)) {
        let key = [
          contentKey + '.items.' + item.value + '.hint',
          'fields.default.items.' + item.value + '.hint'
        ];
        const html = translate(key, { self: false });
        if (html) {
          if (!item.hint) item.hint = {};
          item.hint.html = html;
        }
      }

      return item;
    });

    return items;
  },

  getOptions() {
    let translate = ctx('translate');
    let options = {};
    if (typeof params[type] === 'string') {
      options = {
        text: params[type]
      };
    } else {
      options = Object.assign({}, params[type]);
      if (!options.text && !options.html) {
        let contentKey = 'fields.' + (params.contentKey || params.id);
        let key = options.key || contentKey + '.' + type;
        options.html = translate(key, { self: !optional });
        if (optional && !options.html) return undefined;
      }
    }
    return options;
  },

  translateExtraFieldContent() {
    let translate = ctx('translate');
    let contentKey = 'fields.' + (params.contentKey || params.id);
    let key = contentKey + '.' + fieldKey;
    const translation = translate(key, { self: !optional });
    return translation == `[${key}]` ? undefined : translation;
  },

  getValue(ctx, params) {
    let errorValue = ctx('errorValues.' + params.id);
    return errorValue !== undefined ? errorValue : ctx('values.' + params.id);
  },

  buildErrorMessage(ctx, error, header = false) {
    if (error.message) return error.message;
    if (header && error.headerMessage) return error.headerMessage;

    let translate = ctx('translate');

    let contentkey = ctx('options.fields.' + error.key + '.contentKey') || error.key;

    let keys = [];

    if (header) keys.push(
      'fields.' + contentkey + '.validation.' + error.type + '_header',
      'validation.' + contentkey + '.' + error.type + '_header',
      'fields.' + contentkey + '.validation.default_header',
      'validation.' + contentkey + '.default_header'
    );

    if (header && error.errorGroup) keys.push(
      'fields.' + error.errorGroup + '.validation.' + error.type + '_header',
      'validation.' + error.errorGroup + '.' + error.type + '_header',
      'fields.' + error.errorGroup + '.validation.default_header',
      'validation.' + error.errorGroup + '.default_header'
    );

    keys.push(
      'fields.' + contentkey + '.validation.' + error.type,
      'validation.' + contentkey + '.' + error.type,
      'fields.' + contentkey + '.validation.default',
      'validation.' + contentkey + '.default'
    );

    if (error.errorGroup) keys.push(
      'fields.' + error.errorGroup + '.validation.' + error.type,
      'validation.' + error.errorGroup + '.' + error.type,
      'fields.' + error.errorGroup + '.validation.default',
      'validation.' + error.errorGroup + '.default'
    );

    keys.push(
      'validation.' + error.type,
      'validation.default'
    );

    let context = Object.assign(
      {},
      ctx(),
      {
        error,
        key: 'fields.' + contentkey,
        label: translate('fields.' + contentkey + '.label').toLowerCase(),
        legend: translate('fields.' + contentkey + '.legend').toLowerCase(),
        name: translate([
          'fields.' + contentkey + '.name',
          'fields.' + contentkey + '.label',
          'fields.' + contentkey + '.legend'
        ]).toLowerCase()
      },
      error.args
    );

    return translate(keys, { context, self: false });
  },

  getError(ctx, params) {
    let error = ctx('errors.' + params.id);

    let translate = ctx('translate');

    let fieldErrorGroup = ctx('options.fields.' + params.id + '.errorGroup');
    if (fieldErrorGroup) {
      if (error) return true;
      let errorGroupError = fieldErrorGroup && ctx('errors.' + fieldErrorGroup);
      if (errorGroupError && !errorGroupError.errorGroup) return true;
      return;
    }

    if (!error) return;

    let govukError = {
      id: params.id + '-error',
      visuallyHiddenText: translate('govuk.error'),
      text: globals.buildErrorMessage(ctx, error)
    };

    return govukError;
  },

  getErrorSummary(ctx) {
    let errors = ctx('errorlist');
    if (!errors) return;
    let errorSummary = [];
    for (let error of errors) {
      errorSummary.push({
        href: '#' + (error.field || error.key),
        text: globals.buildErrorMessage(ctx, error, true)
      });
    }

    return errorSummary;
  }
};

let addGlobals = nunjucksEnv => {
  for (const name in globals) nunjucksEnv.addGlobal(name, globals[name]);
};

module.exports = {
  globals,
  addGlobals
}
