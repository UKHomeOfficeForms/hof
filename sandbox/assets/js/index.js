/* eslint-disable */
'use strict'

require('../../../frontend/themes/gov-uk/client-js');

const accessibleAutocomplete = require('accessible-autocomplete');

document.addEventListener('DOMContentLoaded', function onDOMContentLoaded() {
  document
    .querySelectorAll('.typeahead')
    .forEach(function applyTypeahead(element) {
      accessibleAutocomplete.enhanceSelectElement({
        defaultValue: '',
        selectElement: element
      });
    });
});
