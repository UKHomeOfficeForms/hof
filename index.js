'use strict';

require('deprecate')('hof@10 is no longer actively supported. For details of migrating to the latest hof see https://github.com/UKHomeOfficeForms/hof-bootstrap and https://ukhomeofficeforms.github.io/hof-guide/');

var hof = {
  wizard: require('hmpo-form-wizard'),
  toolkit: require('hmpo-frontend-toolkit'),
  template: require('hmpo-govuk-template'),
  Model: require('hmpo-model'),
  mixins: require('hmpo-template-mixins'),
  controllers: require('hof-controllers'),
  i18n: require('i18n-future'),
  middleware: require('hof-middleware')
};

module.exports = hof;
