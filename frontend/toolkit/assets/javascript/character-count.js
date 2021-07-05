'use strict';

var helpers = require('./helpers');

CharacterCount.prototype.updateCount = function() {
  var currentLength = this.$textarea.value.length;
  var characterNoun = ' characters';
  var remainderSuffix = ' remaining';

  if (this.maxLength - currentLength === 1 || currentLength - this.maxLength === 1) {
    characterNoun = ' character';
  }

  if (this.maxLength - currentLength < 0) {
    remainderSuffix = ' too many';
  }

  function addCommas(numString) {
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(numString)) {
      numString = numString.replace(rgx, '$1' + ',' + '$2');
    }
    return numString;
  }

  // format the number with commas separating thousands, so screen readers do not read them as a year
  var number = addCommas(Math.abs(this.maxLength - currentLength).toString());

  this.$maxlengthHint.innerHTML = 'You have ' + number + characterNoun + remainderSuffix;

  if (currentLength >= this.maxLength + 1) {
    helpers.removeClass(this.$maxlengthHint, 'form-hint');
    helpers.addClass(this.$maxlengthHint, 'error-message');
    helpers.addClass(this.$textarea, 'textarea-error');
  } else {
    helpers.addClass(this.$maxlengthHint, 'form-hint');
    helpers.removeClass(this.$maxlengthHint, 'error-message');
    helpers.removeClass(this.$textarea, 'textarea-error');
  }
};

CharacterCount.prototype.checkIfLengthChanged = function () {
  if (this.$textarea.length !== this.oldLength) {
    this.updateCount();
    this.oldLength = this.$textarea.value.length;
  }
};

CharacterCount.prototype.handleFocus = function () {
  this.lengthChecker = setInterval(this.checkIfLengthChanged.bind(this), 1000);
};

CharacterCount.prototype.handleBlur = function () {
  clearInterval(this.lengthChecker);
};

CharacterCount.prototype.init = function() {
  // Updates hint to js-enabled message
  this.updateCount();

  // remove maxLength restriction on element
  this.$textarea.removeAttribute('maxlength');

  // set change event on textarea
  helpers.addEvent(this.$textarea, 'input', this.updateCount.bind(this));
  // some assistive technologies do not trigger input events when entering text into fields
  // add polling functions to check if input length has changed in these circumstances
  helpers.addEvent(this.$textarea, 'focus', this.handleFocus.bind(this));
  helpers.addEvent(this.$textarea, 'blur', this.handleBlur.bind(this));
};

function CharacterCount($textarea) {
  // passes in textarea and attaches to object
  this.$textarea = $textarea;

  // attaches hint to object
  this.$maxlengthHint = document.querySelector('[id=' + this.$textarea.id + '-maxlength-hint]');

  // set maxlength to variable
  this.maxLength = parseInt(this.$textarea.getAttribute('maxlength'));

  // save old length for polling comparison
  this.oldLength = 0;
}

function characterCountAll() {
  // find all textareas
  var $allTextAreas = document.getElementsByTagName('textarea');

  // for each textarea if it has maxlength create new characterCount object
  for (var i = 0; i < $allTextAreas.length; i++) {
    if ($allTextAreas[i].hasAttribute('maxlength')) {
      new CharacterCount($allTextAreas[i]).init();
    }
  }
}

module.exports = characterCountAll;
