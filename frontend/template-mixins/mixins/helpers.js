/* eslint-disable no-param-reassign */
'use strict';

const querystring = require('querystring');
const path = require('path');
const moment = require('moment');

const renderer = require('./render');

module.exports = options => (req, res, next) => {
  const nunjucksRender = renderer(res);

  const t = function (key) {
    return nunjucksRender(req.translate(options.sharedTranslationsKey + key), this);
  };

  // helper factory that supports both direct-call and block/callable usage
  function makeHelper(fn) {
    return function () {
      // direct call: helper(arg)
      if (arguments.length > 0) {
        const txt = arguments[0];
        return fn.call(this, nunjucksRender(txt, this));
      }
      // callable/block usage: helper() returns inner function
      return function (txt) {
        return fn.call(this, nunjucksRender(txt, this));
      };
    };
  }

  res.locals.currency = makeHelper(function (value) {
    let txt = parseFloat(value);
    if (isNaN(txt)) return value;
    if (txt % 1 === 0) txt = txt.toString();
    else txt = txt.toFixed(2);
    return '£' + txt;
  });

  res.locals.date = function () {
    if (arguments.length > 0) {
      const txt = arguments[0].split('|');
      const value = nunjucksRender(txt[0], this);
      return moment(value).format(txt[1] || 'D MMMM YYYY');
    }
    return function (txt) {
      txt = (txt || '').split('|');
      const value = nunjucksRender(txt[0], this);
      return moment(value).format(txt[1] || 'D MMMM YYYY');
    };
  };

  res.locals.hyphenate = makeHelper(function (value) {
    return value.trim().toLowerCase().replace(/\s+/g, '-');
  });

  res.locals.uppercase = makeHelper(function (value) {
    return String(value).toUpperCase();
  });

  res.locals.lowercase = makeHelper(function (value) {
    return String(value).toLowerCase();
  });

  res.locals.selected = function () {
    if (arguments.length > 0) {
      const txt = arguments[0];
      const bits = txt.split('=');
      let val;
      if (this.values && this.values[bits[0]] !== undefined) {
        val = this.values[bits[0]].toString();
      }
      return val === bits[1] ? ' checked="checked"' : '';
    }
    return function (txt) {
      const bits = txt.split('=');
      let val;
      if (this.values && this.values[bits[0]] !== undefined) {
        val = this.values[bits[0]].toString();
      }
      return val === bits[1] ? ' checked="checked"' : '';
    };
  };

  res.locals.time = makeHelper(function (value) {
    value = value.replace(/12:00am/i, 'midnight').replace(/^midnight/, 'Midnight');
    value = value.replace(/12:00pm/i, 'midday').replace(/^midday/, 'Midday');
    return value;
  });

  res.locals.t = function () {
    // support both t('key') and callable block usage
    if (arguments.length > 0) {
      let txt = arguments[0];
      txt = nunjucksRender(txt, this);
      return t.apply(req, [txt, this]);
    }
    return function (txt) {
      txt = nunjucksRender(txt, this);
      return t.apply(req, [txt, this]);
    };
  };

  res.locals.url = function () {
    if (arguments.length > 0) {
      let url = arguments[0];
      url = nunjucksRender(url, this);
      return req.baseUrl ? path.resolve(req.baseUrl, url) : url;
    }
    return function (url) {
      url = nunjucksRender(url, this);
      return req.baseUrl ? path.resolve(req.baseUrl, url) : url;
    };
  };

  res.locals.qs = function () {
    if (arguments.length > 0) {
      const query = arguments[0];
      return '?' + querystring.stringify(Object.assign({}, req.query, querystring.parse(query)));
    }
    return function (query) {
      return '?' + querystring.stringify(Object.assign({}, req.query, querystring.parse(query)));
    };
  };

  next();
};
