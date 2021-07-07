'use strict';

module.exports = key => ({
  [`${key}-day`]: {
    label: 'Day'
  },
  [`${key}-month`]: {
    label: 'Month'
  },
  [`${key}-year`]: {
    label: 'Year'
  }
});
