'use strict';

module.exports = {
  options: {
    confirmStep: '/summary'
  },
  steps: {
    '/one': {
      next: '/two',
      fields: ['field-1']
    },
    '/two': {
      next: '/three',
      fields: ['field-2']
    },
    '/three': {
      next: '/summary',
      fields: ['field-3']
    },
    '/summary': {
      behaviours: 'complete',
      next: '/confirmation'
    },
    '/confirmation': {}
  },
  fields: {}
};
