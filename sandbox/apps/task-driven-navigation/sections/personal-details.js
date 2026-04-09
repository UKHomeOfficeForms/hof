'use strict';

const formatDate = value => value && new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'long',
  year: 'numeric'
}).format(new Date(value));

module.exports = {
  personalDetails: {
    steps: [
      {
        step: '/personal-details/name',
        field: 'name'
      },
      {
        step: '/personal-details/dob',
        field: 'dob',
        parse: value => formatDate(value)
      }
    ]
  }
};
