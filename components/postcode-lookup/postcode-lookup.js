'use strict';

const axios = require('axios');

const getAddresses = async (enteredPostcode, apiURL, apiKey) => {
  try {
    let addressesResult;
    if (process.env.NODE_ENV === 'test') {
      if (enteredPostcode === '') {
        addressesResult = {};
      } else {
        addressesResult = {
          data: {
            results: [
              {
                DPA: {
                  ADDRESS: 'abc',
                  NUMBER: '1',
                  STREET_NAME: 'Test Lane',
                  TOWN: 'LONDON',
                  POSTCODE: 'ABC 123'
                }
              }
            ]
          }
        };
      }
      return addressesResult;
    }
    addressesResult = await axios.get(apiURL + '?postcode=' +  enteredPostcode + '&key=' + apiKey);
    return addressesResult;
  } catch (err) {
    throw err;
  }
};

module.exports = getAddresses;
