
const SummaryPageBehaviour = require('../../../').components.summary;
const ConfigDrivenNext = require('../../../').components.selectionDrivenNavigation;
const journeyNavigation = require('./journey-navigation');
const AggregateSaveUpdate = require('./behaviours/aggregator-save-update');
const LimitAggregateItems = require('./behaviours/limit-aggregator');

module.exports = {
  name: 'config-driven-navigation',
  baseUrl: '/config-driven-navigation',
  behaviours: [ConfigDrivenNext(journeyNavigation)],
  params: '/:action?/:id?/:edit?',
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
    '/surname-summary': {
      behaviours: [AggregateSaveUpdate, LimitAggregateItems],
      aggregateTo: 'previoussurnames',
      aggregateFrom: ['surname'],
      addStep: 'surname',
      aggregateLimit: 5
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
    '/change-anything-else': {
      fields: ['change-anything-else']
    },
    '/confirm': {
      template: 'confirm',
      backLink: '/config-driven-navigation/change-anything-else',
      behaviours: [SummaryPageBehaviour],
      sections: require('./sections/summary-data-sections')
    },
    '/submitted': {
      backLink: false
    },
    '/exit': {}
  }
};
