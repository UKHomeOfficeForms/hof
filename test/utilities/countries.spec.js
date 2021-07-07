'use strict';

const countries = require('../../utilities').countries;

const hocountries = require('homeoffice-countries').allCountries;

const expect  = require('chai').expect;

describe('Countries', () => {
  it('exports a function', () => {
    expect(countries).to.be.a('function');
  });

  it('returns an array', () => {
    expect(countries()).to.be.an('array');
  });

  it('returns a list of objects with label and value properties', () => {
    countries().forEach(entry => {
      expect(entry).to.have.keys('label', 'value');
      expect(entry.label).to.be.a('string');
      expect(entry.value).to.be.a('string');
    });
  });

  it('contains the values from homeoffice-countries', () => {
    expect(countries().length).to.equal(hocountries.length);
    countries().forEach(country => {
      expect(hocountries).to.contain(country.value);
      expect(hocountries).to.contain(country.label);
    });
  });

  it('transforms the country labels if passed a `parse` function', () => {
    expect(countries()[0].label).to.equal('Afghanistan');
    expect(countries({ parse: c => `country.${c}` })[0].label).to.equal('country.Afghanistan');
  });

  it('filters the countries if passed a `filter` function', () => {
    expect(countries({ filter: c => c !== 'Afghanistan' })[0].label).to.equal('Aland Islands');
  });
});
