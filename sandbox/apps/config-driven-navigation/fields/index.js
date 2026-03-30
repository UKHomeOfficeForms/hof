const dateComponent = require('../../../../').components.date;

module.exports = {
  'selected-updates': {
    mixin: 'checkbox-group',
    validate: ['required'],
    isPageHeading: true,
    options: ['name', 'surname', 'dob', 'address', 'email', 'phone']
  },
  name: {
    mixin: 'input-text',
    validate: ['required', 'notUrl', { type: 'maxlength', arguments: [99] }],
    isPageHeading: true
  },
  surname: {
    mixin: 'input-text',
    validate: ['required', 'notUrl', { type: 'maxlength', arguments: [99] }],
    isPageHeading: true
  },
  'current-house-number': {
    mixin: 'input-text',
    validate: ['required', { type: 'maxlength', arguments: [50] }],
    labelClassName: 'govuk-label--m'
  },
  'current-street': {
    mixin: 'input-text',
    validate: ['required', { type: 'maxlength', arguments: [100] }],
    labelClassName: 'govuk-label--m'
  },
  'current-townOrCity': {
    mixin: 'input-text',
    validate: ['required', { type: 'maxlength', arguments: [100] }],
    labelClassName: 'govuk-label--m'
  },
  'current-county': {
    mixin: 'input-text',
    validate: [{ type: 'maxlength', arguments: [100] }],
    labelClassName: 'govuk-label--m'
  },
  'has-postcode': {
    mixin: 'radio-group',
    validate: ['required'],
    isPageHeading: true,
    options: ['yes', 'no']
  },
  postcode: {
    mixin: 'input-text',
    validate: ['required', 'postcode'],
    isPageHeading: true
  },
  dob: dateComponent('dob', {
    mixin: 'input-date',
    validate: ['required', 'date', { type: 'after', arguments: ['1900'] }]
  }),
  email: {
    mixin: 'input-text',
    validate: ['required', 'email'],
    isPageHeading: true
  },
  phone: {
    mixin: 'input-text',
    validate: ['required', 'internationalPhoneNumber'],
    isPageHeading: true
  }
};
