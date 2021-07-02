'use strict';

const toolkit = require('hof-frontend-toolkit');
const helpers = toolkit.helpers;
const progressiveReveal = toolkit.progressiveReveal;
const formFocus = toolkit.formFocus;
toolkit.detailsSummary();

helpers.documentReady(progressiveReveal);
helpers.documentReady(formFocus);
