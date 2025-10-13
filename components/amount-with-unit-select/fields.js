'use strict';

module.exports = key => ({
  [`${key}-amount`]: {
    label: 'Amount',
    //autocomplete: 'amount-value' //controller/validation/validators.js ??
  },
  [`${key}-unit`]: {
    label: 'Unit',
  }
});