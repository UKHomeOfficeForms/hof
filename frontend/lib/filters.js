'use strict';

const path = require('path').posix;
const moment = require('moment');
const bytes = require('bytes');

let filters = {
  currency(input, { currencySymbol = '£', zeroValue, penceToPound } = {}) {
    let value = parseFloat(input);

    if (isNaN(value)) return input;
    else if (zeroValue !== undefined && value == 0) return zeroValue;
    else if (penceToPound) value /= 100;

    if (value % 1 === 0) value = value.toString();
    else value = value.toFixed(2);
    return currencySymbol + value;
  },

  currencyOrFree(value, config) {
    return filters.currency.call(this, value, Object.assign({ zeroValue: filters.translate.call(this, 'free') }, config));
  },

  date(text, format = 'D MMMM YYYY', locale = 'en', invalid = '') {
    if (!text) return invalid;
    let date = moment(text);
    if (!date.isValid()) return invalid;
    date.locale(locale);
    return date.format(format);
  },

  hyphernate(text) {
    if (typeof text !== 'string') return text;
    return text.trim().toLowerCase().replace(/\s+/g, '-');
  },

  uppercase(text) {
    if (typeof text !== 'string') return text;
    return text.toUpperCase();
  },

  lowerCase(text) {
    if (typeof text !== 'string') return text;
    return text.toLowerCase();
  },

  capscase(text) {
    if (typeof text !== 'string') return text;
    return `${text.substring(0, 1).toUpperCase()}${text.substring(1)}`;
  },

  camelcase(text) {
    if (typeof text !== 'string') return text;
    return text.toLowerCase().replace(/^[^a-z0-9]+/g, '').replace(/[^a-z0-9]+$/g, '')
      .replace(/[^a-z0-9]+([a-z])/g, (_, letter) => letter.toUpperCase());
  },

  possessive(text, lang = 'en', curly = false) {
    if (typeof text !== 'string') return text;
    let apos = curly ? '’' : '\'';
    if (lang === 'en') return text.slice(-1) === 's' ? `${text}${apos}` : `${text}${apos}s`;
    return text;
  },

  time(value, { short = true, midnight = true, midday = true }) {
    if (midnight) {
      value = value.replace(/12:00am/ig, 'midnight');
      value = value.replace(/^midnight/ig, 'Midnight');
    }
    if (midday) {
      value = value.replace(/12:00pm/ig, 'midday');
      value = value.replace(/^midnday/ig, 'Midday');
    }
    if (short) {
      value = value.replace(/:00(am|pm)/ig, '$1');
    }
    return value;
  },

  translate(text, config) {
    return this.ctx.translate ? this.context.translate(text, config) : text;
  },

  jsonStringify(obj) {
    return JSON.stringify(obj, null, 2);
  },

  url(url) {
    return this.ctx.baseUrl ? path.resolve(this.ctx.baseUrl, url) : url;
  },

  urlencode(url) {
    return typeof url === 'string' ? encodeURIComponent(url) : url;
  },

  bytes(value) {
    return typeof value === 'number' ? bytes(value) : value;
  },

  filter(object, condition) {
    if (!object) return object;
    if (Array.isArray(object)) {
      if (condition === undefined) return object.filter(i => i);
      else if (condition === null) return object.filter(i => i !== null && i !== undefined);
      else if (typeof condition == 'object') return object.filter(i => {
        if (!i) return false;
        return Object.keys(condition).filter(key => i[key] === condition[key]).length;
      });
      condition = String(condition);
      return object.filter(i => i[condition]);
    }
    if (typeof object === 'object') {
      let keys = Object.keys(object);
      if (condition === undefined) keys = keys.filter(i => object[i]);
      else if (condition === null) keys = keys.filter(i => object[i] !== null && object[i] !== undefined);
      else if (typeof condition === 'object') keys = keys.filter(i => {
        if (!object[i]) return false;
        return Object.keys(condition).filter(key => object[i][key] === condition[key]).length;
      });
      else {
        condition = String(condition);
        keys = keys.filter(i => object[i] && object[i][condition]);
      }
      let result = {};
      keys.forEach(key => result[key] = object[key]);
      return result;
    }
    return object;
  },

  push(array, item) {
    if (Array.isArray(array)) return [...array, item];
    return array;
  },

  unshift(array, item) {
    if (Array.isArray(array)) return [item, ...array];
    return array;
  },

  add(object, key, item) {
    if (object && typeof object === 'object') return Object.assign({}, object, { [key]: item });
    return object;
  },

  delete(object, key) {
    if (object && typeof object === 'object') {
      object = Object.assign({}, object);
      delete object[key];
    }
    return object;
  }

};

let addFilters = nunjucksEnv => {
  for (const name in filters) nunjucksEnv.addFilter(name, filters[name]);
};

module.exports = {
  filters,
  addFilters
}
