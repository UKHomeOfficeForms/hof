/* eslint-disable no-var */
'use strict';

var toolkit = require('../../toolkit');
var helpers = toolkit.helpers;
var progressiveReveal = toolkit.progressiveReveal;
var formFocus = toolkit.formFocus;
var characterCount = toolkit.characterCount;
var validation = toolkit.validation;

var cookieSettings = require('./cookieSettings');

toolkit.detailsSummary();

helpers.documentReady(progressiveReveal);
helpers.documentReady(formFocus);
helpers.documentReady(cookieSettings.initialiseCookieBanner);
helpers.documentReady(cookieSettings.initialiseCookiePage);
helpers.documentReady(characterCount);
helpers.documentReady(validation);
