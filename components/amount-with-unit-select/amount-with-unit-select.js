'use strict';

const hooks = require('./hooks');
const path = require('path');
const getFields = require('./fields');

const TEMPLATE = path.resolve(__dirname, './templates/amount-with-unit-select.html');

module.exports = (key, opts) => {
  if (!key) {
    throw new Error('Key must be passed to amountWithUnitSelect component');
  }

  const fields = getFields(key); // the child field definitions and configurations
  const options = opts || {}; // the component's configuration options
  const template = options.template ? // the field template path
    path.resolve(__dirname, options.template) :
    TEMPLATE;

  /**
   * Pre-process hook.
   * @param {Object} req - The form's request object.
   * @param {Object} res  - The form's response object.
   * @param {Function} next - The next middleware function in the chain.
   */
  const preProcess = (req, res, next) => {
    hooks.preProcess(req, fields, key);
    next();
  };

  /**
   * Post-process hook.
   * @param {Object} req - The form's request object.
   * @param {Object} res  - The form's response object.
   * @param {Function} next - The next middleware function in the chain.
   */
  const postProcess = (req, res, next) => {
    hooks.postProcess(req, key);
    next();
  };

  /**
   * Pre-validate hook.
   * @param {Object} req - The form's request object.
   * @param {Object} res  - The form's response object.
   * @param {Function} next - The next middleware function in the chain.
   */
  const preValidate = (req, res, next) => {
    hooks.preValidate(req, fields, key, options);
    next();
  };

  /**
   * Pre-getErrors hook.
   * @param {Object} req - The form's request object.
   * @param {Object} res  - The form's response object.
   * @param {Function} next - The next middleware function in the chain.
   */
  const preGetErrors = (req, res, next) => {
    hooks.preGetErrors(req, fields, key);
    next();
  };

  /**
   * Post-getErrors hook.
   * @param {Object} req - The form's request object.
   * @param {Object} res  - The form's response object.
   * @param {Function} next - The next middleware function in the chain.
   */
  const postGetErrors = (req, res, next) => {
    hooks.postGetErrors(req, res, fields, key);
    next();
  };

  /**
   * Post-getValues hook.
   * @param {Object} req - The form's request object.
   * @param {Object} res  - The form's response object.
   * @param {Function} next - The next middleware function in the chain.
   */
  const postGetValues = (req, res, next) => {
    hooks.postGetValues(req, fields, key);
    next();
  };

  /**
   * Pre-render hook.
   * @param {Object} req - The form's request object.
   * @param {Object} res  - The form's response object.
   * @param {Function} next - The next middleware function in the chain.
   */
  const preRender = (req, res, next) => {
    hooks.preRender(req, res, fields, options, template, key, next);
  };

  return Object.assign({}, options, {
    hooks: {
      'pre-process': preProcess,
      'post-process': postProcess,
      'pre-validate': preValidate,
      'pre-getErrors': preGetErrors,
      'post-getErrors': postGetErrors,
      'post-getValues': postGetValues,
      'pre-render': preRender
    }
  });
};
