'use strict';

module.exports = {
  selection: {
    field: 'selected-updates',
    selectorStep: '/start',
    summaryStep: '/confirm',
    emptySelectionTarget: '/start',
    items: {
      name: {
        order: 1,
        routes: ['/name']
      },
      surname: {
        order: 2,
        routes: ['/surname']
      },
      dob: {
        order: 3,
        routes: ['/dob']
      },
      address: {
        order: 4,
        routes: ['/address', '/has-postcode', '/postcode']
      },
      email: {
        order: 5,
        routes: ['/email']
      },
      phone: {
        order: 6,
        routes: ['/phone']
      }
    }
  },
  routes: {
    '/has-postcode': {
      branches: [
        {
          condition: {
            field: 'has-postcode',
            value: 'yes'
          },
          continueOnEdit: true,
          next: '/postcode'
        },
        {
          condition: {
            field: 'has-postcode',
            value: 'no'
          },
          next: 'next-selected-item'
        }
      ]
    },
    '/confirm': {
      next: '/submitted'
    }
  }
};
