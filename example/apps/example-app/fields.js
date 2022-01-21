/* eslint-disable */
'use strict';

const _ = require('lodash');
const dateComponent = require('../../../').components.date;
const staticAppealStages = require('./lib/staticAppealStages');

function notBothOptions(vals) {
  const values = _.castArray(vals);
  return !(values.length > 1 && values.indexOf('unspecified') > -1);
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
    validate: ['required', 'notUrl', { type: 'maxlength', arguments: 200 }],
  },
  dateOfBirth: dateComponent('dateOfBirth', {
    validate: ['required', 'before', { type: 'after', arguments: ['1900'] }]
  }),
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
    labelClassName: 'visuallyhidden',
    validate: ['required'],
    options: [
      'salary',
      'universal_credit',
      'child_benefit',
      'housing_benefit',
      'other'
    ]
  },
  countryOfHearing: {
    mixin: 'radio-group',
    validate: ['required'],
    legend: {
      className: 'visuallyhidden'
    },
    options: [
      'englandAndWales',
      'scotland',
      'northernIreland'
    ]
  },
  email: {
    validate: ['required', 'email']
  },
  phone: {
    validate: ['required', 'internationalPhoneNumber']
  },
  'int-phone-number': {
    validate: ['required'],
    labelClassName: 'visuallyhidden'
  },
  complaintDetails: {
    mixin: 'textarea',
    labelClassName: 'visuallyhidden',
    // we want to ignore default formatters as we want
    // to preserve white space
    'ignore-defaults': true,
    // apply the other default formatters
    formatter: ['trim', 'hyphens'],
    // attributes here are passed to the field element
    validate: ['required', { type: 'maxlength', arguments: 5000 }],
    attributes: [{
      attribute: 'rows',
      value: 8
    }]
  },
  weaponsTypes:{
    mixin: 'checkbox-group',
    labelClassName: 'visuallyhidden',
    validate: ['required', notBothOptions],
    options: [
      {
        value: 'unspecified',
        child: 'partials/or'
      },        
      'fully_automatic',
      'self_loading',
      'short_pistols',
      'short_self_loading',
      'large_revolvers',
      'rocket_launchers',
      'air_rifles',
      'fire_noxious_substance',
      'disguised_firearms',
      'military_use_rockets',
      'projecting_launchers'
    ]
  },
  appealStages: {
    mixin: 'select',
    labelClassName: 'visuallyhidden',
    validate: ['required'],
    options: [{
      value: '',
      label: 'fields.appealStages.options.null'
    }].concat(staticAppealStages.getstaticAppealStages())
  }
}
