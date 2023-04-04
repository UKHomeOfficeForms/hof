'use strict';

const path = require('path');
const fs = require('fs');

module.exports = file => new Promise((resolve, reject) => {
  const dir = path.dirname(file);
  fs.mkdir(dir, {recursive: true}, err => err ? reject(err) : resolve());
});
