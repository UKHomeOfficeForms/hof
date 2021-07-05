'use strict';

var each = require('lodash').forEach;
var groupBy = require('lodash').groupBy;

var helpers = require('./helpers'),
  inputs, groups,
  toggleAttr = 'data-toggle',
  hiddenClass = 'js-hidden';

function inputClicked(e, target) {
  target = target || helpers.target(e);
  var shown;
  each(groups[target.name], function (input) {
    var id = input.getAttribute('aria-controls');
    var toggle = document.getElementById(id);
    if (toggle) {
      if (input.checked) {
        toggle.setAttribute('aria-hidden', 'false');
        helpers.removeClass(toggle, hiddenClass);
        shown = toggle.id;
        var elementToFocus = toggle.querySelectorAll('input,textarea')[0];
        if ((input === target) && elementToFocus) {
          elementToFocus.focus();
        }
      } else {
        if (shown !== toggle.id) {
          toggle.setAttribute('aria-hidden', 'true');
          helpers.addClass(toggle, hiddenClass);
        }
      }
    }
  });
}

function setupReveal(input) {
  var element = input.getAttribute(toggleAttr);
  // check if the element supplied is part of an {id}-panel
  // if so then toggle this parent element to also toggle
  // associated labels and legends
  var toggleId = document.getElementById(element + '-panel')
    ? element + '-panel'
    : element;
  var toggle = document.getElementById(toggleId);

  if (toggle) {
    input.setAttribute('aria-controls', toggleId);
    inputClicked(null, input);
  }
  helpers.addEvent(input, 'click', inputClicked);
}

function progressiveReveal() {
  var forms = document.getElementsByTagName('form'),
    input;

  if (forms.length > 0) {
    inputs = document.querySelectorAll('input,textarea');
    groups = groupBy(inputs, 'name');
    for (var i = 0, num = inputs.length; i < num; i++) {
      input = inputs[i];
      if (input.type.match(/radio|checkbox/)) {
        helpers.once(input, 'progressive-reveal', setupReveal);
      }
    }
  }
}

module.exports = progressiveReveal;
