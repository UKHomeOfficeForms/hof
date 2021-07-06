'use strict';

var each = require('lodash').forEach;

var DESKTOP_WIDTH = 769;

var helpers = {};

if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function (obj, start) {
    for (var i = (start || 0), j = this.length; i < j; i++) {
      if (this[i] === obj) { return i; }
    }
    return -1;
  };
}

helpers.documentReady = function (callback) {
  this.addEvent(document, 'DOMContentLoaded', callback);
  this.addEvent(window, 'load', callback);
};

helpers.addEvent = function (el, type, callback) {
  if (el.addEventListener) {
    el.addEventListener(type, callback, false);
  } else if (el.attachEvent) {
    el.attachEvent('on' + type, callback);
  }
};

helpers.removeEvent = function (el, type, callback) {
  if (el.removeEventListener) {
    el.removeEventListener(type, callback, false);
  } else if (el.detachEvent) {
    el.detachEvent('on' + type, callback);
  }
};

helpers.target = function (e) {
  return e.target || e.srcElement;
};

/**
 * Cross-browser trigger event method
 */
helpers.triggerEvent = function (el, type) {
  var evt;

  if (document.createEvent) {
    evt = new Event(type);
    el.dispatchEvent(evt);
  } else {
    evt = document.createEventObject();
    el.fireEvent('on' + type, evt);
  }
};

helpers.preventDefault = function (e) {
  e.preventDefault ? e.preventDefault() : event.returnValue = false;
};

/*
** Check if an element has a class name
***/
helpers.hasClass = function (el, className) {
  if (el.className.split(/\s/).indexOf(className) !== -1) {
    return true;
  }
  return false;
};

helpers.addClass = function (el, className) {
  var current = el.className;

  if (current === '') {
    el.className = className;
  } else {
    current = current.split(' ');

    if (current.indexOf(className) !== -1) {
      this.stripClasses(current, className);
    }

    current.push(className);
    el.className = current.join(' ');
  }
};

helpers.addClasses = function (el, classNames) {
  each(classNames, function (className) {
    helpers.addClass(el, className);
  });
};

/*
** Strips all class names with name className from array
***/
helpers.stripClasses = function (arr, className) {
  for (var i = 0; i < arr.length; i++) {
    if(arr[i] === className) {
      arr.splice(i, 1);
      --i;
    }
  }
};

helpers.removeClass = function (el, className) {
  var current = el.className;

  if (current !== '') {
    current = current.split(' ');
    this.stripClasses(current, className);
    el.className = current.join(' ');
  }
};

helpers.getElementsByClass = function (parent, tag, className) {
  if (parent.getElementsByClassName) {
    return parent.getElementsByClassName(className);
  }
  var elems = [];
  each(parent.getElementsByTagName(tag), function (t) {
    if (helpers.hasClass(t, className)) {
      elems.push(t);
    }
  });
  return elems;
};

helpers.once = function (elem, key, callback) {
  if (!elem) { return; }
  elem.started = elem.started || {};
  if (!elem.started[key]) {
    elem.started[key] = true;
    callback(elem);
  }
};

helpers.viewportWidth = function () {
  return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
};

helpers.scrollY = function () {
  return window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;
};

helpers.isDesktop = function () {
  return helpers.viewportWidth() >= DESKTOP_WIDTH;
};

helpers.isJSWindow = function () {
  return window.opener !== null;
};

helpers.getStyle = function (elem, prop) {
  var val = '';
  if (document.defaultView && document.defaultView.getComputedStyle) {
    val = document.defaultView.getComputedStyle(elem, '').getPropertyValue(prop);
  } else if (elem.currentStyle) {
    prop = prop.replace(/\-(\w)/g, function (match, c) {
      return c.toUpperCase();
    });
    val = elem.currentStyle[prop];
  }
  return val;
};

helpers.pagehide = function (func) {
  if ('onpagehide' in window) {
    helpers.addEvent(window, 'pagehide', func);
  } else {
    helpers.addEvent(window, 'unload', func);
  }
};

module.exports = helpers;
