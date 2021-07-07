'use strict';

const countries = require('homeoffice-countries').allCountries;

const pick = set => set[Math.floor(Math.random() * set.length)];

const Data = {};

[
  'firstname',
  'lastname',
  'streetname',
  'streetsuffix',
  'town',
  'postcode',
  'domain'
].forEach(key => {
  const values = require(`./data/${key}`);
  Object.defineProperty(Data, key, {
    get: () => pick(values)
  });
});

Object.defineProperty(Data, 'name', {
  get: function () {
    return `${Data.firstname} ${Data.lastname}`;
  }
});

Object.defineProperty(Data, 'address', {
  get: function () {
    return `${Data.number(1, 100)} ${Data.streetname} ${Data.streetsuffix}, ${Data.town}, ${Data.postcode}`;
  }
});

Object.defineProperty(Data, 'email', {
  get: function () {
    return `${Data.firstname.toLowerCase()}.${Data.lastname.toLowerCase()}@${Data.domain}`;
  }
});

Object.defineProperty(Data, 'phone', {
  get: function () {
    const prefix = pick(['01', '07', '+44(0)7', '+44(0)1']);
    return `${prefix}${Data.number(100, 999)} ${Data.number(100, 999)} ${Data.number(100, 999)}`;
  }
});

Object.defineProperty(Data, 'country', {
  get: () => pick(countries)
});

Data.number = (mn, mx) => {
  let min = mn;
  let max = mx;

  if (min && max === undefined) {
    max = min;
    min = 0;
  }
  if (max === undefined) {
    max = 100;
  }
  return min + Math.floor(Math.random() * (max - min));
};

module.exports = Data;
