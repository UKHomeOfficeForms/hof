'use strict';

const Hogan = require('hogan.js');

module.exports = res => (text, ctx) => {
  if (!text) {
    return '';
  }
  ctx = Object.assign({}, res.locals, ctx);
  return Hogan.compile(text).render(ctx);
};
