'use strict';

const path = require('path');
const fs = require('fs');

// In node > 11 you can replace new promise with
// fs.promises.mkdir(dir,opts,cb) or if > 10 and < 12
// use fs/promises module but can't have both
module.exports = file => new Promise((resolve, reject) => {
  const dir = path.dirname(file);
  fs.mkdir(dir, {recursive: true}, err => err ? reject(err) : resolve());
});
