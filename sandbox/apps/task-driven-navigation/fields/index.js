'use strict';

const dateComponent = require('../../../../').components.date;

module.exports = {
  'selected-task': {
    mixin: 'radio-group',
    validate: ['required'],
    isPageHeading: true,
    options: [
      'change-personal-details',
      'add-or-remove-dependant',
      'send-evidence',
      'tell-us-someone-has-died'
    ]
  },
  name: {
    mixin: 'input-text',
    validate: ['required', 'notUrl', { type: 'maxlength', arguments: [99] }],
    isPageHeading: true
  },
  dob: dateComponent('dob', {
    mixin: 'input-date',
    validate: ['required', 'date', { type: 'after', arguments: ['1900'] }]
  }),
  'dependant-action': {
    mixin: 'radio-group',
    validate: ['required'],
    isPageHeading: true,
    options: ['add', 'remove']
  },
  'dependant-name': {
    mixin: 'input-text',
    validate: ['required', 'notUrl', { type: 'maxlength', arguments: [99] }],
    isPageHeading: true
  },
  'evidence-type': {
    mixin: 'radio-group',
    validate: ['required'],
    isPageHeading: true,
    options: ['passport', 'bank-statement', 'tenancy-document']
  },
  'evidence-details': {
    mixin: 'textarea',
    validate: ['required', { type: 'maxlength', arguments: [250] }],
    isPageHeading: true
  },
  'report-death-name': {
    mixin: 'input-text',
    validate: ['required', 'notUrl', { type: 'maxlength', arguments: [99] }],
    isPageHeading: true
  },
  'report-death-date': dateComponent('report-death-date', {
    mixin: 'input-date',
    validate: ['required', 'date', { type: 'after', arguments: ['1900'] }]
  }),
  'do-another-task': {
    mixin: 'radio-group',
    validate: ['required'],
    isPageHeading: true,
    options: ['yes', 'no']
  }
};
