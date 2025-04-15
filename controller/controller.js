'use strict';

const _ = require('lodash');
const i18nLookup = require('i18n-lookup');
const Mustache = require('mustache');
const BaseController = require('./base-controller');
const Helpers = require('../utilities').helpers;

const omitField = (field, req) => field.useWhen && (typeof field.useWhen === 'string'
  ? req.sessionModel.get(field.useWhen) !== 'true'
  : req.sessionModel.get(field.useWhen.field) !== field.useWhen.value);

module.exports = class Controller extends BaseController {
  constructor(options) {
    super(options);
    this.confirmStep = options.confirmStep || '/confirm';
  }

  configure(req, res, callback) {
    const removeFields = Object.keys(_.pickBy(req.form.options.fields, field => omitField(field, req)));
    if (removeFields.length) {
      req.form.options.fields = _.omit(req.form.options.fields, removeFields);
      req.sessionModel.unset(removeFields);
    }
    callback();
  }

  get(req, res, callback) {
    const template = this.options.template || '';
    res.render(template, err => {
      if (err && err.message.match(/^Failed to lookup view/)) {
        this.options.template = res.locals.partials.step;
      }
    });
    super.get(req, res, callback);
  }

  getNextStep(req, res) {
    let next = super.getNextStep(req, res);
    const forks = req.form.options.forks || [];

    const normaliseUrl = url => req.baseUrl === '/' ? url : req.baseUrl + url;

    const confirmStep = normaliseUrl(this.confirmStep);

    const completed = s => {
      let step = s;
      if (req.baseUrl !== '/') {
        const re = new RegExp('^' + req.baseUrl);
        step = step.replace(re, '');
      }
      // Has the user already completed the step?
      return _.includes(req.sessionModel.get('steps'), step);
    };

    // If a form condition is met, its target supercedes the next property
    next = _.reduce(forks, (result, value) => {
      if (Helpers.isFieldValueInPageOrSessionValid(req, res, value.condition)) {
        if (value.continueOnEdit) {
          req.form.options.continueOnEdit = true;
        }
        return normaliseUrl(value.target);
      }
      return result;
    }, next);


    if (req.params.action === 'edit') {
      if (!req.form.options.continueOnEdit && completed(next)) {
        next = confirmStep;
      }
      if (next !== confirmStep) {
        next += '/edit';
      }
    }

    return next;
  }

  getBackLink(req, res) {
    const backLink = res.locals.backLink;
    const trailingEdit = req.params.action === 'edit' ? '/edit' : '';
    const leadingSlash = /^\/?\w+/.test(req.baseUrl) ? '' : '/';

    if (!backLink) {
      return backLink;
    }

    return `${leadingSlash}${backLink}${trailingEdit}`;
  }

  getErrorStep(err, req) {
    let redirect = super.getErrorStep(err, req);
    if (req.params.action === 'edit' && !redirect.match(/\/edit$|\/edit\//)) {
      redirect += '/edit';
    }
    return redirect;
  }

  locals(req, res) {
    const lookup = i18nLookup(req.translate, Mustache.render);
    const route = req.form.options.route.replace(/^\//, '');
    const locals = super.locals(req, res);
    const stepLocals = req.form.options.locals || {};

    let fields = _.map(req.form.options.fields, (field, key) =>
      Object.assign({}, field, { key })
    );
    // only include fields that aren't dependents to mitigate duplicate fields on the page
    fields = fields.filter(field => !req.form.options.fields[field.key].dependent);

    const exitStep = req.form.options.exitStep || '/exit';
    const saveAndExitStep = req.form.options.saveAndExitStep || '/save-and-exit';
    return _.extend({}, locals, {
      fields,
      route,
      baseUrl: req.baseUrl,
      exitStep,
      saveAndExitStep,
      skipToMain: this.getFirstFormItem(req.form.options.fields),
      title: this.getTitle(route, lookup, req.form.options.fields, res.locals),
      journeyHeaderURL: this.getJourneyHeaderURL(req.baseUrl),
      header: this.getHeader(route, lookup, res.locals),
      serviceName: this.getServiceName(lookup, res.locals),
      captionHeading: this.getCaptionHeading(route, lookup, res.locals),
      warning: this.getWarning(route, lookup, res.locals),
      subHeading: this.getSubHeading(route, lookup, res.locals),
      intro: this.getIntro(route, lookup, res.locals),
      backLink: this.getBackLink(req, res),
      nextPage: this.getNextStep(req, res),
      errorLength: this.getErrorLength(req, res)
    }, stepLocals);
  }

  getJourneyHeaderURL(url) {
    return url === '' ? '/' : url;
  }

  getFirstFormItem(fields) {
    let firstFieldKey;
    if (_.size(fields)) {
      firstFieldKey = Object.keys(fields)[0];
    }
    return firstFieldKey | 'main-content';
  }

  getHeader(route, lookup, locals) {
    return lookup(`pages.${route}.header`, locals);
  }

  getServiceName(lookup, locals) {
    return lookup([
      'journey.serviceName',
      'journey.header'
    ], locals);
  }

  getCaptionHeading(route, lookup, locals) {
    return lookup(`pages.${route}.captionHeading`, locals);
  }

  getSubHeading(route, lookup, locals) {
    return lookup(`pages.${route}.subHeading`, locals);
  }

  getWarning(route, lookup, locals) {
    return lookup(`pages.${route}.warning`, locals);
  }

  getTitle(route, lookup, fields, locals) {
    let fieldName = '';
    if (_.size(fields)) {
      fieldName = Object.keys(fields)[0];
    }
    return lookup([
      `pages.${route}.title`,
      `pages.${route}.header`,
      `fields.${fieldName}.label`,
      `fields.${fieldName}.legend`
    ], locals);
  }

  getIntro(route, lookup, locals) {
    return lookup([
      `pages.${route}.intro`
    ], locals);
  }

  _getErrors(req, res, callback) {
    super._getErrors(req, res, () => {
      Object.keys(req.form.errors).forEach(key => {
        if (req.form && req.form.options && req.form.options.fields) {
          const field = req.form.options.fields[key];
          // get first option for radios and checkbox
          if (field.mixin === 'radio-group' || field.mixin === 'checkbox-group') {
            // get first option for radios and checkbox where there is a toggle
            if (typeof field.options[0] === 'object') {
              req.form.errors[key].errorLinkId = key + '-' + field.options[0].value;
            } else {
              req.form.errors[key].errorLinkId = key + '-' + field.options[0];
            }
            // eslint-disable-next-line brace-style
          }
          // get first field for date input control
          else if (field && field.mixin === 'input-date') {
            req.form.errors[key].errorLinkId = key + '-day';
          } else {
            req.form.errors[key].errorLinkId = key;
          }
        }

        req.form.errors[key].message = this.getErrorMessage(req.form.errors[key], req, res);
      });
      callback();
    });
  }

  getErrorMessage(error, req, res) {
    error.type = error.type || 'default';
    error.options = error.options || {};
    const keys = [
      `fields.${error.key}.validation.${error.type}`,
      `validation.${error.key}.${error.type}`,
      `validation.${error.key}.default`,
      `validation.${error.type}`,
      'validation.default'
    ];
    const getArgs = () => {
      if (error.type === 'before' || error.type === 'after') {
        return { diff: error.arguments.join(' ') };
      } else if (error.arguments && Array.isArray(error.arguments)) {
        return { [error.type]: error.arguments[0] };
      }
      return {};
    };
    const context = Object.assign({
      label: req.translate(`fields.${error.key}.label`).toLowerCase(),
      legend: req.translate(`fields.${error.key}.legend`).toLowerCase()
    }, res.locals, getArgs(error));

    return i18nLookup(req.translate, Mustache.render)(keys, context);
  }

  // eslint-disable-next-line no-unused-vars
  getErrorLength(req, res) {
    if (!req.form.errors) {
      return undefined;
    }

    const errorLength = Object.keys(req.form.errors).length;

    const propName = errorLength === 1 ? 'single' : 'multiple';

    return errorLength ? {
      [propName]: true
    } : undefined;
  }
};
