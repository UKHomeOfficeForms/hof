'use strict';

const Behaviour = require('../../../example/apps/example-app/behaviours/country-select');
const homeOfficeCountries = [''].concat(require('homeoffice-countries').allCountries);
const Controller = require('../../../controller');
const _ = require('lodash');

describe('apps/example-app/behaviours/country-select', () => {
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
    it('checks to see if each country has a country label', () => {
      controller.configure(req, res, () => {
        const countryOptions = req.form.options.fields.countrySelect.options;
        const countryLabels = [''].concat(_.map(countryOptions, obj => obj.label));
        homeOfficeCountries.splice(1, 0, 'Please select a country');
        countryLabels.should.deep.equal((homeOfficeCountries));
      });
    });
  });
});
