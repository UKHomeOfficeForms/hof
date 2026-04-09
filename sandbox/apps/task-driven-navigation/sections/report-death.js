'use strict';

const formatDate = value => value && new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'long',
  year: 'numeric'
}).format(new Date(value));

module.exports = {
  deathReport: {
    steps: [
      {
        step: '/report-death/name',
        field: 'report-death-name'
      },
      {
        step: '/report-death/date',
        field: 'report-death-date',
        parse: value => formatDate(value)
      }
    ]
  }
};
