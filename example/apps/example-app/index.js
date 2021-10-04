/* eslint-disable */
'use strict';

const moment = require('moment');
const SummaryPageBehaviour = require('../../../').components.summary;
const InternationalPhoneNumber = require('./behaviours/international-number');

const DATE_FORMAT = 'YYYY-MM-DD';
const PRETTY_DATE_FORMAT = 'Do MMMM YYYY';

module.exports = {
  name: 'example-app',
  steps: {
    '/landing-page': {
      fields: [
        'landing-page-radio'
      ],
      next: '/name',
      forks: [{
        target: 'build-your-own-form',
        condition: {
          field: 'landing-page-radio',
          value: 'build-your-own-form'
        }
      }],
    },
    '/name': {
      fields: ['name'],
      next: '/address'
    },
    '/address': {
      fields: ['building', 'street', 'townOrCity', 'postcode'],
      next: '/checkboxes',
    },
    '/checkboxes': {
      fields: ['incomeTypes'],
      next: '/confirm'
    },
    '/international-phone-number': {
      behaviours: InternationalPhoneNumber,
      fields: [
        'int-phone-number'
      ],
      next: '/confirm',
    },
    '/confirm': {
      behaviours: [SummaryPageBehaviour],
      sections: {
        applicantsDetails: [
          'name'
        ],
        address: [
          'building',
          'street',
          'townOrCity',
          'postcode'
        ],
        income: [
          'incomeTypes'
        ]
      },
      next: '/confirmation'
    }
  }
};
