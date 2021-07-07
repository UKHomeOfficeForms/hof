'use strict';

const AddressLookup = require('../../components').addressLookup;

const assert = require('assert');

describe('Unit tests', () => {
  it('throws if no addressKey is provided', () => {
    assert.throws(
      () => {
        AddressLookup({});
      }
    );
  });
});
