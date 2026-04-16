/* eslint-disable */
'use strict'

require('../../../frontend/themes/gov-uk/client-js');

const accessibleAutocomplete = require('accessible-autocomplete');

function initTypeahead(element) {
  const container = element.parentNode;

  accessibleAutocomplete.enhanceSelectElement({
    defaultValue: '',
    selectElement: element
  });

  const input = container.querySelector('.autocomplete__input');

  function clear() {
    element.value = '';
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // If user clears the field completely
  input.addEventListener('input', () => {
    if (!input.value) clear();
  });
}

document.querySelectorAll('.typeahead').forEach(initTypeahead);
