/* eslint-disable consistent-return */
'use strict';
/* eslint complexity: 0 */

const Data = require('../test-data');

module.exports = i => {
  const input = i || {};
  input.default = input.default || 'abc';

  const getDefault = (name, t) => {
    const type = t || 'text';
    if (name.indexOf('name') > -1) {
      if (name.indexOf('last') > -1 || name.indexOf('surname') > -1) {
        return Data.lastname;
      }
      if (name.indexOf('first') > -1) {
        return Data.firstname;
      }
      return Data.name;
    }
    if (name.indexOf('country') > -1 || name.indexOf('nationality') > -1) {
      return Data.country;
    }
    if (name.indexOf('postcode') > -1) {
      return Data.postcode;
    }
    if (name.indexOf('day') > -1) {
      return Data.number(1, 28).toString();
    }
    if (name.indexOf('month') > -1) {
      return Data.number(1, 12).toString();
    }
    if (name.indexOf('year') > -1) {
      return Data.number(1950, 1990).toString();
    }

    if (name.indexOf('email') > -1) {
      return Data.email;
    }
    if (name.indexOf('phone') > -1) {
      return Data.phone;
    }
    // don't provide a default value for field types with defined options
    if (['select', 'radio', 'checkbox', 'file'].indexOf(type) === -1) {
      return input.default;
    }
  };

  return (name, type) => {
    const value = input[name] !== undefined ? input[name] : getDefault(name, type);
    if (typeof value === 'function') {
      return value();
    }
    if (value && type === 'checkbox') {
      return [].concat(value);
    }
    return value;
  };
};
