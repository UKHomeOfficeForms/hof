/* eslint-disable no-param-reassign */
'use strict';

// const Hogan = require('hogan.js');

// module.exports = res => (text, ctx) => {
//   if (!text) {
//     return '';
//   }
//   ctx = Object.assign({}, res.locals, ctx);
//   return Hogan.compile(text).render(ctx);
// };

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
