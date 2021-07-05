/**
 * This module adds the yellow focus border to:
 *   * labels with class block-label that are the parent element of radio buttons
 *   * labels with class block-label that are the parent element of check boxes
 *   * details elements
 *
 */

'use strict';

var each = require('lodash').forEach;
var groupBy = require('lodash').groupBy;

var NAME = 'form-focus';

var helpers = require('./helpers'),
    groups,
    blockLabelClass = 'block-label',
    focussedClass = 'focused',
    selectedClass = 'selected';

function focussed(e) {
    helpers.addClass(helpers.target(e).parentNode, focussedClass);
}

function blurred(e) {
    helpers.removeClass(helpers.target(e).parentNode, focussedClass);
}

function clicked(e, target) {
    target = target || helpers.target(e);
    each(groups[target.name], function (input) {
        if (input.checked) {
            helpers.addClass(input.parentNode, selectedClass);
        } else {
            helpers.removeClass(input.parentNode, selectedClass);
        }
    });
}

function bindInputEvents(label) {
    if (helpers.hasClass(label, blockLabelClass)) {
        var input = label.getElementsByTagName('input')[0];

        if (input && input.type && input.type.match(/radio|checkbox/)) {
            helpers.addEvent(input, 'focus', focussed);
            helpers.addEvent(input, 'blur', blurred);
            helpers.addEvent(input, 'click', clicked);
            clicked(null, input);
        }
    }
}

function bindSummaryEvents(summary) {
    helpers.addEvent(summary, 'focus', focussed);
    helpers.addEvent(summary, 'blur', blurred);
}

function setupLabels(labels) {
    groups = groupBy(document.getElementsByTagName('input'), 'name');
    for (var i = 0, len = labels.length; i < len; i++) {
        helpers.once(labels[i], NAME, bindInputEvents);
    }
}

function formFocus () {
    var forms = document.getElementsByTagName('form'),
        labels,
        summaries;

    if (forms.length > 0) {
        labels = document.getElementsByTagName('label');
        if (labels) {
            setupLabels(labels);
        }
    }

    summaries = document.getElementsByTagName('summary');
    for (var i = 0, len = summaries.length; i < len; i++) {
        helpers.once(summaries[i], NAME, bindSummaryEvents);
    }
}

module.exports = formFocus;
