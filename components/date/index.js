'use strict';

const _ = require('lodash');
const path = require('path');
const getFields = require('./fields');

const TEMPLATE = path.resolve(__dirname, './templates/date.html');

// utility function taking the req.body, fields and key,
// returns a map of values in the format:
// {
//   day: '01',
//   month: '01',
//   year: '2017'
// }
const getParts = (body, fields, key) =>
  _.mapKeys(_.pick(body, Object.keys(fields)), (value, fieldKey) =>
    fieldKey.replace(`${key}-`, '')
  );

// accepts a date value in the format YYYY-MM-DD and fields config,
// returns a map of key: value pairs for the intermedate fields
const getPartsFromDate = (date, fields) =>
  date.split('-')
    .slice()
    .reverse()
    .reduce((obj, value, index) => Object.assign({}, obj, {
      [fields[index]]: value
    }), {});

// preprend '0' if number is only a single digit
const pad = num => num !== '' && num.length < 2 ? `0${num}` : num;

const conditionalTranslate = (key, translate) => {
  let result = translate(key);
  if (result === key) {
    result = null;
  }
  return result;
};

const getLegendClassName = field => field && field.legend && field.legend.className || '';

module.exports = (key, opts) => {
  if (!key) {
    throw new Error('Key must be passed to date component');
  }
  const options = opts || {};
  const template = options.template ?
    path.resolve(__dirname, options.template) :
    TEMPLATE;
  const fields = getFields(key);

  options.validate = _.uniq(options.validate ? ['date'].concat(options.validate) : ['date']);

  let dayOptional = !!options.dayOptional;
  const monthOptional = !!options.monthOptional;

  if (monthOptional) {
    dayOptional = true;
  }

  // take the 3 date parts, padding or defaulting
  // to '01' if applic, then create a date value in the
  // format YYYY-MM-DD. Save to req.body for processing
  const preProcess = (req, res, next) => {
    const parts = getParts(req.body, fields, key);
    if (_.some(parts, part => part !== '')) {
      if (dayOptional && parts.day === '') {
        parts.day = '01';
      } else {
        parts.day = pad(parts.day);
      }
      if (monthOptional && parts.month === '') {
        parts.month = '01';
      } else {
        parts.month = pad(parts.month);
      }
      req.body[key] = `${parts.year}-${parts.month}-${parts.day}`;
    }
    next();
  };

  // defaultFormatters on the base controller replace '--' with '-' on the process step.
  // This ensures having the correct number of hyphens,
  //  so values do not jump from year to month when the page reloads.
  const postProcess = (req, res, next) => {
    req.form.values[key] = req.body[key];
    next();
  };

  // if date field is included in errorValues, extend
  // errorValues with the individual components
  const preGetErrors = (req, res, next) => {
    const errorValues = req.sessionModel.get('errorValues');
    if (errorValues && errorValues[key]) {
      req.sessionModel.set('errorValues',
        Object.assign({}, errorValues, getPartsFromDate(errorValues[key], Object.keys(fields)))
      );
    }
    next();
  };

  // if date field has any validation error, also add errors
  // for the three child components. null type as we don't want to show
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

  // if date value is set, split its parts and assign to req.form.values.
  // This is extended with errorValues if they are present
  const postGetValues = (req, res, next) => {
    const date = req.form.values[key];
    if (date) {
      Object.assign(
        req.form.values,
        getPartsFromDate(date, Object.keys(fields)),
        req.sessionModel.get('errorValues') || {}
      );
    }
    next();
  };

  // render the template to a string, assign the html output
  // to the date field in res.locals.fields
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
    const error = req.form.errors && req.form.errors[key];
    res.render(template, { key, legend, legendClassName, hint, error }, (err, html) => {
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
