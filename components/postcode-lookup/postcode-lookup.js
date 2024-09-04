'use strict'

const axios = require('axios');

const getAddresses = async (enteredPostcode, apiURL, apiKey) => {
  try {
    const addressesResult = await axios.get(apiURL + '?postcode=' +  enteredPostcode + '&key=' + apiKey);
    return addressesResult;
  }
  catch (err) {
    throw err;
  }
}

module.exports = getAddresses;
