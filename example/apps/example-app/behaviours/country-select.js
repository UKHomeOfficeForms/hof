module.exports = superclass => class extends superclass {
  configure(req, res, next) {
    const homeOfficeCountries = [''].concat(require('homeoffice-countries').allCountries);
    req.form.options.fields['countrySelect'].options = homeOfficeCountries.map(country => {
      const labelString = country !== '' ? country : 'Please select a country';
      return { label: labelString, value: country };
    });
    next();
  }
};