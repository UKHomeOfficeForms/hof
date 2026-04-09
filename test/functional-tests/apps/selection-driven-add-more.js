'use strict';

const selectionDrivenNavigation = require('../../..').components.selectionDrivenNavigation;

const navigationConfig = {
  selection: {
    field: 'selected_items',
    selectorStep: '/start',
    summaryStep: '/change-anything-else',
    emptySelectionTarget: '/start',
    addMore: {
      triggerStep: '/change-anything-else',
      triggerField: 'change_anything_else'
    },
    items: {
      'item-one': {
        order: 1,
        routes: ['/item-one']
      },
      'item-two': {
        order: 2,
        routes: ['/item-two']
      }
    }
  },
  routes: {
    '/change-anything-else': {
      branches: [
        {
          condition: {
            field: 'change_anything_else',
            value: 'yes'
          },
          next: '/start'
        },
        {
          condition: {
            field: 'change_anything_else',
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

module.exports = {
  steps: {
    '/start': {
      fields: ['selected_items'],
      backLink: false
    },
    '/item-one': {
      fields: ['item_one_value']
    },
    '/item-two': {
      fields: ['item_two_value']
    },
    '/change-anything-else': {
      fields: ['change_anything_else']
    },
    '/confirm': {
      next: '/submitted'
    },
    '/submitted': {
      backLink: false
    }
  },
  fields: {
    selected_items: {
      mixin: 'checkbox-group',
      options: ['item-one', 'item-two'],
      validate: ['required']
    },
    item_one_value: {
      validate: ['required']
    },
    item_two_value: {
      validate: ['required']
    },
    change_anything_else: {
      mixin: 'radio-group',
      options: ['yes', 'no'],
      validate: ['required']
    }
  },
  options: {
    name: 'selection-driven-add-more',
    confirmStep: '/confirm',
    behaviours: [selectionDrivenNavigation(navigationConfig)]
  }
};
