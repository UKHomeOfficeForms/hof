'use strict';

module.exports = {

  trim(value) {
    return typeof value === 'string' ? value.trim() : value;
  },

  boolean(value) {
    if (value === true || value === 'true') {
      return true;
    } else if (value === false || value === 'false') {
      return false;
    }
    return undefined;
  },

  uppercase(value) {
    return typeof value === 'string' ? value.toUpperCase() : value;
  },

  lowercase(value) {
    return typeof value === 'string' ? value.toLowerCase() : value;
  },

  removespaces(value) {
    return typeof value === 'string' ? value.replace(/\s+/g, '') : value;
  },

  singlespaces(value) {
    return typeof value === 'string' ? value.replace(/\s+/g, ' ') : value;
  },

  hyphens(value) {
    return typeof value === 'string' ? value.replace(/[–—-]+/g, '-') : value;
  },

  removeroundbrackets(value) {
    return typeof value === 'string' ? value.replace(/[\(\)]/g, '') : value;
  },

  removehyphens(value) {
    return typeof value === 'string' ? value.replace(/[–—-]+/g, '') : value;
  },

  removeslashes(value) {
    return typeof value === 'string' ? value.replace(/[\/\\]/g, '') : value;
  },

  ukphoneprefix(value) {
    return typeof value === 'string' ? value.replace(/^\+44\(?0?\)?/, '0') : value;
  },

  base64decode(value) {
    return Buffer.from(value, 'base64').toString();
  },

  ukPostcode(value) {
    if (typeof value !== 'string' || value === '') {
      return value;
    }

    const postcode = this.uppercase(this.removespaces(value));
    const firstPart = postcode.slice(0, -3);
    const secondPart = postcode.slice(-3);

    return `${firstPart} ${secondPart}`;
  }

};
