'use strict';

const countries = require('homeoffice-countries');

const transform = (list, options) => {
  const opts = options || {};
  const parse = opts.parse || (country => country);
  const filter = opts.filter || (() => true);
  return list.filter(filter).map(country => ({ value: country, label: parse(country) }));
};

module.exports = options => transform(countries.allCountries, options);
