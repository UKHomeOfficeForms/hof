/* eslint-disable no-param-reassign, no-console */
'use strict';

const nunjucks = require('nunjucks');

module.exports = res => (text, ctx) => {
  if (!text) {
    return '';
  }
  ctx = Object.assign({}, res.locals, ctx);
  try {
    return nunjucks.renderString(text, ctx);
  } catch (e) {
    // fallback to empty string on render error
    console.error('nunjucks renderString error:', e.message);
    return '';
  }
};
