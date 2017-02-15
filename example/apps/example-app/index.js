'use strict';

const SummaryPageBehaviour = require('hof-behaviour-summary-page');

module.exports = {
  name: 'example-app',
  params: '/:action?',
  steps: {
    '/': {
      behaviours: require('./behaviours/clear-session'),
      next: '/first-step'
    },
    '/first-step': {
      fields: [
        'your-name'
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
      behaviours: SummaryPageBehaviour,
      sections: {
        'personal-details': [
          'your-name',
          'email-address',
          'phone-number'
        ],
        'enquiry-details': [
          'date-example',
          'message'
        ]
      },
      next: '/confirmation'
    },
    '/confirmation': {
      backLink: false,
      clearSession: true
    }
  }
};
