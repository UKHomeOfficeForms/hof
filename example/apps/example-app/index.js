/* eslint-disable */
'use strict';

const SummaryPageBehaviour = require('../../../').components.summary;
const InternationalPhoneNumber = require('./behaviours/international-number');
const SaveFormSession = require('./behaviours/save-form-session')
const getFormSession = require('./behaviours/get-form-session')
const areYouSure = require('./behaviours/are-you-sure')

module.exports = {
  name: 'example-app',
  steps: {
    '/sessions':{
      behaviours: getFormSession,
      template: 'sessions',
      next: '/landing-page'
    },
    '/are-you-sure':{
      behaviours: areYouSure,
      template: 'are-you-sure',
    },
    '/landing-page': {
      fields: [
        'landing-page-radio'
      ],
      next: '/name',
      forks: [{
        target: '/build-your-own-form',
        condition: {
          field: 'landing-page-radio',
          value: 'build-your-own-form'
        }
      }],
    },
    '/build-your-own-form': {
      template: 'form-guidance-link'
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
      next: '/checkboxes'
    },
    '/checkboxes': {
      fields: ['incomeTypes'],
      next: '/radio'
    },
    '/radio':{
      fields: ['countryOfHearing'],
      forks: [{
        target: '/text-input-area',
        condition: {
          field: 'landing-page-radio',
          value: 'complex-form'
        }
      }],
      next: '/email'
    },
    '/email': {
      fields: ['email'],
      next: '/phone-number'
    },
    '/phone-number': {
      fields: ['phone'],
      next: '/save-and-exit'
    },
    '/text-input-area': {
      fields: ['complaintDetails'],
      next: '/select'
    },
    '/select':{ 
      fields: ['appealStages'],
      next: '/save-and-exit'
    },
    '/save-and-exit':{
      behaviours: SaveFormSession,
      template: 'save-and-exit',
      next: '/confirm'
    },
    '/confirm': {
      behaviours: [SummaryPageBehaviour, 'complete'],
      sections: require('./sections/summary-data-sections'),
      next: '/confirmation'
    },
    '/confirmation': {
      backLink: false
    },
    '/international-phone-number': {
      behaviours: InternationalPhoneNumber,
      fields: [
        'int-phone-number'
      ],
      next: '/confirm'
    },
  }
};
