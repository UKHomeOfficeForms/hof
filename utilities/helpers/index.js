/* eslint-disable no-param-reassign, consistent-return */
'use strict';

const _ = require('lodash');
const logger = require('../../lib/logger');

module.exports = class Helpers {
  /**
   * Utility function which returns the
   * name of the step a field is present on
   * @param {String} field - id of the field
   * @param {Object} steps - steps config object
   * @returns {String} - the key of the step where field is found
   */
  static getStepFromFieldName(field, stepsConfig) {
    return _.findKey(stepsConfig, step => step.fields && step.fields.indexOf(field) > -1);
  }

  /**
   * Alternative 'falsy' check which doesn't
   * return false for 0 or false
   * @param {any} value - the value to check
   * @returns {Boolean} - if the value is 'empty'
   */
  static isEmptyValue(value) {
    return value === undefined || value === null || value === '';
  }

  /**
   * Helper function to lookup and return the page title
   * translation if found. If not it will fallback to the
   * label or legend of the first field on the page
   * @param {String} route - the route of the step
   * @param {Function} lookup - i18n-lookup bound to translate and Mustache.render
   * @param {Object} fields - a key:value map of step fields
   * @param {Object} locals - the locals map for mustache rendering
   * @returns {String} - the first translation found
   */
  static getTitle(route, lookup, fields, locals) {
    let fieldName = '';
    if (_.size(fields)) {
      fieldName = Object.keys(fields)[0];
    }
    return lookup([
      `pages.${route}.header`,
      `fields.${fieldName}.label`,
      `fields.${fieldName}.legend`
    ], locals);
  }

  /**
   * Helper function to return intro if
   * located in pages.{route}.intro
   * @param {String} route - the route of the step
   * @param {Function} lookup - i18n-lookup bound to translate and Mustache.render
   * @param {Object} locals - the locals map for mustache rendering
   * @returns {String} the translation if found
   */
  static getIntro(route, lookup, locals) {
    return lookup([
      `pages.${route}.intro`
    ], locals);
  }

  /**
   * Utility function which returns true
   * if a field type has associated options
   * @param {String} mixin - the name of the mixin
   * @returns {Boolean} - if the mixin has associated options
   */
  static hasOptions(mixin) {
    return mixin === 'radio-group' || mixin === 'checkbox-group' || mixin === 'select';
  }

  /**
   * helper function for looking up values in
   * fields that have options
   * @param {Function} translate - translate function
   * @param {String} field - the id of the field
   * @param {String} value - the value of the field
   * @returns {String} the translation of the label if found,
   * the raw value if not
   */
  static getValue(translate, field, values) {
    if (!Array.isArray(values)) {
      values = [values];
    }
    return values.map(value => {
      const key = `fields.${field}.options.${value}.label`;
      const result = translate(key);
      return result === key ? value : result;
    }).join('\n');
  }

  /**
   * utility function which returns undefined on
   * failed translations instead of returning the key
   * @param {Function} translate - the translate function
   * @param {String} key - the key to translate
   * @returns {String|undefined} the string result if successful, undefined if not
   */
  static conditionalTranslate(translate, key) {
    const result = translate(key);
    if (result !== key) {
      return result;
    }
  }

  /**
   * Utility function which looks up translations with fallback values
   * If the translation is for a field, it will first try fields.key.summary
   * If this fails it will try fields.key.label, if this fails it will try
   * fields.key.legend (radio-group and checkbox-group).
   *
   * If the translation is not for a field it will first try pages.key.summary,
   * if this fails it will fallback to pages.keys.header.
   * @param {Function} lookup - i18n lookup bound to translate
   * @param {String} key - the key of the field/page
   * @param {Boolean} isField - if the translation is for a field
   * @return {String} the result of the translation
   */
  static getTranslation(lookup, key, isField) {
    if (isField) {
      return lookup([
        `fields.${key}.summary`,
        `fields.${key}.label`,
        `fields.${key}.legend`
      ]) || key;
    }
    return lookup([
      `pages.${key}.summary`,
      `pages.${key}.header`
    ]) || key;
  }
  /**
   * utility function which returns true or false on
   * forks depending on whether a value exists on the page
   * @param {Object} req - an http request object
   * @param {Object} res - an http response object
   * @param {Function|Object} condition - a field condition that is either a function or object
   * @returns {Boolean} the boolean result of whether a field value is set on the page or session for a fork
   */
  static isFieldValueInPageOrSessionValid(req, res, condition) {
    return _.isFunction(condition) ?
      condition(req, res) :
      condition.value === (req.form.values[condition.field] ||
      (!Object.keys(req.form.values).includes(condition.field) &&
      _.get(req, `form.historicalValues[${condition.field}]`)));
  }

  /**
   * Read an environment variable and coerce it to boolean.
   *
   * @param {*}     rawValue    The raw value (e.g. process.env.FEATURE_FLAG)
   * @param {boolean} [fallback=false]   Value to use if rawValue is null/undefined/invalid
   * @param {string} [envVarName='ENV_VAR']  Name for log context
   * @returns {boolean}
   */
  static getEnvBoolean(rawValue, fallback = false, envVarName = 'ENV_VAR') {
    if (typeof rawValue === 'boolean') {
      return rawValue;
    }

    if (rawValue === null || rawValue === undefined) {
      return fallback;
    }

    if (typeof rawValue === 'string') {
      const normalized = rawValue.trim().toLowerCase();
      if (normalized === 'true') {
        return true;
      }
      if (normalized === 'false') {
        return false;
      }
      logger.warn(
        `Invalid environment variable ${envVarName} value "${rawValue}" – must be "true" or "false"; defaulting to ${fallback}`
      );
      return fallback;
    }

    logger.warn(
      `Invalid environment variable ${envVarName} type (${typeof rawValue}); defaulting to ${fallback}`
    );
    return fallback;
  }
};
