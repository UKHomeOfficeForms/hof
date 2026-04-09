'use strict';

module.exports = {
  selection: {
    field: 'selected-updates',
    selectorStep: '/start',
    summaryStep: '/change-anything-else',
    emptySelectionTarget: '/start',
    addMore: {
      triggerStep: '/change-anything-else',
      triggerField: 'change-anything-else'
    },
    items: {
      name: {
        order: 1,
        routes: ['/name']
      },
      surname: {
        order: 2,
        routes: ['/surname', '/surname-summary']
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
    '/change-anything-else': {
      branches: [
        {
          condition: {
            field: 'change-anything-else',
            value: 'yes'
          },
          next: '/start'
        },
        {
          condition: {
            field: 'change-anything-else',
            value: 'no'
          },
          next: '/confirm'
        }
      ]
    },
    '/confirm': {
      next: '/submitted'
    }
  }
};
