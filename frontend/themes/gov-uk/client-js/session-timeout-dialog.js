/* eslint max-len: 0 */
'use strict';

const $ = require('jquery');
window.dialogPolyfill = require('dialog-polyfill');

// Modal dialog prototype
window.GOVUK.sessionDialog = {
  el: document.getElementById('js-modal-dialog'),
  $el: $('#js-modal-dialog'),
  $lastFocusedEl: null,
  $closeButton: $('.modal-dialog .js-dialog-close'),
  $fallBackElement: $('.govuk-timeout-warning-fallback'),
  dialogIsOpenClass: 'dialog-is-open',
  timers: [],
  warningTextPrefix: 'To protect your information, this page will time out in ',
  warningTextSuffix: '.',
  warningText: $('.dialog-text').text(),
  warningTextExtra: '',

  // Timer specific markup. If these are not present, timeout and redirection are disabled
  $timer: $('#js-modal-dialog .timer'),
  $accessibleTimer: $('#js-modal-dialog .at-timer'),

  secondsSessionTimeout: parseInt($('#js-modal-dialog').data('session-timeout'), 10 || 1800),
  secondsTimeoutWarning: parseInt($('#js-modal-dialog').data('session-timeout-warning'), 10 || 300),
  timeoutRedirectUrl: $('#js-modal-dialog').data('url-redirect'),
  timeSessionRefreshed: new Date(),

  bindUIElements: function () {
    window.GOVUK.sessionDialog.$closeButton.on('click', function (e) {
      e.preventDefault();
      window.GOVUK.sessionDialog.closeDialog();
    });

    // Close modal when ESC pressed
    $(document).keydown(function (e) {
      if (window.GOVUK.sessionDialog.isDialogOpen() && e.keyCode === 27) {
        window.GOVUK.sessionDialog.closeDialog();
      }
    });
  },

  isDialogOpen: function () {
    return window.GOVUK.sessionDialog.el && window.GOVUK.sessionDialog.el.open;
  },

  isConfigured: function () {
    return window.GOVUK.sessionDialog.$timer.length > 0 &&
      window.GOVUK.sessionDialog.$accessibleTimer.length > 0 &&
      window.GOVUK.sessionDialog.secondsSessionTimeout &&
      window.GOVUK.sessionDialog.secondsTimeoutWarning &&
      window.GOVUK.sessionDialog.timeoutRedirectUrl;
  },

  openDialog: function () {
    if (!window.GOVUK.sessionDialog.isDialogOpen()) {
      $('html, body').addClass(window.GOVUK.sessionDialog.dialogIsOpenClass);
      window.GOVUK.sessionDialog.saveLastFocusedEl();
      window.GOVUK.sessionDialog.makePageContentInert();
      window.GOVUK.sessionDialog.el.showModal();
      window.GOVUK.sessionDialog.el.open = true;
    }
  },

  closeDialog: function () {
    if (window.GOVUK.sessionDialog.isDialogOpen()) {
      $('html, body').removeClass(window.GOVUK.sessionDialog.dialogIsOpenClass);
      window.GOVUK.sessionDialog.el.close();
      window.GOVUK.sessionDialog.el.open = false;
      window.GOVUK.sessionDialog.setFocusOnLastFocusedEl();
      window.GOVUK.sessionDialog.removeInertFromPageContent();
      window.GOVUK.sessionDialog.refreshSession();
    }
  },

  saveLastFocusedEl: function () {
    window.GOVUK.sessionDialog.$lastFocusedEl = document.activeElement;
    if (!window.GOVUK.sessionDialog.$lastFocusedEl || window.GOVUK.sessionDialog.$lastFocusedEl === document.body) {
      window.GOVUK.sessionDialog.$lastFocusedEl = null;
    } else if (document.querySelector) {
      window.GOVUK.sessionDialog.$lastFocusedEl = document.querySelector(':focus');
    }
  },

  // Set focus back on last focused el when modal closed
  setFocusOnLastFocusedEl: function () {
    if (window.GOVUK.sessionDialog.$lastFocusedEl) {
      window.setTimeout(function () {
        window.GOVUK.sessionDialog.$lastFocusedEl.focus();
      }, 0);
    }
  },

  // Set page content to inert to indicate to screenreaders it's inactive
  // NB: This will look for #content for toggling inert state
  makePageContentInert: function () {
    if (document.querySelector('#content')) {
      document.querySelector('#content').inert = true;
      document.querySelector('#content').setAttribute('aria-hidden', 'true');
    }
  },

  // Make page content active when modal is not open
  // NB: This will look for #content for toggling inert state
  removeInertFromPageContent: function () {
    if (document.querySelector('#content')) {
      document.querySelector('#content').inert = false;
      document.querySelector('#content').setAttribute('aria-hidden', 'false');
    }
  },

  numberToWords: function (n) {
    const string = n.toString();
    let start;
    let end;
    let chunk;
    let ints;
    let i;
    let words = 'and';

    if (parseInt(string, 10) === 0) {
      return 'zero';
    }

    /* Array of units as words */
    const units = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];

    /* Array of tens as words */
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

    /* Array of scales as words */
    const scales = ['', 'thousand', 'million', 'billion', 'trillion', 'quadrillion', 'quintillion', 'sextillion', 'septillion', 'octillion', 'nonillion', 'decillion', 'undecillion', 'duodecillion', 'tredecillion', 'quatttuor-decillion', 'quindecillion', 'sexdecillion', 'septen-decillion', 'octodecillion', 'novemdecillion', 'vigintillion', 'centillion'];

    /* Split user argument into 3 digit chunks from right to left */
    start = string.length;
    const chunks = [];
    while (start > 0) {
      end = start;
      chunks.push(string.slice((start = Math.max(0, start - 3)), end));
    }

    /* Check if function has enough scale words to be able to stringify the user argument */
    const chunksLen = chunks.length;
    if (chunksLen > scales.length) {
      return '';
    }

    /* Stringify each integer in each chunk */
    words = [];
    for (i = 0; i < chunksLen; i++) {
      chunk = parseInt(chunks[i], 10);

      if (chunk) {
        /* Split chunk into array of individual integers */
        ints = chunks[i].split('').reverse().map(parseFloat);

        /* If tens integer is 1, i.e. 10, then add 10 to units integer */
        if (ints[1] === 1) {
          ints[0] += 10;
        }

        /* Add scale word if chunk array item exists */
        if (scales[i]) {
          words.push(scales[i]);
        }

        /* Add unit word if array item exists */
        if (units[ints[0]]) {
          words.push(units[ints[0]]);
        }

        /* Add tens word if array item exists */
        if (tens[ints[1]]) {
          words.push(tens[ints[1]]);
        }

        /* Add hundreds word if array item exists */
        if (units[ints[2]]) {
          words.push(units[ints[2]] + ' hundred');
        }
      }
    }
    return words.reverse().join(' ');
  },

  // Attempt to convert numerics into text as OS VoiceOver
  // occasionally stalled when encountering numbers
  timeToWords: function (t, unit) {
    let words;
    if (t > 0) {
      try {
        words = window.GOVUK.sessionDialog.numberToWords(t);
      } catch (e) {
        words = t;
      }
      words = words + ' ' + window.GOVUK.sessionDialog.pluralise(t, unit);
    } else {
      words = '';
    }
    return words;
  },

  pluralise: function (n, unit) {
    return n === 1 ? unit : unit + 's';
  },

  numericSpan: function (n, unit) {
    return '<span class="tabular-numbers">' + n + '</span> ' + window.GOVUK.sessionDialog.pluralise(n, unit);
  },

  countdownText: function (minutes, seconds) {
    const minutesText = window.GOVUK.sessionDialog.numericSpan(minutes, 'minute');
    const secondsText = window.GOVUK.sessionDialog.numericSpan(seconds, 'second');
    return minutes > 0 ? minutesText : secondsText;
  },

  countdownAtText: function (minutes, seconds) {
    const minutesText = window.GOVUK.sessionDialog.timeToWords(minutes, 'minute');
    const secondsText = window.GOVUK.sessionDialog.timeToWords(seconds, 'second');
    return minutes > 0 ? minutesText : secondsText;
  },

  startCountdown: function () {
    const $timer = window.GOVUK.sessionDialog.$timer;
    const $accessibleTimer = window.GOVUK.sessionDialog.$accessibleTimer;
    let timerRunOnce = false;
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    const seconds = window.GOVUK.sessionDialog.secondsUntilSessionTimeout();
    const minutes = seconds / 60;

    $timer.text(minutes + ' minute' + (minutes > 1 ? 's' : ''));

    (function countdown() {
      const secondsUntilSessionTimeout = window.GOVUK.sessionDialog.secondsUntilSessionTimeout();
      const timerExpired = secondsUntilSessionTimeout <= 0;

      if (!timerExpired) {
        const minutesLeft = parseInt(secondsUntilSessionTimeout / 60, 10);
        const secondsLeft = parseInt(secondsUntilSessionTimeout % 60, 10);

        // Below string will get read out by screen readers every time
        // the timeout refreshes.
        // Add additional information in extraText which will get announced to AT the
        // first time the time out opens
        const countdownText = window.GOVUK.sessionDialog.countdownText(minutesLeft, secondsLeft);
        const text = window.GOVUK.sessionDialog.warningTextPrefix + '<strong>' + countdownText + '</strong>' + window.GOVUK.sessionDialog.warningTextSuffix + '<p>' + window.GOVUK.sessionDialog.warningText + '</p>';
        const countdownAtText = window.GOVUK.sessionDialog.countdownAtText(minutesLeft, secondsLeft);
        const atText = window.GOVUK.sessionDialog.warningTextPrefix + countdownAtText + window.GOVUK.sessionDialog.warningTextSuffix + ' ' + window.GOVUK.sessionDialog.warningText;
        const extraText = '\n' + window.GOVUK.sessionDialog.warningTextExtra;

        $timer.html(text + ' ' + extraText);

        // Update screen reader friendly content every 20 secs
        if (secondsLeft % 20 === 0) {
          // Read out the extra content only once.
          // Don't read out on iOS VoiceOver which stalls on the longer text
          if (!timerRunOnce && !iOS) {
            $accessibleTimer.text(atText + extraText);
            timerRunOnce = true;
          } else {
            $accessibleTimer.text(atText);
          }
        }

        window.GOVUK.sessionDialog.addTimer(countdown, 20);
      }
    })();
  },

  // Clears all timers
  clearTimers: function () {
    for (let i = 0; i < window.GOVUK.sessionDialog.timers.length; i++) {
      clearInterval(window.GOVUK.sessionDialog.timers[i]);
    }
  },

  refreshSession: function () {
    $.get('');
    window.GOVUK.sessionDialog.timeSessionRefreshed = new Date();
    window.GOVUK.sessionDialog.controller();
  },

  redirect: function () {
    window.location = window.GOVUK.sessionDialog.timeoutRedirectUrl;
  },

  // JS doesn't allow resetting timers globally so timers need
  // to be retained for resetting.
  addTimer: function (f, seconds) {
    window.GOVUK.sessionDialog.timers.push(setInterval(f, seconds * 1000));
  },

  secondsSinceRefresh: function () {
    return Math.round(Math.abs((window.GOVUK.sessionDialog.timeSessionRefreshed - new Date()) / 1000));
  },

  secondsUntilSessionTimeout: function () {
    return window.GOVUK.sessionDialog.secondsSessionTimeout - window.GOVUK.sessionDialog.secondsSinceRefresh();
  },

  secondsUntilTimeoutWarning: function () {
    return window.GOVUK.sessionDialog.secondsUntilSessionTimeout() - window.GOVUK.sessionDialog.secondsTimeoutWarning;
  },

  // countdown controller logic
  controller: function () {
    window.GOVUK.sessionDialog.clearTimers();

    const secondsUntilSessionTimeout = window.GOVUK.sessionDialog.secondsUntilSessionTimeout();

    if (secondsUntilSessionTimeout <= 0) {
      // timed out - redirect
      window.GOVUK.sessionDialog.redirect();
    } else if (secondsUntilSessionTimeout <= window.GOVUK.sessionDialog.secondsTimeoutWarning) {
      // timeout warning - show countdown and schedule redirect
      window.GOVUK.sessionDialog.openDialog();
      window.GOVUK.sessionDialog.startCountdown();
      window.GOVUK.sessionDialog.addTimer(window.GOVUK.sessionDialog.controller, window.GOVUK.sessionDialog.secondsUntilSessionTimeout());
    } else {
      // wait for warning
      window.GOVUK.sessionDialog.addTimer(window.GOVUK.sessionDialog.controller, window.GOVUK.sessionDialog.secondsUntilTimeoutWarning());
    }
  },

  init: function (options) {
    $.extend(window.GOVUK.sessionDialog, options);
    if (window.GOVUK.sessionDialog.el && window.GOVUK.sessionDialog.isConfigured()) {
      // Native dialog is not supported by some browsers so use polyfill
      if (typeof HTMLDialogElement !== 'function') {
        try {
          window.dialogPolyfill.registerDialog(window.GOVUK.sessionDialog.el);
          return true;
        } catch (error) {
          // Doesn't support polyfill (IE8) - display fallback element
          window.GOVUK.sessionDialog.$fallBackElement.classList.add('govuk-!-display-block');
          return false;
        }
      }
      window.GOVUK.sessionDialog.bindUIElements();
      window.GOVUK.sessionDialog.controller();
      return true;
    }
    return false;
  }
};
window.GOVUK.sessionDialog.init();
