/* eslint-disable no-var, vars-on-top, no-unused-vars */
'use strict';

var toolkit = require('../../../toolkit');
var helpers = toolkit.helpers;
var progressiveReveal = toolkit.progressiveReveal;
var formFocus = toolkit.formFocus;
var characterCount = toolkit.characterCount;
var validation = toolkit.validation;

var GOVUK = require('govuk-frontend');
GOVUK.initAll();
window.GOVUK = GOVUK;
var skipToMain = require('./skip-to-main');
var cookie = require('./govuk-cookies');
var cookieSettings = require('./cookieSettings');

toolkit.detailsSummary();

helpers.documentReady(progressiveReveal);
helpers.documentReady(formFocus);
helpers.documentReady(cookieSettings.initialiseCookieBanner);
helpers.documentReady(cookieSettings.initialiseCookiePage);
helpers.documentReady(cookieSettings.onLoad);
helpers.documentReady(characterCount);
helpers.documentReady(validation);
