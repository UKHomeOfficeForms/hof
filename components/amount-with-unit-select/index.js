'use strict';

const _ = require('lodash');
const path = require('path');
const getFields = require('./fields');

const TEMPLATE = path.resolve(__dirname, './templates/amount-with-unit-select.html')

// utility function taking the req.body, fields and key,
// returns a map of values in the format:
// {
//   amount: '1',
//   unit: 'litres',
// }

const getParts = (body, fields, key) =>
  _.mapKeys(_.pick(body, Object.keys(fields)), (value, fieldKey) =>
    fieldKey.replace(`${key}-`, '')
  );

// accepts a amount-with-unit-select value in the format [Amount]-[Unit] and fields config,
// returns a map of key: value pairs for the intermediate fields
const getPartsFromAmountWithUnitSelect = (amount, fields) =>
  amount.split('-')
    .slice()
    .reverse()
    .reduce((obj, value, index) => Object.assign({}, obj, {
      [fields[index]]: value
    }), {});

const conditionalTranslate = (key, translate) => {
  let result = translate(key);
  if (result === key) {
    result = null;
  }
  return result;
};

const getLegendClassName = field => field && field.legend && field.legend.className || '';
const getIsPageHeading = field => field && field.isPageHeading || '';

module.exports = (key, opts) => {
  if (!key) {
    throw new Error('Key must be passed to amount-with-unit-select component');
  }
  const options = opts || {};
  const template = options.template ?
    path.resolve(__dirname, options.template) :
    TEMPLATE;
  const fields = getFields(key);

  options.validate = _.uniq(options.validate ? ['amount-with-unit-select'].concat(options.validate) : ['amount-with-unit-select']);

  // take the 2 parts (amount and unit),
  // then create a amount-with-unit-select value in the format [Amount]-[Unit] (e.g. 5-Kilograms). 
  // Save to req.body for processing
  const preProcess = (req, res, next) => {
    const parts = getParts(req.body, fields, key);
      req.body[key] = `${parts.amount}-${parts.unit}`;
    next();
  };

  // defaultFormatters on the base controller replace '--' with '-' on the process step.
  // This ensures having the correct number of hyphens, so values do not jump from unit to amount.
  // This should only be done on a partially completed amount-with-unit-select field otherwise the validation messages break.
  const postProcess = (req, res, next) => {
    const value = req.form.values[key];
    if (value) {
      req.form.values[key] = req.body[key];
    }
    next();
  };

  // if amount-with-unit-select field is included in errorValues, extend
  // errorValues with the individual components
  const preGetErrors = (req, res, next) => {
    const errorValues = req.sessionModel.get('errorValues');
    if (errorValues && errorValues[key]) {
      req.sessionModel.set('errorValues',
        Object.assign({}, errorValues, getPartsFromAmountWithUnitSelect(errorValues[key], Object.keys(fields)))
      );
    }
    next();
  };

  // if amount-with-unit-select field has any validation error, also add errors
  // for the two child components. null type as we don't want to show
  // duplicate messages
  const postGetErrors = (req, res, next) => {
    const errors = req.sessionModel.get('errors');
    if (errors && errors[key]) {
      Object.assign(req.form.errors, Object.keys(fields).reduce((obj, field) =>
        Object.assign({}, obj, { [field]: { type: null } })
      , {}));
    }
    next();
  };

  // if amount-with-unit-select value is set, split its parts and assign to req.form.values.
  // This is extended with errorValues if they are present
  const postGetValues = (req, res, next) => {
    const amount_with_unit_select = req.form.values[key];
    if (amount_with_unit_select) {
      Object.assign(
        req.form.values,
        getPartsFromAmountWithUnitSelect(amount_with_unit_select, Object.keys(fields)),
        req.sessionModel.get('errorValues') || {}
      );
    }
    next();
  };

  // render the template to a string, assign the html output
  // to the amount-with-unit-select field in res.locals.fields
  const preRender = (req, res, next) => {
    Object.assign(req.form.options.fields, _.mapValues(fields, (v, k) => {
      const rawKey = k.replace(`${key}-`, '');
      const labelKey = `fields.${key}.parts.${rawKey}`;
      const label = req.translate(labelKey);
      return Object.assign({}, v, {
        label: label === labelKey ? v.label : label
      });
    }));
    const legend = conditionalTranslate(`fields.${key}.legend`, req.translate);
    const hint = conditionalTranslate(`fields.${key}.hint`, req.translate);
    const legendClassName = getLegendClassName(options);
    const isPageHeading = getIsPageHeading(options);
    const error = req.form.errors && req.form.errors[key];
    res.render(template, { key, legend, legendClassName, isPageHeading, hint, error }, (err, html) => {
      if (err) {
        next(err);
      } else {
        const field = res.locals.fields.find(f => f.key === key);
        Object.assign(field, { html });
        next();
      }
    });
  };

  // return config extended with hooks
  return Object.assign({}, options, {
    hooks: {
      'pre-process': preProcess,
      'post-process': postProcess,
      'pre-getErrors': preGetErrors,
      'post-getErrors': postGetErrors,
      'post-getValues': postGetValues,
      'pre-render': preRender
    }
  });
};