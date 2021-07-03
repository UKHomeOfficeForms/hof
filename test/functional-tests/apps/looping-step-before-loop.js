'use strict';

module.exports = {
  steps: {
    '/loop': {
      next: '/confirm',
      forks: [
        {
          target: '/two',
          condition: {
            field: 'loop',
            value: 'yes'
          }
        }
      ],
      continueOnEdit: true,
      fields: ['loop']
    },
    '/two': {
      next: '/loop',
      continueOnEdit: true,
      fields: ['field-1']
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
