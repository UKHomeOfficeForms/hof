'use strict';

const PostcodeLookup = require('../../../components').postcodeLookup;

module.exports = () => ({
  steps: {
    '/postcode-default-one': {
      behaviours: PostcodeLookup({
        addressKey: 'address-one',
        apiURL: 'http://localhost:8080/api/postcode-test',
        apiKey: 'test',
        required: true
      }),
      next: '/postcode-default-two'
    },
    '/postcode-default-two': {}
  }
});
