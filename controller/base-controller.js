'use strict';

/* eslint no-unused-vars: [2, {"vars": "all", "args": "none"}] */
const _ = require('lodash');
const express = require('express');
const EventEmitter = require('events').EventEmitter;
const debug = require('debug')('hmpo:form');
const dataFormatter = require('./formatting');
const dataValidator = require('./validation');
const ErrorClass = require('./validation-error');
const sanitisationBlacklistArray = require('../config/sanitisation-rules');

module.exports = class BaseController extends EventEmitter {
  constructor(options) {
    if (!options) {
      throw new Error('Options must be provided');
    }
    if (!options.template) {
      debug('No template provided');
    }
    super(options);
    options.defaultFormatters = options.defaultFormatters || ['trim', 'singlespaces', 'hyphens'];
    options.fields = options.fields || {};
    this.options = options;
    this.ValidationError = ErrorClass;

    this.router = express.Router({ mergeParams: true });
  }

  requestHandler() {
    ['get', 'post', 'put', 'delete'].forEach(method => {
      if (typeof this[method] === 'function') {
        this.router[method]('*', this[method].bind(this));
      } else {
        this.router[method]('*', (req, res, next) => {
          const err = new Error('Method not supported');
          err.statusCode = 405;
          next(err);
        });
      }
    });
    this.router.use(this.errorHandler.bind(this));
    return this.router;
  }

  use() {
    this.router.use.apply(this.router, arguments);
  }

  get(req, res, callback) {
    express.Router({ mergeParams: true })
      .use([
        this._configure.bind(this),
        this._getErrors.bind(this),
        this._getValues.bind(this),
        this._locals.bind(this),
        this.render.bind(this),
        // eslint-disable-next-line no-shadow
        (err, req, res, next) => {
          callback(err);
        }
      ])
      .handle(req, res, callback);
  }

  post(req, res, callback) {
    this.setErrors(null, req, res);
    express.Router({ mergeParams: true })
      .use([
        this._configure.bind(this),
        this._process.bind(this),
        this._validate.bind(this),
        this._sanitize.bind(this),
        this._getHistoricalValues.bind(this),
        this.saveValues.bind(this),
        this.successHandler.bind(this),
        // eslint-disable-next-line no-shadow
        (err, req, res, next) => {
          callback(err);
        }
      ])
      .handle(req, res, callback);
  }

  _locals(req, res, callback) {
    Object.assign(res.locals, {
      errors: req.form.errors,
      errorlist: _.map(req.form.errors, _.identity),
      values: req.form.values,
      options: req.form.options,
      action: req.baseUrl !== '/' ? req.baseUrl + req.path : req.path
    });
    Object.assign(res.locals, this.locals(req, res));
    callback();
  }

  // eslint-disable-next-line no-inline-comments, spaced-comment
  locals(/*req, res*/) {
    return {};
  }

  render(req, res, callback) {
    if (!req.form.options.template) {
      callback(new Error('A template must be provided'));
    } else {
      res.render(req.form.options.template);
    }
  }

  _getErrors(req, res, callback) {
    req.form.errors = this.getErrors(req, res);
    callback();
  }

  // placeholder methods for persisting error messages between POST and GET
  // eslint-disable-next-line no-inline-comments, spaced-comment
  getErrors(/*req, res*/) {
    return {};
  }

  // eslint-disable-next-line no-inline-comments, spaced-comment
  setErrors(/*err, req, res*/) {}

  _validate(req, res, callback) {
    debug('Validating...');

    const formatter = dataFormatter(
      req.form.options.fields,
      req.form.options.defaultFormatters,
      req.form.options.formatters
    );
    const validator = dataValidator(req.form.options.fields);

    const errors = _.reduce(req.form.values, (errs, value, key) => {
      const error = this.validateField(key, req, validator, formatter);
      if (error) {
        const errorKey = error.group || error.key;
        return Object.assign({}, errs, {
          [errorKey]: new this.ValidationError(errorKey, error)
        });
      }
      return errs;
    }, {});

    if (!_.isEmpty(errors)) {
      callback(errors);
    } else {
      this.validate(req, res, callback);
    }
  }

  validate(req, res, callback) {
    callback();
  }

  validateField(key, req, vld, fmtr) {
    const formatter = fmtr || dataFormatter(
      req.form.options.fields,
      req.form.options.defaultFormatters,
      req.form.options.formatters
    );
    const validator = vld || dataValidator(req.form.options.fields);
    const emptyValue = formatter(key, '');
    return validator(key, req.form.values[key], req.form.values, emptyValue);
  }

  _sanitize(req, res, callback) {
    //Sanitisation could be disabled in the config
    if(!this.options.sanitiseInputs) return;

    // If we don't have any data, no need to progress
    if(!_.isEmpty(req.form.values)) {
      Object.keys(req.form.values).forEach(function (property, propertyIndex) {
        // If it's not a string, don't sanitise it
        if(_.isString(req.form.values[property])) {
          // For each property in our form data
          Object.keys(sanitisationBlacklistArray).forEach(function (blacklisted, blacklistedIndex) {
            const blacklistedDetail = sanitisationBlacklistArray[blacklisted];
            const regexQuery = new RegExp(blacklistedDetail.regex, 'gi');
            // Will perform the required replace based on our passed in regex and the replace string
            req.form.values[property] = req.form.values[property].replace(regexQuery, blacklistedDetail.replace);
          });
        }
      });
    }
    callback();
  }

  _process(req, res, callback) {
    req.form.values = req.form.values || {};
    const formatter = dataFormatter(
      req.form.options.fields,
      req.form.options.defaultFormatters,
      req.form.options.formatters
    );
    Object.assign(req.form.values, _.reduce(req.form.options.fields, (fields, field, key) =>
      Object.assign({}, fields, { [key]: formatter(key, req.body[key] || '') })
    , {}));
    this.process(req, res, callback);
  }

  process(req, res, callback) {
    callback();
  }

  _configure(req, res, callback) {
    req.form = req.form || {};
    req.form.options = _.cloneDeep(this.options);
    this.configure(req, res, callback);
  }

  configure(req, res, callback) {
    callback();
  }

  _getValues(req, res, callback) {
    this.getValues(req, res, (err, values) => {
      req.form.values = values || {};
      callback(err);
    });
  }

  // populate the historical values into the request to allow fork evaluation against those.
  _getHistoricalValues(req, res, callback) {
    this.getValues(req, res, (err, values) => {
      req.form.historicalValues = values || {};
      callback(err);
    });
  }

  getValues(req, res, callback) {
    callback();
  }

  saveValues(req, res, callback) {
    callback();
  }

  _getForkTarget(req, res) {
    function evalCondition(condition) {
      return _.isFunction(condition) ?
        condition(req, res) :
        condition.value === (req.form.values[condition.field] ||
                           (req.form.historicalValues && req.form.historicalValues[condition.field]));
    }

    // If a fork condition is met, its target supercedes the next property
    return req.form.options.forks.reduce((result, value) =>
      evalCondition(value.condition) ?
        value.target :
        result
    , req.form.options.next);
  }

  getForkTarget(req, res) {
    return this._getForkTarget(req, res);
  }

  getNextStep(req, res) {
    let next = req.form.options.next || req.path;
    if (req.form.options.forks && Array.isArray(req.form.options.forks)) {
      next = this._getForkTarget(req, res);
    }
    if (req.baseUrl !== '/') {
      next = req.baseUrl + next;
    }
    return next;
  }

  getErrorStep(err, req) {
    const redirectError = _.every(err, error => error.redirect);
    let redirect = req.originalUrl;

    if (redirectError) {
      redirect = _.find(err, error => error.redirect).redirect;
    }

    return redirect;
  }

  isValidationError(err) {
    return !_.isEmpty(err) && _.every(err, e => e instanceof this.ValidationError);
  }

  // eslint-disable-next-line consistent-return
  errorHandler(err, req, res, callback) {
    if (this.isValidationError(err)) {
      this.setErrors(err, req, res);
      res.redirect(this.getErrorStep(err, req));
    } else {
      // if the error is not a validation error then throw and let the error handler pick it up
      return callback(err);
    }
  }

  successHandler(req, res) {
    this.emit('complete', req, res);
    res.redirect(this.getNextStep(req, res));
  }
};
