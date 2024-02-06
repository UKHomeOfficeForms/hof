'use strict';
/**
 * @namespace aria
 */

window.aria = window.aria || {};

(function () {
  // eslint-disable-next-line no-console
  // console.log('TEST UTILS.js', aria);
})();

window.aria.Utils = window.aria.Utils || {};

// Polyfill src https://developer.mozilla.org/en-US/docs/Web/API/Element/matches
window.aria.Utils.matches = function (element, selector) {
  if (!Element.prototype.matches) {
    Element.prototype.matches =
      Element.prototype.matchesSelector ||
      Element.prototype.mozMatchesSelector ||
      Element.prototype.msMatchesSelector ||
      Element.prototype.oMatchesSelector ||
      Element.prototype.webkitMatchesSelector ||
      function (s) {
        const matches = element.parentNode.querySelectorAll(s);
        let i = matches.length;
        while (--i >= 0 && matches.item(i) !== this) {
          // empty
        }
        return i > -1;
      };
  }

  return element.matches(selector);
};

window.aria.Utils.remove = function (item) {
  if (item.remove && typeof item.remove === 'function') {
    return item.remove();
  }
  if (
    item.parentNode &&
    item.parentNode.removeChild &&
    typeof item.parentNode.removeChild === 'function'
  ) {
    return item.parentNode.removeChild(item);
  }
  return false;
};

window.aria.Utils.isFocusable = function (element) {
  if (element.tabIndex < 0) {
    return false;
  }

  if (element.disabled) {
    return false;
  }

  switch (element.nodeName) {
    case 'A':
      return !!element.href && element.rel !== 'ignore';
    case 'INPUT':
      return element.type !== 'hidden';
    case 'BUTTON':
    case 'SELECT':
    case 'TEXTAREA':
      return true;
    default:
      return false;
  }
};

window.aria.Utils.getAncestorBySelector = function (element, selector) {
  if (!window.aria.Utils.matches(element, selector + ' ' + element.tagName)) {
    // Element is not inside an element that matches selector
    return null;
  }

  // Move up the DOM tree until a parent matching the selector is found
  let currentNode = element;
  let ancestor = null;
  while (ancestor === null) {
    if (window.aria.Utils.matches(currentNode.parentNode, selector)) {
      ancestor = currentNode.parentNode;
    } else {
      currentNode = currentNode.parentNode;
    }
  }

  return ancestor;
};

window.aria.Utils.hasClass = function (element, className) {
  return new RegExp('(\\s|^)' + className + '(\\s|$)').test(element.className);
};

window.aria.Utils.addClass = function (element, className) {
  if (!window.aria.Utils.hasClass(element, className)) {
    element.className += ' ' + className;
  }
};

window.aria.Utils.removeClass = function (element, className) {
  const classRegex = new RegExp('(\\s|^)' + className + '(\\s|$)');
  element.className = element.className.replace(classRegex, ' ').trim();
};

window.aria.Utils.bindMethods = function (object /* , ...methodNames */) {
  const methodNames = Array.prototype.slice.call(arguments, 1);
  methodNames.forEach(function (method) {
    object[method] = object[method].bind(object);
  });
};