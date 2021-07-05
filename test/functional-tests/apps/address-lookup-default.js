'use strict';

const AddressLookup = require('../../../components').addressLookup;

module.exports = config => ({
  steps: {
    '/address-default-one': {
      behaviours: AddressLookup({
        addressKey: 'address-one',
        apiSettings: {
          hostname: `http://localhost:${config.port}/api/postcode-test`
        },
        validate: {
          allowedCountries: ['England']
        }
      }),
      next: '/address-default-two'
    },
    '/address-default-two': {}
  }
});
