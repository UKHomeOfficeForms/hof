/* eslint-disable */
'use strict';

const toolkit = require('../../../frontend/toolkit');
const helpers = toolkit.helpers;
const progressiveReveal = toolkit.progressiveReveal;
const formFocus = toolkit.formFocus;
toolkit.detailsSummary();

helpers.documentReady(progressiveReveal);
helpers.documentReady(formFocus);
