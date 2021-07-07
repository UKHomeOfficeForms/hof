'use strict';

const path = require('path');
const mkdirp = require('mkdirp');

module.exports = file => new Promise((resolve, reject) => {
  const dir = path.dirname(file);
  mkdirp(dir, err => err ? reject(err) : resolve());
});
