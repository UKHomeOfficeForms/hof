'use strict';

const path = require('path');
const fs = require('fs');
const _ = require('lodash');

const langs = fs.readdirSync(path.resolve(__dirname, 'src'));

const resources = langs.reduce((map, lang) => {
  map[lang] = { default: {} };
  const files = fs.readdirSync(path.resolve(__dirname, 'src', lang));
  files.forEach(file => {
    if (path.extname(file) === '.json') {
      const name = path.basename(file, '.json');
      map[lang].default[name] = require(path.resolve(__dirname, 'src', lang, file));
    }
  });
  return map;
}, {});

module.exports = (namespace) => {
  if (typeof namespace === 'string') {
    return _.mapValues(resources, lang => {
      return { [namespace]: lang.default };
    });
  }
  return resources;
};
