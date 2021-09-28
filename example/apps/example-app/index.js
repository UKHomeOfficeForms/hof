/* eslint-disable */
'use strict';

const moment = require('moment');
const SummaryPageBehaviour = require('../../../').components.summary;

const DATE_FORMAT = 'YYYY-MM-DD';
const PRETTY_DATE_FORMAT = 'Do MMMM YYYY';

module.exports = {
  name: 'example-app',
  steps: {
    '/landing-page': {
      fields: [
        'landing-page-radio'
      ],
      next: '/second-step',
      forks: [{
        target: '/basic-form',
        condition: {
          field: 'landing-page-radio',
          value: 'basic-form'
        }
      }, {
        target: '/complex-form',
        condition: {
          field: 'landing-page-radio',
          value: 'complex-form'
        }},
        {
        target: '/build-your-own-form',
        condition: {
          field: 'landing-page-radio',
          value: 'build-your-own-form'
          }}
    ],
    },
    '/second-step': {
      fields: [
        'email-address',
        'phone-number'
      ],
      next: '/third-step'
    },
    '/third-step': {
      fields: [
        'date-example'
      ],
      next: '/fourth-step'
    },
    '/fourth-step': {
      fields: [
        'message'
      ],
      next: '/confirm'
    },
    '/confirm': {
      behaviours: [SummaryPageBehaviour, 'complete'],
      sections: {
        'personal-details': [
          'your-name',
          'email-address',
          'phone-number'
        ],
        'enquiry-details': [
          {
            field: 'date-example',
            parse: value => moment(value, DATE_FORMAT).format(PRETTY_DATE_FORMAT)
          },
          'message'
        ]
      },
      next: '/confirmation'
    },
    '/confirmation': {
      backLink: false
    }
  }
};
