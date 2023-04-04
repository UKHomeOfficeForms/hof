
const _ = require('lodash');
const componentDefaults = require('../../config/component-defaults');

module.exports = superclass => class extends superclass {
  configure(req, res, next) {
    const homeOfficeCountries = [''].concat(require('homeoffice-countries').allCountries);

    const nationalityFields = componentDefaults.homeOfficeCountries;

    nationalityFields.forEach(field => {
      if (_.get(req, `form.options.fields[${field}].options`)) {
        req.form.options.fields[field].options = homeOfficeCountries.map(country => {
          const labelString = country !== '' ? country : 'Please select a country';
          return { label: labelString, value: country };
        });
      }
    });

    next();
  }
};
