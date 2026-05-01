/* eslint-disable */
'use strict';

const CountrySelect = require('./behaviours/country-select')
const SummaryPageBehaviour = require('../../../').components.summary;
const InternationalPhoneNumber = require('./behaviours/international-number');
const Aggregate = require('./behaviours/aggregator');
const { add } = require('lodash');
module.exports = {
  name: 'sandbox',
  params: '/:action?/:id?/:field?',
  steps: {
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
      next: '/has-other-name'
    },
    '/has-other-name': {
      fields: ['hasOtherName'],
      forks: [{
        target: '/name-details',
        condition: {
          field: 'hasOtherName',
          value: 'yes'
        }
       }],
       next: '/email'
    },
    '/other-name': {
      fields: ['otherName', 'otherMidName'],
      next: '/other-surname',
      continueOnEdit: true
    },
    '/other-surname': {
      fields: ['otherSurname'],
      next: '/name-details',
      continueOnEdit: true
    },
    '/name-details': {
      template: 'summary-name-list',
      behaviours: Aggregate,
      aggregateTo: 'otherNames',
      aggregateFrom: [
        'otherName',
        'otherMidName',
        'otherSurname',
      ],
      titleField: 'otherName',
      addStep: 'other-name',
      continueOnEdit: true,
      locals: { showSaveAndExit: true },
      next: '/dob'
    },
    '/dob': {
      fields: ['dateOfBirth'],
      locals: { showSaveAndExit: true },
      next: '/amount-unit'
    },
    '/amount-unit':{ 
      fields: ['amountWithUnitSelect'], 
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
        target: '/country-select',
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
      next: '/confirm'
    },
    '/country-select': {
      behaviours: CountrySelect,
      fields: ['countrySelect'],
      next: '/text-input-area'
    },
    '/text-input-area': {
      fields: ['complaintDetails'],
      next: '/word-count'
    },
    '/word-count': {
      fields: ['whatHappened'],
      next: '/select'
    },
    '/select':{ 
      fields: ['appealStages'], 
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
    '/exit': {},
    '/save-and-exit': {}
  }
};
