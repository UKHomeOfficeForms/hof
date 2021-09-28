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
        }
      }, {
        target: '/build-your-own-form',
        condition: {
          field: 'landing-page-radio',
          value: 'build-your-own-form'
          }
      }
      ],
    }
  }
};
