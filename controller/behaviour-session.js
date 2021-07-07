'use strict';

const _ = require('lodash');
const path = require('path');

module.exports = SuperClass => class extends SuperClass {
  configure(req, res, callback) {
    if (!req.sessionModel) {
      throw new Error('req.sessionModel must be defined in order to use this behaviour');
    }
    super.configure(req, res, callback);
  }

  getValues(req, res, callback) {
    const json = req.sessionModel.toJSON();
    delete json.errorValues;
    callback(null, Object.assign({}, json, req.sessionModel.get('errorValues')));
  }

  saveValues(req, res, callback) {
    req.sessionModel.set(req.form.values);
    req.sessionModel.unset('errorValues');
    callback();
  }

  getErrors(req) {
    let errs = req.sessionModel.get('errors');
    errs = _.pick(errs, Object.keys(req.form.options.fields));
    errs = _.pickBy(errs, err => !err.redirect);
    return errs;
  }

  setErrors(err, req) {
    if (req.form) {
      req.sessionModel.set('errorValues', req.form.values);
    }
    req.sessionModel.set('errors', err);
  }

  locals(req, res) {
    return Object.assign({}, super.locals(req, res), {
      baseUrl: req.baseUrl,
      nextPage: this.getNextStep(req, res)
    });
  }

  missingPrereqHandler(req, res) {
    const last = _.last(req.sessionModel.get('steps'));
    let redirect = _.first(Object.keys(this.options.steps));

    if (last && this.options.steps[last]) {
      redirect = this.options.steps[last].next || last;
    }
    res.redirect(path.join(req.baseUrl, redirect));
  }

  errorHandler(err, req, res, next) {
    if (err.code === 'MISSING_PREREQ') {
      this.missingPrereqHandler(req, res, next);
    } else {
      super.errorHandler(err, req, res, next);
    }
  }
};
