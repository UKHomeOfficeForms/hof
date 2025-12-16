'use strict';

const _ = require('lodash');
const utils = require('./utils');
const validation = require('./validation');

/**
 * Pre-process hook. This function:
 * - Splits the amountWithUnitSelect value into its parts (amount and unit in the format [Amount]-[Unit],
 * E.G. 5-Kilograms) and assigns them to the request body (req.body).
 * @param {Object} req - The form's request object.
 * @param {Object} fields - The component's child field definitions and configurations.
 * @param {string} key - The parent component's key.
 */
const preProcess = (req, fields, key) => {
  const parts = utils.getParts(req.body, fields, key);
  if (_.some(parts, part => part !== '')) {
    req.body[key] = `${(parts.amount || '')}-${(parts.unit || '')}`;
  }
};

/**
 * Post-process hook. This function:
 * - Copies the field value from the request body (req.body) to the form values (req.form.values)
 *   if a reference to the field exists in the form values.
 * @param {Object} req - The form's request object.
 * @param {string} key - The parent component's key.
 */
const postProcess = (req, key) => {
  if (req.form.values[key]) {
    req.form.values[key] = req.body[key];
  }
};

/**
 * Pre-validate hook. This function:
 * - Prevents default select component assignment of 'equal' validator to the parent component.
 * - Resolves required validators and optional configurations for child components.
 * - Propagates child component field data and values to the request to enable their validation.
 * - Adds a custom 'equal' validator to the unit child component.
 * - Adds a custom 'twoHyphenSeparatedValues' validator to the parent component to validate overall value format.
 * - Moves excess validators that do not apply to the parent component to the 'amount' child component.
 * @param {Object} req - The form's request object.
 * @param {Object} fields - The component's child field definitions and configurations.
 * @param {string} key - The parent component's key.
 * @param {Object} options - The component's configuration options.
 */
const preValidate = (req, fields, key, options) => {
  // Prevents auto assignment of 'equal' validator to parent component
  validation.addGroupedFieldsWithOptionsProperty(req.form.options.fields[key]);
  // resolves required validators and optional configurations for child components
  validation.resolveOptionalFields(req.form.options.fields, fields, options.validate, key);
  // propagates child component field data and values to the request to enable validation
  validation.propagateChildFieldValidation(req.form, fields, key);
  // adds custom 'equal' validator to the unit child component
  validation.addValidator(fields[`${key}-unit`], validation.createCustomEqualValidator(fields[`${key}-unit`].options));
  // adds custom 'twoHyphenSeparatedValues' validator to the parent component to validate overall value format
  validation.addValidator(options, validation.isTwoHyphenSeparatedValues);
  // moves excess validators that do not apply to the parent component to the 'amount' child component
  validation.moveExcessValidatorToChildComponent(req.form.options.fields, fields, key);
};

/**
 * Pre-getErrors hook. This function:
 * - If the parent component has a flagged error, this extends the session model's error values with
 * the child components' error values.
 * @param {Object} req - The form's request object.
 * @param {Object} fields - The component's child field definitions and configurations.
 * @param {string} key - The parent component's key.
 */
const preGetErrors = (req, fields, key) => {
  // if the amountWithUnitSelect field is included in errorValues (E.G. if there was a validation error),
  // extend errorValues with the individual components
  // (I.E. add the child components' K:V pair to the request sessionModel's attributes)
  const errorValues = req.sessionModel.get('errorValues');
  if (errorValues && errorValues[key]) {
    req.sessionModel.set('errorValues',
      Object.assign({}, errorValues, utils.getPartsFromAmountWithUnitSelect(errorValues[key], Object.keys(fields)))
    );
  }
};

/**
 * Post-getErrors hook. This function:
 * - Ensures only one error is associated with the components in the request form errors
 * (by setting excess errors' type to null) when either the parent or child components have
 * (jointly) multiple errors in the session model.
 * - If there is no parent component error, one of the child component errors (if any) is inserted.
 * @param {Object} req - The form's request object.
 * @param {Object} res - The form's response object.
 * @param {Object} fields - The component's child field definitions and configurations.
 * @param {string} key  - The parent component's key.
 */
const postGetErrors = (req, res, fields, key) => {
  // if the amountWithUnitSelect field or its child fields have any recorded validation error,
  // the remaining errors are added to req.form.errors
  // and their type is set to null to avoid duplicate error messages
  const errors = req.sessionModel.get('errors');
  if (errors && (errors[key] || errors[`${key}-amount`] || errors[`${key}-unit`])) {
    Object.assign(req.form.errors, Object.keys(fields).reduce((obj, field) =>
      Object.assign({}, obj, { [field]: { type: null } })
    , {}));
  }

  // inserts child component validation errors into req.form.errors
  validation.insertChildValidationErrors(req, res, key, errors);
};

/**
 * Post-getValues hook. This function:
 * - Splits the component's value into its parts and assigns them to the request object's form values (req.form.values).
 * @param {Object} req - The form's request object.
 * @param {Object} fields - The component's child field definitions and configurations.
 * @param {string} key - The parent component's key.
 */
const postGetValues = (req, fields, key) => {
  // if amountWithUnitSelect value is set, split it into its parts and assign to req.form.values
  // extends the session model's error values, if any
  const amountWithUnitSelect = req.form.values[key];
  if (amountWithUnitSelect) {
    Object.assign(
      req.form.values,
      utils.getPartsFromAmountWithUnitSelect(amountWithUnitSelect, Object.keys(fields)),
      req.sessionModel.get('errorValues') || {}
    );
  }
};

/**
 * Pre-render hook. This function:
 * - Translates the unit options and child component labels.
 * - Renders the component's template to a string
 * and assigns the HTML output to the component field in res.locals.fields.
 * @param {Object} req - The form's request object.
 * @param {Object} res - The form's response object.
 * @param {Object} fields - The component's child field definitions and configurations.
 * @param {Object} options - The component's configuration options.
 * @param {string} template - The component's template path.
 * @param {string} key - The parent component's key.
 * @param {Function} next - The next middleware function in the chain.
 */
const preRender = (req, res, fields, options, template, key, next) => {
  // applies translations
  utils.translateUnitOptions(req, fields, options, key);
  utils.translateLabels(req, fields, key, ['amount', 'unit']);

  // renders the template to a string and assign the html output
  // to the amountWithUnitSelect field (in res.locals.fields)
  res.render(template, utils.constructFieldToRender(req, fields, options, key), (err, html) => {
    if (err) {
      next(err);
    } else {
      const field = res.locals.fields.find(f => f.key === key);
      Object.assign(field, { html });
      next();
    }
  });
};

module.exports = {
  preProcess,
  postProcess,
  preValidate,
  preGetErrors,
  postGetErrors,
  postGetValues,
  preRender
};
