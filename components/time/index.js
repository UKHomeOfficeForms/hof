'use strict';

const _ = require('lodash');
const path = require('path');
const getFields = require('./fields');

const TEMPLATE = path.resolve(__dirname, './templates/time.html');

// utility function taking the req.body, fields and key,
// returns a map of values in the format:
// {
//   hour: '12',
//   minute: '01',
// }

const getParts = (body, fields, key) =>
  _.mapKeys(_.pick(body, Object.keys(fields)), (value, fieldKey) =>
    fieldKey.replace(`${key}-`, '')
  );

// accepts a time value in the format kk-mm and fields config,
// returns a map of key: value pairs for the intermedate fields
const getPartsFromTime = (time, fields) =>
  time.split(':')
    .slice()
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
const getIsPageHeading = field => field && field.isPageHeading || '';

module.exports = (key, opts) => {
  if (!key) {
    throw new Error('Key must be passed to time component');
  }
  const options = opts || {};
  const template = options.template ?
    path.resolve(__dirname, options.template) :
    TEMPLATE;
  const fields = getFields(key);

  options.validate = _.uniq(options.validate ? ['time'].concat(options.validate) : ['time']);

  let hourOptional = !!options.hourOptional;
  const minuteOptional = !!options.minuteOptional;

  if (minuteOptional) {
    hourOptional = true;
  }

  // take the 2 time parts, padding or defaulting
  // if applicable, then create a time value in the
  // format kk:mm. Save to req.body for processing
  const preProcess = (req, res, next) => {
    const parts = getParts(req.body, fields, key);
    if (_.some(parts, part => part !== '')) {
      if (hourOptional && parts.hour === '') {
        parts.hour = '01';
      } else {
        parts.hour = pad(parts.hour);
      }
      if (minuteOptional && parts.minute === '') {
        parts.minute = '00';
      } else {
        parts.minute = pad(parts.minute);
      }
      req.body[key] = `${parts.hour}:${parts.minute}`;
    }
    next();
  };

  const postProcess = (req, res, next) => {
    const value = req.form.values[key];
    if (value) {
      req.form.values[key] = req.body[key];
    }
    next();
  };
  // if time field is included in errorValues, extend
  // errorValues with the individual components
  const preGetErrors = (req, res, next) => {
    const errorValues = req.sessionModel.get('errorValues');
    if (errorValues && errorValues[key]) {
      req.sessionModel.set('errorValues',
        Object.assign({}, errorValues, getPartsFromTime(errorValues[key], Object.keys(fields)))
      );
    }
    next();
  };

  // if time field has any validation error, also add errors
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

  // if time value is set, split its parts and assign to req.form.values.
  // This is extended with errorValues if they are present
  const postGetValues = (req, res, next) => {
    const time = req.form.values[key];
    if (time) {
      Object.assign(
        req.form.values,
        getPartsFromTime(time, Object.keys(fields)),
        req.sessionModel.get('errorValues') || {}
      );
    }
    next();
  };

  // render the template to a string, assign the html output
  // to the time field in res.locals.fields
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
