'use strict';

const SummaryPageBehaviour = require('../../../').components.summary;
const TaskDrivenNavigation = require('../../../').components.taskDrivenNavigation;
const taskNavigation = require('./task-navigation');

module.exports = {
  name: 'task-driven-navigation',
  baseUrl: '/task-driven-navigation',
  behaviours: [TaskDrivenNavigation(taskNavigation)],
  steps: {
    '/start': {
      fields: ['selected-task'],
      next: '/start',
      backLink: false
    },
    '/personal-details/name': {
      fields: ['name'],
      next: '/personal-details/dob'
    },
    '/personal-details/dob': {
      fields: ['dob'],
      next: '/personal-details/check'
    },
    '/personal-details/check': {
      template: 'task-check',
      behaviours: [SummaryPageBehaviour],
      sections: require('./sections/personal-details'),
      next: '/personal-details/anything-else'
    },
    '/personal-details/anything-else': {
      fields: ['do-another-task'],
      next: '/personal-details/anything-else'
    },
    '/dependant/action': {
      fields: ['dependant-action'],
      next: '/dependant/name'
    },
    '/dependant/name': {
      fields: ['dependant-name'],
      next: '/dependant/check'
    },
    '/dependant/check': {
      template: 'task-check',
      behaviours: [SummaryPageBehaviour],
      sections: require('./sections/dependant'),
      next: '/dependant/anything-else'
    },
    '/dependant/anything-else': {
      fields: ['do-another-task'],
      next: '/dependant/anything-else'
    },
    '/evidence/type': {
      fields: ['evidence-type'],
      next: '/evidence/details'
    },
    '/evidence/details': {
      fields: ['evidence-details'],
      next: '/evidence/check'
    },
    '/evidence/check': {
      template: 'task-check',
      behaviours: [SummaryPageBehaviour],
      sections: require('./sections/evidence'),
      next: '/evidence/anything-else'
    },
    '/evidence/anything-else': {
      fields: ['do-another-task'],
      next: '/evidence/anything-else'
    },
    '/report-death/name': {
      fields: ['report-death-name'],
      next: '/report-death/date'
    },
    '/report-death/date': {
      fields: ['report-death-date'],
      next: '/report-death/check'
    },
    '/report-death/check': {
      template: 'task-check',
      behaviours: [SummaryPageBehaviour],
      sections: require('./sections/report-death'),
      next: '/report-death/anything-else'
    },
    '/report-death/anything-else': {
      fields: ['do-another-task'],
      next: '/report-death/anything-else'
    },
    '/confirm': {
      template: 'task-check',
      behaviours: [SummaryPageBehaviour],
      sections: require('./sections/final'),
      next: '/submitted'
    },
    '/submitted': {
      backLink: false
    },
    '/exit': {}
  }
};
