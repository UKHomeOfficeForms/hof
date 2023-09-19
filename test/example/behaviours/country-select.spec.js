'use strict';

const Behaviour = require('../../../sandbox/apps/sandbox/behaviours/country-select');
const homeOfficeCountries = [''].concat(require('homeoffice-countries').allCountries);
const Controller = require('../../../controller');
const _ = require('lodash');

describe('apps/sandbox/behaviours/country-select', () => {
  let controller;
  let req;
  let res;

  beforeEach(() => {
    req = hof_request();

    req.form.options = {fields: {
      countrySelect: {
        options: {

        }
      }
    }};
    const CountrySelectController = Behaviour(Controller);
    controller = new CountrySelectController({});
  });
  describe('countryselect', () => {
    it('checks to see if each country has its country label', () => {
      controller.configure(req, res, () => {
        const countryOptions = req.form.options.fields.countrySelect.options;
        const countryLabels = _.map(countryOptions, obj => obj.label);
        const countryLabelsList = _.drop(countryLabels);
        const homeOfficeCountriesList = _.drop(homeOfficeCountries);
        countryLabelsList.should.deep.equal((homeOfficeCountriesList));
      });
    });
    it('checks to see an empty selection has a label "Please select a country"', () => {
      controller.configure(req, res, () => {
        const countryOptions = req.form.options.fields.countrySelect.options;
        const countryLabels = _.map(countryOptions, obj => obj.label);
        const emptyCountryIndex = _.indexOf(countryLabels, 'Please select a country');
        const emptyHomeOfficeCountryIndex = _.indexOf(homeOfficeCountries, '');
        emptyCountryIndex.should.deep.equal((emptyHomeOfficeCountryIndex));
      });
    });
  });
});
