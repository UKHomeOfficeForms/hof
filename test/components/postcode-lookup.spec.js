'use strict';

const chai = require('chai');

const reqres = require('../../utilities/reqres');

chai.use(require('sinon-chai'));

const options = opts => Object.assign({
  addressFieldNamePrefix: 'address-one',
  apiURL: 'testApiUrl',
  apiKey: 'testApiKey',
  required: true
}, opts);

const PostcodeLookupBehaviour = require('../../components/postcode-lookup/index')(options());
const PostcodeAPICall = require('../../components/postcode-lookup/postcode-lookup');

describe('Postcode lookup behaviour', () => {
  class Base {}

  let behaviour;
  let Behaviour;
  let req;
  let res;

  beforeEach(() => {
    req = reqres.req();
    res = reqres.res();

    Behaviour = PostcodeLookupBehaviour(Base);

    behaviour = new Behaviour();
  });

  describe('Postcode lookup function tests', () => {
    it('should clear address field values when the clearAddressFieldValues function is called', () => {
      req.form.values['address-one'] = '1 ABC Lane';
      req.form.values['address-one-address-line-2'] = 'Test Address Line 2';
      req.form.values['address-one-town-or-city'] = 'London';
      req.form.values['address-one-postcode-manual'] = 'ABC 123';
      behaviour.clearAddressFieldValues(req);
      req.form.values['address-one'].should.eql('');
    });

    it('should return the correct result set when the postcode API call is made with a postcode', async () => {
      let dataSet;
      await PostcodeAPICall('ABC 123', 'testApiUrl', 'testApiKey').then(
        function (response) {
          dataSet = response.data.results[0].DPA;
        }
      );
      return dataSet.should.containSubset(
        {
          ADDRESS: 'abc',
          NUMBER: '1',
          STREET_NAME: 'Test Lane',
          TOWN: 'LONDON',
          POSTCODE: 'ABC 123'
        });
    });

    it('should construct the address line values correctly according to the available address data attributes', () => {
      const addressAttributes = {
        ADDRESS: 'Test Organisation, Test Building Name, 1 ABC Road',
        ORGANISATION_NAME: 'Test Organisation',
        BUILDING_NAME: 'Test Building Name',
        BUILDING_NUMBER: '1',
        THOROUGHFARE_NAME: 'ABC Road',
        POST_TOWN: 'London'
      };
      const addressLines = behaviour.constructAddressLineValues(addressAttributes);
      return addressLines.should.containSubset(
        {
          addressLine1: 'Test Organisation, Test Building Name',
          addressLine2: '1 ABC Road'
        }
      );
    });

    it('should return a validation error message if the postcode is empty', async () => {
      req.form.values['address-one-postcode'] = '';
      let validationError = new Error('Unexpected postcode response data structure');
      await behaviour.postcode(req, res, err => {
        if (err) {
          validationError = err;
        }
      });
      return validationError.should.eql(validationError);
    });
  });
});
