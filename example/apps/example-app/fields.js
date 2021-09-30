/* eslint-disable */
'use strict';
const _ = require('lodash');

//Is there a better place to put this function? Custom validator folder?
function notBothOptions(vals) {
  const values = _.castArray(vals);
  return !(values.length > 1 && values.indexOf('None of the above') > -1);
}

module.exports = {
  'landing-page-radio': {
    mixin: 'radio-group',
    validate: ['required'],
    legend: {
      className: 'visuallyhidden'
    },
    options: ['basic-form', 'complex-form', 'build-your-own-form']
  },
  name: {
    validate:['required', 'notUrl', { type: 'maxlength', arguments: 200 }],
  },
  building: {
    validate: ['required', 'notUrl', { type: 'maxlength', arguments: 100 }]
  },
  street: {
    validate: ['notUrl', { type: 'maxlength', arguments: 50 }],
    labelClassName: 'visuallyhidden'
  }, 
  townOrCity: {
    validate: ['required', 'notUrl',
      { type: 'regex', arguments: /^([^0-9]*)$/ },
      { type: 'maxlength', arguments: 100 }
    ]
  },
  postcode: {
    validate: ['required', 'postcode'],
    formatter: ['removespaces', 'uppercase']
  },
  incomeTypes: {
    mixin: 'checkbox-group',
    validate: ['required'],
    options: [
      'Salary',
      'Universal Credit',
      'Child Benefit',
      'Housing Benefit',
      'Other'
    ]
  }
}