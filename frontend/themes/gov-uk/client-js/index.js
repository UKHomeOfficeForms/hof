/* eslint-disable no-var, vars-on-top, no-unused-vars */
'use strict';

var helpers = require('./helpers');

var GOVUK = require('govuk-frontend');
GOVUK.initAll();
window.GOVUK = GOVUK;
var skipToMain = require('./skip-to-main');
var cookie = require('./govuk-cookies');
var cookieSettings = require('./cookieSettings');
var sessionDialog = require('./session-timeout-dialog');

helpers.documentReady(cookieSettings.initialiseCookieBanner);
helpers.documentReady(cookieSettings.initialiseCookiePage);
helpers.documentReady(cookieSettings.onLoad);
