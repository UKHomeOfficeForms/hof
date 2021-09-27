/* eslint-disable */
'use strict';

const moment = require('moment');
const SummaryPageBehaviour = require('../../../').components.summary;

const DATE_FORMAT = 'YYYY-MM-DD';
const PRETTY_DATE_FORMAT = 'Do MMMM YYYY';

module.exports = {
  name: 'example-app',
  params: '/:action?',
  steps: {
    '/landing-page': {
      fields: [
        'landing-page-radio',
        'basic-form',
        'complex-form',
        'build-your-own-form'
      ],
      next: '/second-step'
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
