'use strict';

module.exports = key => ({
  [`${key}-amount`]: {
    label: 'Amount',
    validate: ['required']
  },
  [`${key}-unit`]: {
    label: 'Unit',
    validate: ['required'],
    //autocomplete: 'required',
    options: {}
  }
});