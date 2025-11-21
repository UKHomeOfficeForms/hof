'use strict';

const _ = require('lodash');
const path = require('path');
const getFields = require('./fields');

const utils = require('./utils');
const validation = require('./validation');

const TEMPLATE = path.resolve(__dirname, './templates/amount-with-unit-select.html');

module.exports = (key, opts) => {
  if (!key) {
    throw new Error('Key must be passed to amountWithUnitSelect component');
  }

  const fields = getFields(key); // The child field definitions and configurations
  const options = opts || {}; // The component's configuration options
  const template = options.template ?
    path.resolve(__dirname, options.template) :
    TEMPLATE;

  /**
   * Pre-process hook 
   * - Splits the amountWithUnitSelect value into its parts and assigns them to req.body
   * 
   * @param {Object} req - The form's request object
   * @param {Object} res  - The form's response object
   * @param {function (params)} next - The next middleware function in the chain
   */
  const preProcess = (req, res, next) => {
    // takes the 2 parts (amount and unit), then creates a amountWithUnitSelect value
    // in the format [Amount]-[Unit] (e.g. 5-Kilograms) and saves to req.body for processing
    const parts = utils.getParts(req.body, fields, key);
    if (_.some(parts, part => part !== '')) {
      req.body[key] = `${(parts.amount || '')}-${(parts.unit || '')}`;
    }
    next();
  };

  /**
   * Post-process hook 
   * - Assigns the req.body value to req.form.values
   * 
   * @param {Object} req - The form's request object
   * @param {Object} res  - The form's response object
   * @param {function (params)} next - The next middleware function in the chain
   */
  const postProcess = (req, res, next) => {
    // given a amountWithUnitSelect form value entry exists in the request
    // the form values are set to the request body's value
    if (req.form.values[key]) {
      req.form.values[key] = req.body[key];
    }
    next();
  };

  /**
   * Pre-validate hook 
   * - Modifies the request to include custom validation for the component
   * 
   * @param {Object} req - The form's request object
   * @param {Object} res  - The form's response object
   * @param {function (params)} next - The next middleware function in the chain
   */
  const preValidate = (req, res, next) => {
    // Prevents auto assignment of 'equal' validator to parent component
    validation.addGroupedFieldsWithOptionsProperty(req.form.options.fields[key]);
    // resolves required validators and optional configurations for child components
    validation.resolveOptionalFields(req.form.options.fields, fields, options.validate, key);
    // propagates child component field data and values to the request to enable validation
    validation.propagateChildFieldValidation(req.form, fields, key);
    // adds custom 'equal' validator to the unit child component
    validation.addValidator(validation.createCustomEqualValidator(fields[`${key}-unit`].options));
    // adds custom 'twoHyphenSeparatedValues' validator to the parent component to validate overall value format
    validation.addValidator(validation.isTwoHyphenSeparatedValues);
    // moves excess validators that do not apply to the parent component to the 'amount' child component
    validation.moveExcessValidatorToChildComponent(req.form.options.fields, fields, key);

    next();
  };

  /**
   * Pre-getErrors hook 
   * - If the parent component has a flagged error, extends the session model error values with the child components' error value
   * 
   * @param {Object} req - The form's request object
   * @param {Object} res  - The form's response object
   * @param {function (params)} next - The next middleware function in the chain
   */
  const preGetErrors = (req, res, next) => {
    // if the amountWithUnitSelect field is included in errorValues (e.g. if there was a validation error),
    // extend errorValues with the individual components
    // (I.E. Add the child components' K:V pair to the request sessionModel's attributes)
    const errorValues = req.sessionModel.get('errorValues');
    if (errorValues && errorValues[key]) {
      req.sessionModel.set('errorValues',
        Object.assign({}, errorValues, utils.getPartsFromAmountWithUnitSelect(errorValues[key], Object.keys(fields)))
      );
    }
    next();
  };

  /**
   * Post-getErrors hook
   * - If the parent or child components has any recorded error, the remaining errors are added to the request as null type errors 
   * (to ensure there is only one error per field)
   * 
   * @param {Object} req - The form's request object
   * @param {Object} res  - The form's response object
   * @param {function (params)} next - The next middleware function in the chain
   */
  const postGetErrors = (req, res, next) => {
    // if the amountWithUnitSelect field or it's child fields have any recorded validation error,
    // the remaining errors are added to the request/req.form.errors
    // and their type is set to a null to avoid duplicate error messages
    const errors = req.sessionModel.get('errors');
    if (errors && (errors[key] || errors[`${key}-amount`] || errors[`${key}-unit`])) {
      Object.assign(req.form.errors, Object.keys(fields).reduce((obj, field) =>
        Object.assign({}, obj, { [field]: { type: null } })
      , {}));
    }

    // inserts child component validation errors into req.form.errors
    validation.insertChildValidationErrors(req, res, errors);

    next();
  };

  /**
   * Post-getValues hook
   * - Splits the amountWithUnitSelect value into its parts and assigns them to request object's form values (req.form.values)
   * 
   * @param {Object} req - The form's request object
   * @param {Object} res  - The form's response object
   * @param {function (params)} next - The next middleware function in the chain
   */
  const postGetValues = (req, res, next) => {
    // if amountWithUnitSelect value is set, split it into it's parts and assign to req.form.values
    // extends session model's error values, if any
    const amountWithUnitSelect = req.form.values[key];
    if (amountWithUnitSelect) {
      Object.assign(
        req.form.values,
        utils.getPartsFromAmountWithUnitSelect(amountWithUnitSelect, Object.keys(fields)),
        req.sessionModel.get('errorValues') || {}
      );
    }
    next();
  };

  /**
   * Pre-render hook
   * - Translates the unit field options and the labels for the child components
   * - Renders the components
   * 
   * @param {Object} req - The form's request object
   * @param {Object} res  - The form's response object
   * @param {function (params)} next - The next middleware function in the chain
   */
  const preRender = (req, res, next) => {
    utils.translateUnitOptions(req, fields, options, key);
    utils.translateLabels(req, fields, key, ['amount', 'unit']);

    // renders the template to a string and assign the html output
    // to the amountWithUnitSelect field (in res.locals.fields)
    res.render(template, utils.constructFieldToRender(req, options, key), (err, html) => {
      if (err) {
        next(err);
      } else {
        const field = res.locals.fields.find(f => f.key === key);
        Object.assign(field, { html });
        next();
      }
    });
  };

  return Object.assign({}, options, {
    hooks: {
      'pre-process': preProcess,
      'post-process': postProcess,
      'pre-getErrors': preGetErrors,
      'post-getErrors': postGetErrors,
      'post-getValues': postGetValues,
      'pre-render': preRender,
      'pre-validate': preValidate
    }
  });
};
