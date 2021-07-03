'use strict';

const _ = require('lodash');

function format(f, value, formatters) {
  if (typeof f === 'string' && formatters[f]) {
    return formatters[f](value);
  } else if (typeof f === 'function') {
    return f(value);
  } else if (Array.isArray(f)) {
    f.forEach(v => {
      value = format(v, value, formatters);
    });
  }
  return value;
}

module.exports = (fields, _default, formatters) => (key, value) => {
  formatters = formatters || require('./formatters');
  value = _.castArray(value);
  if (_default && !(fields[key] && fields[key]['ignore-defaults'])) {
    value = value.map(item => format(_default, item, formatters));
  }
  if (fields[key] && fields[key].formatter) {
    value = value.map(item => format(fields[key].formatter, item, formatters));
  }
  if (value.length === 1) {
    value = value[0];
  }
  return value;
};
