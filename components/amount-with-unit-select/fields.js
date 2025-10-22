'use strict';

module.exports = key => ({
  [`${key}-amount`]: {
    label: 'Amount',
    validate: []
  },
  [`${key}-unit`]: {
    label: 'Unit',
    groupedFieldsWithOptions : true,
    options: {},
    validate: []
  }
});