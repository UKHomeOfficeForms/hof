'use strict';

module.exports = key => ({
  [`${key}-Amount`]: {
    label: 'Amount',
    autocomplete: 'amount-value' //controller/validation/validators.js ??
  },
  [`${key}-Unit`]: {
    label: 'Unit',
    autocomplete: 'amount-value' //controller/validation/validators.js ??
  }
});