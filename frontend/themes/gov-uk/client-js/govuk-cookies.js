/* eslint-disable no-undef, no-param-reassign, no-unused-vars */
(function () {
  'use strict';
  const root = this;
  if(typeof root.GOVUK === 'undefined') { root.GOVUK = {}; }

  /*
    Cookie methods
    ==============

    Usage:

      Setting a cookie:
      GOVUK.cookie('hobnob', 'tasty', { days: 30 });

      Reading a cookie:
      GOVUK.cookie('hobnob');

      Deleting a cookie:
      GOVUK.cookie('hobnob', null);
  */
  GOVUK.cookie = function (name, value, options) {
    if(typeof value !== 'undefined') {
      if(value === false || value === null) {
        return GOVUK.setCookie(name, '', { days: -1 });
      }
      return GOVUK.setCookie(name, value, options);
    }
    return GOVUK.getCookie(name);
  };
  GOVUK.setCookie = function (name, value, options) {
    if(typeof options === 'undefined') {
      options = {};
    }
    let cookieString = name + '=' + value + '; path=/';
    if (options.days) {
      const date = new Date();
      date.setTime(date.getTime() + (options.days * 24 * 60 * 60 * 1000));
      cookieString = cookieString + '; expires=' + date.toGMTString();
    }
    if (document.location.protocol === 'https:') {
      cookieString = cookieString + '; Secure';
    }
    document.cookie = cookieString;
  };
  GOVUK.getCookie = function (name) {
    const nameEQ = name + '=';
    const cookies = document.cookie.split(';');
    for(let i = 0, len = cookies.length; i < len; i++) {
      let cookie = cookies[i];
      while (cookie.charAt(0) === ' ') {
        cookie = cookie.substring(1, cookie.length);
      }
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookie.substring(nameEQ.length));
      }
    }
    return null;
  };
}).call(this);
(function () {
  'use strict';
  const root = this;
  if (typeof root.GOVUK === 'undefined') { root.GOVUK = {}; }

  GOVUK.addCookieMessage = function () {
    const message = document.getElementById('global-cookie-message');

    const hasCookieMessage = (message && GOVUK.cookie('seen_cookie_message') === null);

    if (hasCookieMessage) {
      message.style.display = 'block';
      GOVUK.cookie('seen_cookie_message', 'yes', { days: 28 });

      document.addEventListener('DOMContentLoaded', function (event) {
        if (GOVUK.analytics && typeof GOVUK.analytics.trackEvent === 'function') {
          GOVUK.analytics.trackEvent('cookieBanner', 'Cookie banner shown', {
            value: 1,
            nonInteraction: true
          });
        }
      });
    }
  };
}).call(this)
;
(function () {
  'use strict';

  // add cookie message
  if (window.GOVUK && GOVUK.addCookieMessage) {
    GOVUK.addCookieMessage();
  }

  // header navigation toggle
  if (document.querySelectorAll && document.addEventListener) {
    const els = document.querySelectorAll('.js-header-toggle');
    let i; let _i;
    for(i = 0, _i = els.length; i < _i; i++) {
      els[i].addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.getElementById(this.getAttribute('href').substr(1));
        const targetClass = target.getAttribute('class') || '';
        const sourceClass = this.getAttribute('class') || '';

        if(targetClass.indexOf('js-visible') !== -1) {
          target.setAttribute('class', targetClass.replace(/(^|\s)js-visible(\s|$)/, ''));
        } else {
          target.setAttribute('class', targetClass + ' js-visible');
        }
        if(sourceClass.indexOf('js-visible') !== -1) {
          this.setAttribute('class', sourceClass.replace(/(^|\s)js-visible(\s|$)/, ''));
        } else {
          this.setAttribute('class', sourceClass + ' js-visible');
        }
        this.setAttribute('aria-expanded', this.getAttribute('aria-expanded') !== 'true');
        target.setAttribute('aria-hidden', target.getAttribute('aria-hidden') === 'false');
      });
    }
  }
}).call(this);
