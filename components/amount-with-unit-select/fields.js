'use strict';

module.exports = key => ({
  [`${key}-amount`]: {
    label: 'Amount'
  },
  [`${key}-unit`]: {
    label: 'Unit',
    options: {}
  }
});