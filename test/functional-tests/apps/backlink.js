'use strict';

const AddressLookup = require('../../../components').addressLookup;

module.exports = config => ({
  steps: {
    '/address-backlink-one': {
      next: '/address-backlink-two'
    },
    '/address-backlink-two': {
      behaviours: AddressLookup({
        addressKey: 'address-one',
        apiSettings: {
          hostname: `http://localhost:${config.port}/api/postcode-test`
        },
        validate: {
          allowedCountries: ['England']
        }
      })
    }
  }
});
