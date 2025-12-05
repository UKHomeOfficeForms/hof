module.exports = {
  helpers: require('./assets/rebrand/javascript/helpers'),
  formFocus: require('./assets/rebrand/javascript/form-focus'),
  progressiveReveal: require('./assets/rebrand/javascript/progressive-reveal'),
  validation: require('./assets/rebrand/javascript/validation'),
  detailsSummary: function () {
    require('./assets/rebrand/javascript/vendor/details.polyfill');
  },
  characterCount: require('./assets/rebrand/javascript/character-count')
};
