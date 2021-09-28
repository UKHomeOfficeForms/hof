/* eslint-disable */
'use strict';

const dateComponent = require('../../..').components.date;

module.exports = {
  'landing-page-radio': {
    mixin: 'radio-group',
    validate: ['required'],
    legend: {
      className: 'visuallyhidden'
    },
    options: [{
      value: 'basic-form',
      label: 'Basic form'
    }, {
      value: 'complex-form',
      label: 'Complex form'
    }, {
      value: 'build-your-own-form',
      label: 'Build your own form'
    }],
  },
  'date-example': dateComponent('date-example', {
    validate: ['required', 'date', 'before']
  }),
  'email-address': {
    mixin: 'input-text',
    validate: ['required', 'email']
  },
  'phone-number': {
    mixin: 'input-text',
    validate: 'required'
  },
  message: {
    mixin: 'textarea',
    validate: 'required',
    labelClassName: 'visuallyhidden',
    // we want to ignore default formatters as we want
    // to preserve white space
    'ignore-defaults': true,
    // apply the other default formatters
    formatter: ['trim', 'hyphens'],
    // attributes here are passed to the field element
    attributes: [{
      attribute: 'rows',
      value: 6
    }]
  }
};
