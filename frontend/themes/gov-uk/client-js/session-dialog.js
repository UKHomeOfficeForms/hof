$ = require('jquery');
window.dialogPolyfill = require('dialog-polyfill');

// Modal dialog prototype
window.GOVUK.sessionDialog = {
  el: document.getElementById('js-modal-dialog'),
  $el: $('#js-modal-dialog'),
  $lastFocusedEl: null,
  $closeButton: $('.modal-dialog .js-dialog-close'),
  dialogIsOpenClass: 'dialog-is-open',
  timers: [],
  warningTextPrefix: 'To protect your information, this page will time out in ',
  warningTextSuffix: '.',
  warningTextExtra: '',

  // Timer specific markup. If these are not present, timeout and redirection are disabled
  $timer: $('#js-modal-dialog .timer'),
  $accessibleTimer: $('#js-modal-dialog .at-timer'),

  secondsSessionTimeout: parseInt($('#js-modal-dialog').data('session-timeout') || 1800),
  secondsTimeoutWarning: parseInt($('#js-modal-dialog').data('session-timeout-warning') || 300),
  secondsFinalWarning: parseInt($('#js-modal-dialog').data('session-timeout-final-warning')),
  timeoutRedirectUrl: $('#js-modal-dialog').data('url-redirect'),
  timeSessionRefreshed: new Date(),

  bindUIElements: function () {
    window.GOVUK.sessionDialog.$closeButton.on('click', function (e) {
      e.preventDefault();
      window.GOVUK.sessionDialog.closeDialog();
    })

    // Close modal when ESC pressed
    $(document).keydown(function (e) {
      if (window.GOVUK.sessionDialog.isDialogOpen() && e.keyCode === 27) {
        window.GOVUK.sessionDialog.closeDialog();
      }
    })
  },

  isDialogOpen: function () {
    return window.GOVUK.sessionDialog.el['open'];
  },

  isConfigured: function () {
    console.log('configured');
    return window.GOVUK.sessionDialog.$timer.length > 0 &&
      window.GOVUK.sessionDialog.$accessibleTimer.length > 0 &&
      window.GOVUK.sessionDialog.secondsSessionTimeout &&
      window.GOVUK.sessionDialog.secondsTimeoutWarning &&
      window.GOVUK.sessionDialog.timeoutRedirectUrl;
  },

  openDialog: function () {
    console.log('open dialog');
    if (!window.GOVUK.sessionDialog.isDialogOpen()) {
      $('html, body').addClass(window.GOVUK.sessionDialog.dialogIsOpenClass);
      window.GOVUK.sessionDialog.saveLastFocusedEl();
      window.GOVUK.sessionDialog.makePageContentInert();
      window.GOVUK.sessionDialog.el.showModal();
    }
  },

  closeDialog: function () {
    console.log('close dialog');
    if (window.GOVUK.sessionDialog.isDialogOpen()) {
      $('html, body').removeClass(window.GOVUK.sessionDialog.dialogIsOpenClass);
      window.GOVUK.sessionDialog.el.close();
      window.GOVUK.sessionDialog.setFocusOnLastFocusedEl();
      window.GOVUK.sessionDialog.removeInertFromPageContent();
      window.GOVUK.sessionDialog.refreshSession();
    }
  },

  saveLastFocusedEl: function () {
    console.log('save last focused');
    window.GOVUK.sessionDialog.$lastFocusedEl = document.activeElement;
    if (!window.GOVUK.sessionDialog.$lastFocusedEl || window.GOVUK.sessionDialog.$lastFocusedEl === document.body) {
      window.GOVUK.sessionDialog.$lastFocusedEl = null;
    } else if (document.querySelector) {
      window.GOVUK.sessionDialog.$lastFocusedEl = document.querySelector(':focus');
    }
  },

  // Set focus back on last focused el when modal closed
  setFocusOnLastFocusedEl: function () {
    console.log(' set last focused');
    if (window.GOVUK.sessionDialog.$lastFocusedEl) {
      window.setTimeout(function () {
        window.GOVUK.sessionDialog.$lastFocusedEl.focus();
      }, 0)
    }
  },

  // Set page content to inert to indicate to screenreaders it's inactive
  // NB: This will look for #content for toggling inert state
  makePageContentInert: function () {
    console.log('make inert');
    if (document.querySelector('#content')) {
      document.querySelector('#content').inert = true;
      document.querySelector('#content').setAttribute('aria-hidden', 'true');
    }
  },

  // Make page content active when modal is not open
  // NB: This will look for #content for toggling inert state
  removeInertFromPageContent: function () {
    console.log('removing inert');
    if (document.querySelector('#content')) {
      console.log('found content');
      document.querySelector('#content').inert = false;
      document.querySelector('#content').setAttribute('aria-hidden', 'false');
      console.log('hidden content aria');
    }
  },

  numberToWords: function (n) {
    let string = n.toString()
    let units
    let tens
    let scales
    let start
    let end
    let chunks
    let chunksLen
    let chunk
    let ints
    let i
    let word
    let words = 'and'

    if (parseInt(string) === 0) {
      return 'zero';
    }

    /* Array of units as words */
    units = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];

    /* Array of tens as words */
    tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

    /* Array of scales as words */
    scales = ['', 'thousand', 'million', 'billion', 'trillion', 'quadrillion', 'quintillion', 'sextillion', 'septillion', 'octillion', 'nonillion', 'decillion', 'undecillion', 'duodecillion', 'tredecillion', 'quatttuor-decillion', 'quindecillion', 'sexdecillion', 'septen-decillion', 'octodecillion', 'novemdecillion', 'vigintillion', 'centillion'];

    /* Split user arguemnt into 3 digit chunks from right to left */
    start = string.length;
    chunks = [];
    while (start > 0) {
      end = start;
      chunks.push(string.slice((start = Math.max(0, start - 3)), end));
    }

    /* Check if function has enough scale words to be able to stringify the user argument */
    chunksLen = chunks.length
    if (chunksLen > scales.length) {
      return '';
    }

    /* Stringify each integer in each chunk */
    words = []
    for (i = 0; i < chunksLen; i++) {
      chunk = parseInt(chunks[i]);

      if (chunk) {
        /* Split chunk into array of individual integers */
        ints = chunks[i].split('').reverse().map(parseFloat);

        /* If tens integer is 1, i.e. 10, then add 10 to units integer */
        if (ints[1] === 1) {
          ints[0] += 10;
        }

        /* Add scale word if chunk is not zero and array item exists */
        if ((word = scales[i])) {
          words.push(word);
        }

        /* Add unit word if array item exists */
        if ((word = units[ints[0]])) {
          words.push(word);
        }

        /* Add tens word if array item exists */
        if ((word = tens[ints[1]])) {
          words.push(word);
        }

        /* Add hundreds word if array item exists */
        if ((word = units[ints[2]])) {
          words.push(word + ' hundred');
        }
      }
    }
    return words.reverse().join(' ');
  },

  // Attempt to convert numerics into text as OS VoiceOver
  // occasionally stalled when encountering umbers
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
    return n == 1 ? unit : unit + 's';
  },

  numericSpan: function (n, unit) {
    return '<span class="tabular-numbers">' + n + '</span> ' + window.GOVUK.sessionDialog.pluralise(n, unit);
  },

  countdownText: function (minutes, seconds) {
    const minutesText = window.GOVUK.sessionDialog.numericSpan(minutes, 'minute');
    const secondsText = window.GOVUK.sessionDialog.numericSpan(seconds, 'second');
    return minutes > 0 ? minutesText + (minutes == 1 && seconds == 0 ? '' : ' ' + secondsText) : secondsText;
  },

  countdownAtText: function (minutes, seconds) {
    const minutesText = window.GOVUK.sessionDialog.timeToWords(minutes, 'minute');
    const secondsText = window.GOVUK.sessionDialog.timeToWords(seconds, 'second');
    return minutes > 0 ? minutesText + (seconds > 0 ? ' and ' + secondsText : '') : secondsText;
  },

  startCountdown: function () {
    console.log('starting countdown');
    const $timer = window.GOVUK.sessionDialog.$timer;
    const $accessibleTimer = window.GOVUK.sessionDialog.$accessibleTimer;
    let timerRunOnce = false;
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    const seconds = window.GOVUK.sessionDialog.secondsUntilSessionTimeout();
    const minutes = seconds / 60;

    $timer.text(minutes + ' minute' + (minutes > 1 ? 's' : ''));

    (function countdown() {
      const secondsUntilSessionTimeout = window.GOVUK.sessionDialog.secondsUntilSessionTimeout();
      const timerExpired = secondsUntilSessionTimeout <= window.GOVUK.sessionDialog.secondsFinalWarning;

      if (!timerExpired) {

        const minutesLeft = parseInt(secondsUntilSessionTimeout / 60, 10);
        const secondsLeft = parseInt(secondsUntilSessionTimeout % 60, 10);

        const atMinutesText = window.GOVUK.sessionDialog.timeToWords(minutesLeft, 'minute');
        const atSecondsText = window.GOVUK.sessionDialog.timeToWords(secondsLeft, 'second');

        // Below string will get read out by screen readers every time
        // the timeout refreshes (every 20 secs. See below).
        // Please add additional information in the modal body content
        // or in below extraText which will get announced to AT the
        // first time the time out opens
        const countdownText = window.GOVUK.sessionDialog.countdownText(minutesLeft, secondsLeft);
        const text = window.GOVUK.sessionDialog.warningTextPrefix + '<strong>' + countdownText + '</strong>' + window.GOVUK.sessionDialog.warningTextSuffix;
        const countdownAtText = window.GOVUK.sessionDialog.countdownAtText(minutesLeft, secondsLeft);
        const atText = window.GOVUK.sessionDialog.warningTextPrefix + countdownAtText + window.GOVUK.sessionDialog.warningTextSuffix;
        const extraText = '<br> ' + window.GOVUK.sessionDialog.warningTextExtra;

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

        window.GOVUK.sessionDialog.addTimer(countdown, 1);
      }
    })()
  },

  finalWarning: function () {
    console.log('final warning');
    const $timer = window.GOVUK.sessionDialog.$timer;
    const $accessibleTimer = window.GOVUK.sessionDialog.$accessibleTimer;
    $accessibleTimer.attr('aria-live', 'assertive');
    $timer.text('You are about to be redirected');
    $accessibleTimer.text('You are about to be redirected');
  },

  // Clears all timers
  clearTimers: function () {
    console.log('clear timer');
    for (let i = 0; i < window.GOVUK.sessionDialog.timers.length; i++) {
      clearTimeout(window.GOVUK.sessionDialog.timers[i]);
    }
  },

  refreshSession: function () {
    console.log('refresh session');
    $.get("");
    window.GOVUK.sessionDialog.timeSessionRefreshed = new Date();
    window.GOVUK.sessionDialog.controller();
  },

  redirect: function () {
    console.log('redirect');
    window.location = window.GOVUK.sessionDialog.timeoutRedirectUrl;
  },

  // JS doesn't allow resetting timers globally so timers need
  // to be retained for resetting.
  addTimer: function (f, seconds) {
    console.log('add timer');
    window.GOVUK.sessionDialog.timers.push(setTimeout(f, seconds * 1000));
  },

  secondsSinceRefresh: function () {
    console.log('seconds since');
    return Math.round(Math.abs((window.GOVUK.sessionDialog.timeSessionRefreshed - new Date()) / 1000));
  },

  secondsUntilSessionTimeout: function () {
    console.log('seconds until session timeout');
    return window.GOVUK.sessionDialog.secondsSessionTimeout - window.GOVUK.sessionDialog.secondsSinceRefresh();
  },

  secondsUntilTimeoutWarning: function () {
    console.log('seconds until timeout warning');
    return window.GOVUK.sessionDialog.secondsUntilSessionTimeout() - window.GOVUK.sessionDialog.secondsTimeoutWarning;
  },

  secondsUntilFinalWarning: function () {
    console.log('seconds until final warning');
    return window.GOVUK.sessionDialog.secondsUntilSessionTimeout() - window.GOVUK.sessionDialog.secondsFinalWarning;
  },

  // countdown controller logic
  controller: function () {
    console.log('controller');
    window.GOVUK.sessionDialog.clearTimers();

    const secondsUntilSessionTimeout = window.GOVUK.sessionDialog.secondsUntilSessionTimeout();

    //timed out - redirect
    if (secondsUntilSessionTimeout <= 0) {
      console.log('redirecting');
      window.GOVUK.sessionDialog.redirect();
    }

    //final warning - show timeout imminent warning and schedule redirect
    else if (secondsUntilSessionTimeout <= window.GOVUK.sessionDialog.secondsFinalWarning) {
      console.log('pop up changed to final');
      window.GOVUK.sessionDialog.openDialog();
      window.GOVUK.sessionDialog.finalWarning();
      window.GOVUK.sessionDialog.addTimer(window.GOVUK.sessionDialog.controller, window.GOVUK.sessionDialog.secondsUntilSessionTimeout());
      console.log('redirect should be happening');
    }

    //timeout warning - show countdown and schedule redirect
    else if (secondsUntilSessionTimeout <= window.GOVUK.sessionDialog.secondsTimeoutWarning) {
      console.log('pop up should be showing');
      window.GOVUK.sessionDialog.openDialog();
      window.GOVUK.sessionDialog.startCountdown();
      window.GOVUK.sessionDialog.addTimer(window.GOVUK.sessionDialog.controller,window.GOVUK.sessionDialog.secondsUntilSessionTimeout());
      console.log('redirect should be happening');
    }

    //wait for warning 
    else {
      console.log('waiting for warning');
      window.GOVUK.sessionDialog.addTimer(window.GOVUK.sessionDialog.controller, window.GOVUK.sessionDialog.secondsUntilTimeoutWarning());
    }
  },

  init: function (options) {
    console.log('init started');
    $.extend(window.GOVUK.sessionDialog, options);
    console.log('extended?');
    if (window.GOVUK.sessionDialog.el && window.GOVUK.sessionDialog.isConfigured()) {
      console.log('things have been configured');
      // Native dialog is not supported by browser so use polyfill
      if (typeof HTMLDialogElement !== 'function') {
        window.dialogPolyfill.registerDialog(window.GOVUK.sessionDialog.el);
        console.log('dialog registered');
      }
      window.GOVUK.sessionDialog.bindUIElements();
      window.GOVUK.sessionDialog.controller();
    }
  }
}

window.GOVUK = GOVUK;
