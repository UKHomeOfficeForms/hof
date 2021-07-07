'use strict';

const _ = require('lodash');
const debug = require('debug')('hmpo:validation');

const validators = require('./validators');

function applyValidator(vlt, value, key) {
  const validator = typeof vlt === 'string' ? { type: vlt } : vlt;

  function doValidate() {
    debug('Applying %s validator with value "%s"', validator.type, value);
    let args = [value];
    if (!Array.isArray(validator.arguments)) {
      validator.arguments = [validator.arguments];
    }
    args = args.concat(validator.arguments);
    if (!validators[validator.type].apply(null, args)) {
      return Object.assign({ key }, validator, { arguments: validator.arguments });
    }
    return undefined;
  }

  function customValidate() {
    debug('Applying custom %s validator with value %s', validator.name, value);
    if (!validator(value)) {
      return Object.assign({ key }, { type: validator.name });
    }
    return undefined;
  }

  if (validators[validator.type]) {
    return doValidate();
  } else if (typeof validator  === 'function') {
    if (validator.name) {
      return customValidate();
    }
    throw new Error('Custom validator needs to be a named function');
  } else {
    throw new Error(`Undefined validator:${validator.type}`);
  }
}

function validate(fields) {
  _.each(fields, (field, key) => {
    if (typeof fields[key].validate === 'string') {
      fields[key].validate = [fields[key].validate];
    }

    if (fields[key].options) {
      fields[key].validate = fields[key].validate || [];
      fields[key].validate.push({
        type: 'equal',
        arguments: _.map(fields[key].options, option =>
          typeof option === 'string' ? option : option.value
        )
      });
    }
  });

  // eslint-disable-next-line consistent-return
  return (key, value, values, emptyValue) => {
    debug(`Validating field: "${key}" with value: "${value}"`);

    function shouldValidate() {
      let dependent = fields[key].dependent;

      if (typeof dependent === 'string') {
        dependent = {
          field: dependent,
          value: true
        };
      }
      if (!dependent
        || (dependent && !fields[dependent.field])
        || (dependent && (Array.isArray(values[dependent.field])
          ? values[dependent.field].indexOf(dependent.value) > -1
          : values[dependent.field] === dependent.value))
      ) {
        return true;
      }
      return false;
    }

    if (fields[key]) {
      if (shouldValidate()) {
        debug(`Applying validation on field ${key} with ${value}`);
        return _.reduce(fields[key].validate, (err, validator) =>
          err || applyValidator(validator, value, key)
        , null);
      }
      values[key] = emptyValue === undefined ? '' : emptyValue;
      debug('Skipping validation for field %s', key);
    }
  };
}

validate.validators = validators;

module.exports = validate;
