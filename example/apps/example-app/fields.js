/* eslint-disable */
'use strict';

module.exports = {
  'landing-page-radio': {
    mixin: 'radio-group',
    validate: ['required'],
    legend: {
      className: 'visuallyhidden'
    },
    options: [{
      value: 'basic-form',
      label: 'Basic form'
    }, {
      value: 'complex-form',
      label: 'Complex form'
    }, {
      value: 'build-your-own-form',
      label: 'Build your own form'
    }],
  }
};
