'use strict';

const controllers = require('hof-controllers');

module.exports = {
  name: 'example-app',
  params: '/:action?',
  steps: {
    '/': {
      controller: controllers.start,
      next: '/first-step'
    },
    '/first-step': {
      fields: [
        'your-name'
      ],
      next: '/second-step',
      locals: {
        // this is used to group sets of fields together in the
        // check your answers page, and the email
        section: 'personal-details'
      }
    },
    '/second-step': {
      fields: [
        'email-address',
        'phone-number'
      ],
      next: '/third-step',
      locals: {
        section: 'personal-details'
      }
    },
    '/third-step': {
      fields: [
        'message'
      ],
      next: '/confirm',
      locals: {
        section: 'enquiry-details'
      }
    },
    '/confirm': {
      controller: controllers.confirm,
      fieldsConfig: require('./fields'),
      emailConfig: require('../../config').email,
      next: '/confirmation'
    },
    '/confirmation': {
      backLink: false,
      clearSession: true
    }
  }
};
