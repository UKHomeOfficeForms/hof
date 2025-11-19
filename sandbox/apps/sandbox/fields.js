/* eslint-disable */
'use strict';

const dateComponent = require('../../../').components.date;
const staticAppealStages = require('./lib/staticAppealStages');
const amountWithUnitSelectComponent = require('../../../').components.amountWithUnitSelect;

module.exports = {
  'landing-page-radio': {
    mixin: 'radio-group',
    validate: ['required'],
    isPageHeading: true,
    // Design system says to avoid in-line unless it's two options,
    // so just added as an example below but by default it isn't
    className: ['govuk-radios--inline'],
    options: ['basic-form', 'complex-form', 'build-your-own-form']
  },
  name: {
    validate: ['required', 'notUrl', { type: 'maxlength', arguments: 200 }],
  },
  'dateOfBirth': dateComponent('dateOfBirth', {
    mixin: 'input-date',
    isPageHeading: 'true',
    validate: [
      'required',
      'date',
      { type: 'after', arguments: ['1900'] }
    ]
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
    isPageHeading: 'true',
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
    isPageHeading: 'true',
    mixin: 'radio-group',
    validate: ['required'],
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
  countrySelect: {
    mixin: 'select',
    isPageHeading: 'true',
    className: ['typeahead'],
    options:[''].concat(require('homeoffice-countries').allCountries),
    legend: {
      className: 'visuallyhidden'
    },
    validate: ['required']
  },
  complaintDetails: {
    mixin: 'textarea',
    // we want to ignore default formatters as we want
    // to preserve white space
    'ignore-defaults': true,
    // apply the other default formatters
    formatter: ['trim', 'hyphens'],
    isPageHeading: 'true',
    // attributes here are passed to the field element
    validate: ['required', { type: 'maxlength', arguments: 10 }],
    attributes: [{
      attribute: 'rows',
      value: 8
    }]
  },
  whatHappened: {
    mixin: 'textarea',
    // we want to ignore default formatters as we want
    // to preserve white space
    'ignore-defaults': true,
    // apply the other default formatters
    formatter: ['trim', 'hyphens'],
    isPageHeading: 'true',
    // attributes here are passed to the field element
    validate: ['required', { type: 'maxword', arguments: 10 }],
    attributes: [{
      attribute: 'rows',
      value: 8
    }]
  },
  appealStages: {
    mixin: 'select',
    isPageHeading: 'true',
    validate: ['required'],
    options: [{
      value: '',
      label: 'fields.appealStages.options.null'
    }].concat(staticAppealStages.getstaticAppealStages())
  },
  'amountWithUnitSelect' : amountWithUnitSelectComponent('amountWithUnitSelect', {
    mixin: 'input-amount-with-unit-select',
    amountLabel: "Amount-",
    unitLabel: "Unit-",
    options: [
      { "null": "Select" },
      { "label": "non trans option 1", "value": "1" },
      { "label": "non trans option 2", "value": "2" }
    ],
    hint: "E.G: 5 Kilogram",
    legend: 'Enter An Amount',
    isPageHeading: 'true',
    unitOptional: 'false',
    amountOptional: 'true',
    validate: ['alphanum']
  })
}
