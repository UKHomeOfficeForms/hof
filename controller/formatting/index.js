'use strict';

const _ = require('lodash');

function format(f, val, formatters) {
  let value = val;
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

module.exports = (fields, _default, f) => (key, v) => {
  const formatters = f || require('./formatters');
  let value = _.castArray(v);
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
