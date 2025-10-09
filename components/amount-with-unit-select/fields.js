'use strict';

module.exports = key => ({
  [`${key}-amount`]: {
    label: 'Amount',
    autocomplete: 'off',
    validate: []
  },
  [`${key}-unit`]: {
    label: 'Unit',
    groupedFieldsWithOptions: true,
    options: {},
    validate: []
  }
});
