/* eslint-disable */
'use strict';

const moment = require('moment');
const SummaryPageBehaviour = require('../../../').components.summary;
const InternationalPhoneNumber = require('./behaviours/international-number');
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
      next: '/dob'
    },
    '/dob': {
      fields: ['dateOfBirth'],
      next: '/address'
    },
    '/address': {
      fields: ['building', 'street', 'townOrCity', 'postcode'],
      next: '/checkboxes',
    },
    '/checkboxes': {
      fields: ['incomeTypes'],
      next: '/radio'
    },
    '/radio':{
      fields: ['countryOfHearing'],
      next: '/confirm'
    },
    '/international-phone-number': {
      behaviours: InternationalPhoneNumber,
      fields: [
        'int-phone-number'
      ],
      next: '/confirm',
    },
    '/check':{

    },
    '/confirm': {
      behaviours: [SummaryPageBehaviour],
      sections: {
        applicantsDetails: [
          'name',
          {
            field: 'dateOfBirth',
            parse: d => d && moment(d).format(PRETTY_DATE_FORMAT)
          }
        ],
        address: [
          'building',
          'street',
          'townOrCity',
          'postcode'
        ],
        income: [
          'incomeTypes'
        ], 
        appealDetails: [
          'countryOfHearing'
        ]
      },
      next: '/confirmation'
    }
  }
};
