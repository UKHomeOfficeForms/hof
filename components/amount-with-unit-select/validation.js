'use strict';

const _ = require('lodash');
const controller = require('../../controller/controller').prototype;
const utils = require('./utils');

/**
 * Validates the value is a string consisting of two hyphen-separated values.
 * Can be passed to the list of field validators to run as a custom validator.
 * @param {string} value - The amountWithUnitSelect value to validate (E.G. '1-Litre').
 * @returns {boolean} Returns true if the value is in the expected format, false otherwise.
 */
const isTwoHyphenSeparatedValues = value => {
  if (typeof value !== 'string' || value.indexOf('-') === -1) {
    return false;
  }
  const selectValue = [value.split('-').pop()];
  return Array.isArray(selectValue) && selectValue.length;
};

/**
 * Creates a custom 'equal' validator for a select component.
 * @param {Object[]} options - The select component options.
 * @returns {Object[]} Returns a custom 'equal' validator object for the select component.
 */
const createCustomEqualValidator = options => [{
  type: 'equal',
  arguments: _.map(options, opt =>
    typeof opt === 'string' ? opt : opt.value)
}];

/**
 * Adds a validator to a field's validate array, ensuring no duplicates.
 * @param {Object} field - The field to add the validator to.
 * @param {Object|Object[]|string|string[]|function(string): boolean|(function(string): boolean)[]} newValidator -
 * The validator to add.
 */
const addValidator = (field, newValidator) => {
  field.validate = _.uniq(field.validate.concat(newValidator));
};

/**
 * Adds the 'groupedFieldsWithOptions' property to the specified field.
 * This property prevents the 'equal' validator being applied to the parent component by default,
 * and enables it to separately be added to the unit child component instead.
 * @param {Object} field - The field to add the property to.
 */
const addGroupedFieldsWithOptionsProperty = field => {
  field.groupedFieldsWithOptions = true;
};

/**
 * Resolves configurations related to making the amount and/or unit fields optional (E.G. amountOptional, unitOptional).
 * @param {Object[]} parentField - The parent component's field definition and configuration.
 * @param {Object[]} childFields - The child component's field definitions and configurations.
 * @param {Array} validators - The list of validators assigned to the parent component.
 * @param {string} key - The parent component's key.
 */
const resolveOptionalFields = (parentField, childFields, validators, key) => {
  // adds existing required validators from parent component to the child components
  // and resolves configurations that determine if the child components should be optional
  (validators?.indexOf('required') !== -1 || parentField[key]?.amountOptional !== 'true') &&
    addValidator(childFields[`${key}-amount`], 'required');
  (validators?.indexOf('required') !== -1 || parentField[key]?.unitOptional !== 'true') &&
    addValidator(childFields[`${key}-unit`], 'required');
};

/**
 * Propagates the child component's (amount and unit) field data and values into the form request to enable validation.
 * @param {Object} formReq - The form's request object.
 * @param {Object[]} fields - The child components' definitions and configurations.
 * @param {string} key - The parent component's key.
 */
const propagateChildFieldValidation = (formReq, fields, key) => {
  // adds child component field definitions to the form request
  Object.assign(formReq.options.fields,
    { [`${key}-amount`]: fields[`${key}-amount`] },
    { [`${key}-unit`]: fields[`${key}-unit`] }
  );
  // splits and assigns the component's values to the form request
  const amountWithUnitSelectValues = utils.getAmountWithUnitSelectValues(formReq.values[key]);
  Object.assign(formReq.values,
    { [`${key}-amount`]: amountWithUnitSelectValues[0] },
    { [`${key}-unit`]: amountWithUnitSelectValues[1] }
  );
};

/**
 * Moves validators, that are not the 'required' or 'equal' type, from the parent component to
 * the 'amount' child component,
 * ensuring all other validators are applied to the amount field only.
 * @param {Object} formReqFields - The fields in the form's request object (req.form.options.fields).
 * @param {Object[]} fields - The child components' definitions and configurations.
 * @param {string} key - The parent component's key.
 */
const moveExcessValidatorToChildComponent = (formReqFields, fields, key) => {
  _.remove(formReqFields[key]?.validate, validator => {
    if (!((typeof validator === 'object' &&
      (validator.type === 'equal' ||
        validator.type === 'required')) ||
      (typeof validator === 'string' &&
        (validator === 'equal' ||
          validator === 'required')))) {
      if (formReqFields[`${key}-amount`] === null) {
        Object.assign(formReqFields, {
          [`${key}-amount`]: fields[`${key}-amount`]
        });
      }
      if (!formReqFields[`${key}-amount`]?.validate?.includes(validator)) {
        formReqFields[`${key}-amount`].validate.push(validator);
      }
      return true;
    }
    return false;
  });
};

/**
 * Creates and adds a validation error for a child component into the form request's errors list.
 * @param {Object} req - The request object given to the component.
 * @param {Object} res - The response object given to the component.
 * @param {Object[]} errors - The validation errors recorded in the session model.
 * @param {string} pKey - The parent component's key.
 * @param {string} key - The child component's key.
 */
const addValidationError = (req, res, errors, pKey, key) => {
  // manually creates and adds an error object
  req.form.errors[`${pKey}-${key}`] = {
    errorLinkId: `${pKey}-${key}`,
    key: errors[`${pKey}-${key}`]?.key || `${key}-${key}`,
    type: errors[`${pKey}-${key}`]?.type || null
  };
  // ensure the error message is processed and translated by the controller
  req.form.errors[`${pKey}-${key}`].message =
    controller.getErrorMessage(req.form.errors[`${pKey}-${key}`], req, res) ||
    controller.getErrorMessage({
      errorLinkId: `${pKey}-${key}`,
      key: `${pKey}`,
      type: errors[`${pKey}-${key}`]?.type || null
    }, req, res);
};

/**
 * Inserts child component validation errors into the form request if there is no parent component error.
 * Only one error from the component is added to the request's error list in the order of the parent, amount,
 * and then unit component.
 * @param {Object} req - The request object given to the component.
 * @param {Object} res - The response object given to the component.
 * @param {string} pKey - The parent component's key.
 * @param {Object[]} errors - The validation errors recorded in the session model.
 */
const insertChildValidationErrors = (req, res, pKey, errors) => {
  let key;
  if (errors && !errors[pKey] && req?.form?.errors) {
    if (errors[`${pKey}-amount`] && req.form.errors[`${pKey}-amount`]) {
      key = 'amount';
    } else if (errors[`${pKey}-unit`] && req.form.errors[`${pKey}-unit`]) {
      key = 'unit';
    }
  }
  // if there are not parent or child errors, no errors are added
  key && addValidationError(req, res, errors, pKey, key);
};

module.exports = {
  isTwoHyphenSeparatedValues,
  createCustomEqualValidator,
  addValidator,
  addGroupedFieldsWithOptionsProperty,
  resolveOptionalFields,
  propagateChildFieldValidation,
  moveExcessValidatorToChildComponent,
  addValidationError,
  insertChildValidationErrors
};
