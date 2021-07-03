'use strict';

const moment = require('moment');
const _ = require('lodash');
const libPhoneNumber = require('libphonenumber-js/max');
const deprecate = require('deprecate');

// validator methods should return false (or falsy value) for *invalid* input
// and true (or truthy value) for *valid* input.
const dateFormat = 'YYYY-MM-DD';
let Validators;

module.exports = Validators = {

  string(value) {
    return typeof value === 'string';
  },

  decimal(value) {
    return value === '' || Validators.regex(value, /^-?[\d]*\.?\d{0,2}$/);
  },

  regex(value, match) {
    return Validators.string(value) && !!value.match(match);
  },

  required(value) {
    return value !== undefined && value !== '';
  },

  url(value) {
    return value === '' ||
      Validators.regex(value, /[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/);
  },

  notUrl(value) {
      return value === '' || !(Validators.url(value));
  },

  email(value) {
    // eslint-disable-next-line max-len
    return value === '' || Validators.regex(value, /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
  },

  between(value, min, max) {
    return value === '' || (value <= max && value >= min);
  },

  min(value, min) {
    return value === '' || value >= min;
  },

  max(value, max) {
    return value === '' || value <= max;
  },

  minlength(value, length) {
    length = length || 0;
    return Validators.string(value) && (value === '' || value.length >= length);
  },

  maxlength(value, length) {
    return Validators.string(value) && (value === '' || value.length <= length);
  },

  exactlength(value, length) {
    return Validators.string(value) && (value === '' || value.length === length);
  },

  alphanum(value) {
    return Validators.regex(value, /^[a-zA-Z0-9]*$/);
  },

  numeric(value) {
    return Validators.regex(value, /^\d*$/);
  },

  equal(value) {
    const values = [].slice.call(arguments, 1);
    value = _.castArray(value);
    return values.length && _.every(value, item =>
      item === '' || values.indexOf(item) > -1
    );
  },

  phonenumber(value) {
    deprecate('phonenumber validator', 'Recommend using internationalPhoneNumber for validating ' +
      'international numbers or a different phone validator for more specific requirements.');
    return value === '' || Validators.regex(value, /^\(?\+?[\d()-]{0,15}$/);
  },

  /**
   * Validates international phone numbers (fixed and mobile) including UK.
   * Non-GB phone numbers will require country code to validate.
   */
  internationalPhoneNumber(value) {
    let phoneNumber;
    phoneNumber = libPhoneNumber.parsePhoneNumberFromString(value, 'GB') || '';
    return value === '' || (phoneNumber && phoneNumber.isValid());
  },

  ukPhoneNumber(value) {
    const phoneNumber = libPhoneNumber.parsePhoneNumberFromString(value, 'GB');
    return phoneNumber && phoneNumber.isValid() && phoneNumber.country === 'GB';
  },

  ukmobilephone(value) {
    return value === '' || Validators.regex(value, /^(07)\d{9}$/);
  },

  date(value) {
    return value === '' || Validators.regex(value, /\d{4}\-\d{2}\-\d{2}/) && moment(value, dateFormat).isValid();
  },

  'date-year'(value) {
    return Validators.regex(value, /^\d{4}$/);
  },

  'date-month'(value) {
    return Validators.regex(value, /^\d{2}$/) && parseInt(value, 10) > 0 && parseInt(value, 10) < 13;
  },

  'date-day'(value) {
    return Validators.regex(value, /^\d{2}$/) && parseInt(value, 10) > 0 && parseInt(value, 10) < 32;
  },

  // eslint-disable-next-line no-inline-comments, spaced-comment
  before(value, date) {
    // validator can also do before(value, [diff, unit][, diff, unit])
    let valueDate = moment(value, dateFormat);
    let comparator;
    if (arguments.length === 2) {
      comparator = date;
    } else {
      comparator = moment();
      const args = [].slice.call(arguments, 1);
      let diff;
      let unit;
      while (args.length) {
        diff = args.shift();
        unit = args.shift() || 'years';
        valueDate = valueDate.add(diff, unit);
      }
    }
    return value === '' || Validators.date(value) && valueDate.isBefore(comparator);
  },

  after(value, date) {
    // validator can also do after(value, [diff, unit][, diff, unit])
    let valueDate = moment(value, dateFormat);
    let comparator;
    if (arguments.length === 2) {
      comparator = date;
    } else {
      comparator = moment();
      const args = [].slice.call(arguments, 1);
      let diff;
      let unit;
      while (args.length) {
        diff = args.shift();
        unit = args.shift() || 'years';
        valueDate = valueDate.add(diff, unit);
      }
    }
    return value === '' || Validators.date(value) && valueDate.isAfter(comparator);
  },

  over18(value) {
    return Validators.before(value, '18', 'years');
  },

  postcode(value) {
    // eslint-disable-next-line max-len
    return value === '' || Validators.regex(value, /^(([GIR] ?0[A]{2})|((([A-Z][0-9]{1,2})|(([A-Z][A-HJ-Y][0-9]{1,2})|(([A-Z][0-9][A-Z])|([A-Z][A-HJ-Y][0-9]?[A-Z])))) ?[0-9][A-Z]{2}))$/i);
  }

};
