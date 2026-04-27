/* eslint-disable */
'use strict';

const CountrySelect = require('./behaviours/country-select')
const SummaryPageBehaviour = require('../../../').components.summary;
const InternationalPhoneNumber = require('./behaviours/international-number');
const CombineAndLoopFields = require('../../../').components.combineAndLoopFields;

module.exports = {
  name: 'sandbox',
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
      next: '/add-other-name'
    },
    '/add-other-name': {
      template: 'list-add-looped-items',
      behaviours: [CombineAndLoopFields({
        groupName: 'otherNames',
        fieldsToGroup: ['otherName'],
        combineValuesToSingleField: 'record',
        returnTo: '/other-name',
        groupOptional: true
      })],
      next: '/other-name-summary',
      locals: {
        loopedPage: true
      }
    },
    '/other-name': {
      fields: ['otherName'],
      next: '/add-other-name',
      continueOnEdit: true
    },
    '/other-name-summary': {
      template: 'confirm',
      behaviours: [SummaryPageBehaviour],
      sections: require('./sections/other-name-summary-sections'),
      next: '/email'
    },

    // EXAMPLE OF HOW TO USE THE COMBINE AND LOOP FIELDS BEHAVIOUR

    //const CombineAndLoopFields = require('hof').components.combineAndLoopFields;
    // '/add-other-name': {
    //   template: 'list-add-looped-items',
    //   behaviours: [CombineAndLoopFields({
    //     groupName: 'other-names',
    //     fieldsToGroup: ['other-name'],
    //     groupOptional: true,
    //     removePrefix: 'other-',
    //     combineValuesToSingleField: 'record',
    //     returnTo: '/other-name'
    //   }), SaveFormSession],
    //   next: '/date-of-birth',
    //   backLink: 'add-previous-surname',
    //   locals: {
    //     section: 'other-name',
    //     showSaveAndExit: true,
    //     loopedPage: true,
    //     captionHeading: 'Section 4 of 15 - Additional names'
    //   }
    // },
    // '/other-name': {
    //   behaviours: SaveFormSession,
    //   fields: ['other-name'],
    //   next: '/add-other-name',
    //   backLink: 'add-other-name',
    //   continueOnEdit: true,
    //   locals: { showSaveAndExit: true, captionHeading: 'Section 4 of 15 - Additional names' }
    // },



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
