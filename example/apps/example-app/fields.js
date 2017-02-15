'use strict';

const dateComponent = require('hof-component-date');

module.exports = {
  'your-name': {
    mixin: 'input-text',
    // a custom validator can be used by passing a named function
    // as a validator. The error-type is the name of the function
    validate: ['required', function moreThanOneWord(input) {
      return input.split(' ').length > 1;
    }],
    // if there is a single field on a step, it is a convention to show
    // it as the step title. Example here:
    // http://govuk-elements.herokuapp.com/form-elements#form-radio-buttons
    // Adding the class "visuallyhidden" prevents the default label from
    // rendering the same label again. There is an outstanding issue with
    // screenreaders reading the label/title twice:
    // https://github.com/alphagov/govuk_elements/issues/320
    labelClassName: 'visuallyhidden'
  },
  'date-example': dateComponent('date-example', {
    validate: ['required', 'date', 'before']
  }),
  'email-address': {
    mixin: 'input-text',
    validate: ['required', 'email']
  },
  'phone-number': {
    mixin: 'input-text',
    validate: 'required'
  },
  'message': {
    mixin: 'textarea',
    validate: 'required',
    labelClassName: 'visuallyhidden',
    // we want to ignore default formatters as we want
    // to preserve white space
    'ignore-defaults': true,
    // apply the other default formatters
    formatter: ['trim', 'hyphens'],
    // attributes here are passed to the field element
    attributes: [{
      attribute: 'rows',
      value: 6
    }]
  }
};
