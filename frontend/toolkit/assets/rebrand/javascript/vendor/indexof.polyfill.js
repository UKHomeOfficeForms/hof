/* eslint-disable max-len, no-var, no-cond-assign, no-param-reassign, vars-on-top, no-extend-native */
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function (searchElement, fromIndex) {
    var k;

    if (this === null) {
      throw new TypeError('"this" is null or not defined');
    }

    var O = Object(this);

    var len = O.length >>> 0;

    if (len === 0) {
      return -1;
    }

    var n = +fromIndex || 0;

    if (Math.abs(n) === Infinity) {
      n = 0;
    }

    if (n >= len) {
      return -1;
    }

    k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

    while (k < len) {
      if (k in O && O[k] === searchElement) {
        return k;
      }
      k++;
    }
    return -1;
  };
}
