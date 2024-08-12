'use strict';

const PostcodeLookup = require('../../../components').postcodeLookup;

module.exports = config => ({
  steps: {
    '/postcode-default-one': {
      behaviours: PostcodeLookup({
        addressKey: 'address-one',
        apiURL: `http://localhost:${config.port}/api/postcode-test`,
        apiKey: 'test',
        required: true
      }),
      next: '/postcode-default-two'
    },
    '/postcode-default-two': {}
  }
});
