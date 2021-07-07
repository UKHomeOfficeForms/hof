'use strict';

const AddressLookup = require('../../../components').addressLookup;

module.exports = config => ({
  steps: {
    '/address-required-one': {
      behaviours: AddressLookup({
        addressKey: 'address-one',
        required: true,
        apiSettings: {
          hostname: `http://localhost:${config.port}/api/postcode-test`
        },
        validate: {
          allowedCountries: ['England']
        }
      }),
      next: '/address-required-two'
    },
    '/address-required-two': {}
  }
});
