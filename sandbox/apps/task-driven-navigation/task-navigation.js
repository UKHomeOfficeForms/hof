'use strict';

module.exports = {
  taskSelection: {
    field: 'selected-task',
    selectorStep: '/start',
    finalSummaryStep: '/confirm',
    completedField: 'completed-tasks',
    tasks: {
      'change-personal-details': {
        order: 1,
        entryStep: '/personal-details/name',
        summaryStep: '/personal-details/check',
        routes: ['/personal-details/name', '/personal-details/dob', '/personal-details/anything-else']
      },
      'add-or-remove-dependant': {
        order: 2,
        entryStep: '/dependant/action',
        summaryStep: '/dependant/check',
        routes: ['/dependant/action', '/dependant/name', '/dependant/anything-else']
      },
      'send-evidence': {
        order: 3,
        entryStep: '/evidence/type',
        summaryStep: '/evidence/check',
        routes: ['/evidence/type', '/evidence/details', '/evidence/anything-else']
      },
      'tell-us-someone-has-died': {
        order: 4,
        entryStep: '/report-death/name',
        summaryStep: '/report-death/check',
        routes: ['/report-death/name', '/report-death/date', '/report-death/anything-else']
      }
    }
  },
  routes: {
    '/start': {
      next: 'selected-task-entry'
    },
    '/personal-details/anything-else': {
      branches: [
        {
          condition: {
            field: 'do-another-task',
            value: 'yes'
          },
          next: 'task-selector'
        },
        {
          condition: {
            field: 'do-another-task',
            value: 'no'
          },
          next: 'final-summary'
        }
      ]
    },
    '/dependant/anything-else': {
      branches: [
        {
          condition: {
            field: 'do-another-task',
            value: 'yes'
          },
          next: 'task-selector'
        },
        {
          condition: {
            field: 'do-another-task',
            value: 'no'
          },
          next: 'final-summary'
        }
      ]
    },
    '/evidence/anything-else': {
      branches: [
        {
          condition: {
            field: 'do-another-task',
            value: 'yes'
          },
          next: 'task-selector'
        },
        {
          condition: {
            field: 'do-another-task',
            value: 'no'
          },
          next: 'final-summary'
        }
      ]
    },
    '/report-death/anything-else': {
      branches: [
        {
          condition: {
            field: 'do-another-task',
            value: 'yes'
          },
          next: 'task-selector'
        },
        {
          condition: {
            field: 'do-another-task',
            value: 'no'
          },
          next: 'final-summary'
        }
      ]
    }
  }
};
