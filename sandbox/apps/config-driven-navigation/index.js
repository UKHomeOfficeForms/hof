
const SummaryPageBehaviour = require('../../../').components.summary;
const ConfigDrivenNext = require('../../../').components.selectionDrivenNavigation;
const journeyNavigation = require('./journey-navigation');

module.exports = {
  name: 'config-driven-navigation',
  baseUrl: '/config-driven-navigation',
  behaviours: [ConfigDrivenNext(journeyNavigation)],
  steps: {
    '/start': {
      fields: ['selected-updates'],
      backLink: false
    },
    '/name': {
      fields: ['name']
    },
    '/surname': {
      fields: ['surname']
    },
    '/dob': {
      fields: ['dob']
    },
    '/address': {
      fields: ['current-house-number', 'current-street', 'current-townOrCity', 'current-county']
    },
    '/has-postcode': {
      fields: ['has-postcode']
    },
    '/postcode': {
      fields: ['postcode']
    },
    '/email': {
      fields: ['email']
    },
    '/phone': {
      fields: ['phone']
    },
    '/confirm': {
      template: 'confirm',
      behaviours: [SummaryPageBehaviour],
      sections: require('./sections/summary-data-sections')
    },
    '/submitted': {
      backLink: false
    },
    '/exit': {}
  }
};
