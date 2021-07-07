'use strict';

const path = require('path');
const fs = require('fs');
const mapValues = require('lodash').mapValues;

/**
 * Traverse over a directory and build an object containing all the translations within that directory
 */

module.exports = (dir, nsp) => {
  const namespace = nsp || 'default';

  const langs = fs.readdirSync(dir);

  const resources = langs.reduce((map, lang) => {
    const stat = fs.statSync(path.resolve(dir, lang));
    if (stat.isDirectory()) {
      map[lang] = { default: {} };
      const files = fs.readdirSync(path.resolve(dir, lang));
      files.forEach(file => {
        if (path.extname(file) === '.json') {
          const name = path.basename(file, '.json');
          map[lang].default[name] = require(path.resolve(dir, lang, file));
        }
      });
    }
    return map;
  }, {});

  return mapValues(resources, lang => ({ [namespace]: lang.default }));
};
