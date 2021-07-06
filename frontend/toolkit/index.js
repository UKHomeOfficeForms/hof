module.exports = {
  helpers: require('./assets/javascript/helpers'),
  formFocus: require('./assets/javascript/form-focus'),
  progressiveReveal: require('./assets/javascript/progressive-reveal'),
  validation: require('./assets/javascript/validation'),
  detailsSummary: function () {
    require('./assets/javascript/vendor/details.polyfill');
  },
  characterCount: require('./assets/javascript/character-count')
};
