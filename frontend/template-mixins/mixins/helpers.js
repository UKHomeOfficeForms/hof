'use strict';

const querystring = require('querystring');
const path = require('path');
const moment = require('moment');

const renderer = require('./render');

module.exports = (options) => (req, res, next) => {

  const hoganRender = renderer(res);

  const t = function (key) {
    return hoganRender(req.translate(options.sharedTranslationsKey + key), this);
  };

  res.locals.currency = function () {
    return function (txt) {
      txt = hoganRender(txt, this);
      let value = parseFloat(txt);
      if (isNaN(value)) {
        return txt;
      } else if (value % 1 === 0) {
        value = value.toString();
      } else {
        value = value.toFixed(2);
      }
      return '£' + value;
    };
  };

  res.locals.date = function () {
    return function (txt) {
      txt = (txt || '').split('|');
      const value = hoganRender(txt[0], this);
      return moment(value).format(txt[1] || 'D MMMM YYYY');
    };
  };

  res.locals.hyphenate = function () {
    return function (txt) {
      const value = hoganRender(txt, this);
      return value.trim().toLowerCase().replace(/\s+/g, '-');
    };
  };

  res.locals.uppercase = function () {
    return function (txt) {
      return hoganRender(txt, this).toUpperCase();
    };
  };

  res.locals.lowercase = function () {
    return function (txt) {
      return hoganRender(txt, this).toLowerCase();
    };
  };

  res.locals.selected = function () {
    return function (txt) {
      let val;
      const bits = txt.split('=');
      if (this.values && this.values[bits[0]] !== undefined) {
        val = this.values[bits[0]].toString();
      }
      return val === bits[1] ? ' checked="checked"' : '';
    };
  };

  /**
  * Use on whole sentences
  */
  res.locals.time = function () {
    return function (txt) {
      txt = hoganRender(txt, this);
      txt = txt.replace(/12:00am/i, 'midnight').replace(/^midnight/, 'Midnight');
      txt = txt.replace(/12:00pm/i, 'midday').replace(/^midday/, 'Midday');
      return txt;
    };
  };

  res.locals.t = function () {
    return function (txt) {
      txt = hoganRender(txt, this);
      return t.apply(req, [txt, this]);
    };
  };

  res.locals.url = function () {
    return function (url) {
      url = hoganRender(url, this);
      return req.baseUrl ? path.resolve(req.baseUrl, url) : url;
    };
  };

  res.locals.qs = function () {
    return function (query) {
      return '?' + querystring.stringify(Object.assign({}, req.query, querystring.parse(query)));
    };
  };

  next();

};
