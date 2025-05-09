'use strict';

const moment = require('moment');
const _ = require('underscore');

const DATE_PARTS = ['day', 'month', 'year'];

module.exports = Controller => class extends Controller {
  configure(req, res, next) {
    req.form.options.dateFields = _.keys(_.pick(
      req.form.options.fields,
      field => field.validate === 'date' || _.contains(field.validate, 'date'))
    );

    _.forEach(req.form.options.dateFields, fieldName => this.configureDateField(req, fieldName));

    super.configure(req, res, next);
  }

  configureDateField(req, fieldName) {
    let dateField = req.form.options.fields[fieldName];
    let required = _.contains(dateField.validate, 'required');

    DATE_PARTS.forEach(part => {
      // get any existing date part field options
      let field = req.form.options.fields[fieldName + '-' + part];

      field = _.extend({
        errorGroup: fieldName,
        hintId: fieldName + '-hint',
        contentKey: 'date-' + part,
        autocomplete: dateField.autocomplete &&
          (dateField.autocomplete === 'off' ? 'off' : (dateField.autocomplete + '-' + part)),
        dependent: dateField.dependent,
        labelClassName: 'form-label'
      }, field);

      // add date part validators first
      if (!field.validate) field.validate = [];
      if (!_.isArray(field.validate)) field.validate = [field.validate];

      field.validate.unshift('date-' + part);
      field.validate.unshift('numeric');

      // only make part required if date field is required
      if (required) field.validate.unshift('required');

      req.form.options.fields[fieldName + '-' + part] = field;
    });
  }

  getValues(req, res, callback) {
    super.getValues(req, res, (err, values) => {
      if (err) return callback(err);
      let errorValues = req.sessionModel.get('errorValues') || {};
      req.form.options.dateFields.forEach(fieldName => {
        if (!values[fieldName]) return;
        let [year, month, day] = values[fieldName].split('-');
        values[fieldName + '-day'] = errorValues[fieldName + '-day-raw'] || day;
        values[fieldName + '-month'] = errorValues[fieldName + '-month-raw'] || month;
        values[fieldName + '-year'] = errorValues[fieldName + '-year-raw'] || year;
      });
      callback(null, values);
    });
  }

  process(req, res, next) {
    _.forEach(req.form.options.dateFields, fieldName => this.processDateField(req, fieldName));
    super.process(req, res, next);
  }

  processDateField(req, fieldName) {
    const dayName = fieldName + '-day';
    const monthName = fieldName + '-month';
    const yearName = fieldName + '-year';

    let body = req.form.values;
    let field = req.form.options.fields[fieldName];

    // save raw values to replay on validation error
    body[dayName + '-raw'] = body[dayName];
    body[monthName + '-raw'] = body[monthName];
    body[yearName + '-raw'] = body[yearName];

    body[dayName] = field.inexact ? '01' : this._padDayMonth(body[dayName]);
    body[monthName] = this._padDayMonth(body[monthName]);
    body[yearName] = this._padYear(body[yearName], field.offset);

    body[fieldName] = body[yearName] + '-' + body[monthName] + '-' + body[dayName];

    if (body[fieldName] === '--' || (field.inexact && body[fieldName] === '--01')) {
      body[fieldName] = '';
    }
  }

  _padDayMonth(value) {
    if (value && value.match(/^\d$/)) return '0' + value;
    return value;
  }

  _padYear(value, offset) {
    if (value && value.match(/^\d{2}$/)) {
      let year = parseInt(value, 10);
      let centurySplit = (moment().year() - 2000) + (offset || 0);
      let prefix = (year <= centurySplit) ? '20' : '19';
      return prefix + value;
    }
    return value;
  }

  validateFields(req, res, callback) {
    super.validateFields(req, res, errors => {
      _.forEach(req.form.options.dateFields, fieldName => this.validateDateField(req, fieldName, errors));
      callback(errors);
    });
  }

  validateDateField(req, fieldName, errors) {

    let fieldErrors = _.pick(errors, (error, key) => key !== fieldName && error.errorGroup === fieldName);

    let requiredErrors = _.pick(fieldErrors, error => error.type === 'required');
    if (!_.isEmpty(requiredErrors)) {
      let field = req.form.options.fields[fieldName];
      let fieldCount = field.inexact ? 2 : 3;
      let errorType = 'required';
      let part;
      if (Object.keys(requiredErrors).length < fieldCount) {
        part = _.find(DATE_PARTS, part => requiredErrors[fieldName + '-' + part]);
        /* istanbul ignore next */
        if (part) errorType += '-' + part;
      }
      errors[fieldName] = new this.Error(
        fieldName,
        {
          type: errorType,
          field: fieldName + '-' + (part || 'day'),
          errorGroup: fieldName
        },
        req
      );
      return;
    }

    if (!req.form.values[fieldName]) return;

    let numericErrors = _.pick(fieldErrors, error => error.type === 'numeric');
    if (!_.isEmpty(numericErrors)) {
      let errorType = 'numeric';
      let part;
      if (Object.keys(numericErrors).length === 1) {
        part = _.find(DATE_PARTS, part => numericErrors[fieldName + '-' + part]);
        /* istanbul ignore next */
        if (part) errorType += '-' + part;
      }
      errors[fieldName] = new this.Error(
        fieldName,
        {
          type: errorType,
          field: fieldName + '-' + (part || 'day'),
          errorGroup: fieldName
        },
        req
      );
      return;
    }

    if (req.form.values[fieldName].match(/^\d{4}-\d{2}-\d{2}$/)) {
      let code = moment(req.form.values[fieldName], 'YYYY-MM-DD').invalidAt();
      let invalidElement = null;
      /* istanbul ignore next */
      if (code === 0) invalidElement = 'year';
      if (code === 1) invalidElement = 'month';
      if (code === 2) invalidElement = 'day';

      if (invalidElement) {
        errors[fieldName] = errors[fieldName + '-' + invalidElement] = new this.Error(
          fieldName + '-' + invalidElement,
          {
            type: 'date-' + invalidElement,
            field: fieldName + '-' + invalidElement,
            errorGroup: fieldName
          },
          req);
      }
    }

    if (errors[fieldName] && !errors[fieldName].field) {
      errors[fieldName].field = fieldName + '-day';
    }
  }

  saveValues(req, res, next) {
    _.forEach(req.form.options.dateFields, fieldName => {
      DATE_PARTS.forEach(part => {
        delete req.form.values[fieldName + '-' + part];
        delete req.form.values[fieldName + '-' + part + '-raw'];
      });
    });
    super.saveValues(req, res, next);
  }
};
