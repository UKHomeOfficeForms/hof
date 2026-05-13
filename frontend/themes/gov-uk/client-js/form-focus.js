/**
 * This module adds the yellow focus border to:
 *   * day field of date input when selected from a summary page edit link
 *   * amount field of grouped inputs when selected from a summary page edit link
 **/

'use strict';

function formFocus() {
  const forms = document.getElementsByTagName('form');
  const getElementFromSummaryLink = window.location.hash.replace(/^#/, '');
  const getEditPath = window.location.pathname.split('/').pop();

  const editMode = getElementFromSummaryLink && getEditPath === 'edit';

  if (document.getElementById(getElementFromSummaryLink + '-day') && forms.length === 1 && editMode) {
    document.getElementById(getElementFromSummaryLink + '-day').focus();
  }

  if (document.getElementById(getElementFromSummaryLink + '-amount') && forms.length === 1 && editMode) {
    document.getElementById(getElementFromSummaryLink + '-amount').focus();
  }
}

module.exports = formFocus;
