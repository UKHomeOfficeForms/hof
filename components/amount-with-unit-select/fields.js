'use strict';

module.exports = key => ({
  [`${key}-amount`]: {
    label: 'Amount',
    validate: ['required']
  },
  [`${key}-unit`]: {
    label: 'Unit',
    validate: ['required'],
    options: {}
  }
});