/* eslint-disable max-len, no-var, no-shadow, vars-on-top */
var each = require('lodash').forEach;

var helpers = require('./helpers');

var NAME = 'VALIDATION';

var summary;

function clicked(e) {
  var elem = helpers.target(e);

  var groupId = elem.getAttribute('href').replace(/^#/, '');
  var group = document.getElementById(groupId + '-group') || document.getElementById(groupId);
  var inputs;

  if (group) {
    if (group.getElementsByTagName('input').length) {
      inputs = group.getElementsByTagName('input');
    } else if (group.getElementsByTagName('textarea').length) {
      inputs = group.getElementsByTagName('textarea');
    } else if (group.getElementsByTagName('select').length) {
      inputs = group.getElementsByTagName('select');
    }

    if (inputs) {
      if (inputs[0].getAttribute('type') === 'hidden') {
        var getVisibleElements = group.querySelectorAll('input[type=text]');
        getVisibleElements[0].focus();
      } else {
        inputs[0].focus();
      }
    }
  }
}

function pressed(e) {
  // Allow the spacebar to trigger the same behaviour
  if(e.keyCode === 32) {
    clicked(e);
  }
}

function setup(summary) {
  summary.focus();

  var errors = summary.getElementsByTagName('a');

  each(errors, function (error) {
    helpers.addEvent(error, 'click', clicked);
    helpers.addEvent(error, 'keydown', pressed);
  });
}

function validation() {
  var summaries = [];

  if (document.getElementById('content')) {
    summaries = helpers.getElementsByClass(document.getElementById('content'), 'div', 'validation-summary');
  }

  if (summaries.length) {
    summary = summaries[0];

    helpers.once(summary, NAME, function (summary) {
      setup(summary);
    });
  }
}

module.exports = validation;
