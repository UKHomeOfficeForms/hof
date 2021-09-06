'use strict';

const validators = require('../../../../controller').validators;

module.exports = SuperClass => class extends SuperClass {
  validateField(key, req) {
    const code = req.sessionModel.get('countryCode') || 'GB';
    const number = req.form.values['int-phone-number'];

    const isValid = validators.internationalPhoneNumber(number, code);

    if (!isValid) {
      return new this.ValidationError('int-phone-number', {
            key: 'int-phone-number',
            type: 'internationalPhoneNumber',
            redirect: undefined
          });
    }

    return super.validateField(key, req);
  }
};
