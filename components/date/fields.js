'use strict';

module.exports = key => ({
  [`${key}-day`]: {
    label: 'Day',
    autocomplete: 'bday-day'
  },
  [`${key}-month`]: {
    label: 'Month',
    autocomplete: 'bday-month'
  },
  [`${key}-year`]: {
    label: 'Year',
    autocomplete: 'bday-year'
  }
});
