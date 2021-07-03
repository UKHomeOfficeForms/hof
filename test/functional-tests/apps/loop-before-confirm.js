'use strict';

module.exports = {
  steps: {
    '/one': {
      next: '/two',
      fields: ['field-1']
    },
    '/two': {
      next: '/confirm',
      forks: [
        {
          target: '/one',
          condition: {
            field: 'loop',
            value: 'yes'
          }
        }
      ],
      continueOnEdit: true,
      fields: ['loop']
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
    }
  }
};
