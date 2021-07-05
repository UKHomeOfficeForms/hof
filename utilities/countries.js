'use strict';

const countries = require('homeoffice-countries');

const transform = (list, opts) => {
  opts = opts || {};
  const parse = opts.parse || (country => country);
  const filter = opts.filter || (() => true);
  return list.filter(filter).map(country => ({ value: country, label: parse(country) }));
};

module.exports = options => transform(countries.allCountries, options);
