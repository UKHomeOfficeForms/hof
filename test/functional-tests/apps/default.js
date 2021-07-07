'use strict';

module.exports = {
  steps: {
    '/zero': {
      next: '/one'
    },
    '/one': {
      next: '/one-a',
      fields: ['field-1']
    },
    '/one-a': {
      next: '/two',
      fields: ['field-1']
    },
    '/two': {
      next: '/three',
      forks: [
        {
          target: '/one',
          condition: {
            field: 'loop',
            value: 'yes'
          }
        }
      ],
      fields: ['loop']
    },
    '/three': {
      next: '/four-1',
      fields: ['fork'],
      forks: [
        {
          target: '/four-2',
          condition: {
            field: 'fork',
            value: 'yes'
          }
        }
      ]
    },
    '/four-1': {
      next: '/confirm',
      fields: ['field-2']
    },
    '/four-2': {
      next: '/confirm',
      fields: ['field-3']
    },
    '/confirm': {
      behaviours: 'complete',
      next: '/confirmation'
    },
    '/confirmation': {}
  },
  fields: {
    loop: {
      mixin: 'radio-group',
      options: ['yes', 'no'],
      validate: 'required'
    },
    fork: {
      mixin: 'radio-group',
      options: ['yes', 'no'],
      validate: 'required'
    }
  }
};
