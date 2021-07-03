'use strict';

const csv = require('csv');
const fs = require('fs');
const path = require('path');
const concat = require('concat-stream');
const zlib = require('zlib');

const inputFile = path.resolve(path.dirname(require.resolve('postcode')), 'tests', 'data', 'postcodes.csv.gz');

let _postcodes = [];

module.exports = class PostcodeLoader {
  // eslint-disable-next-line consistent-return
  static load(callback) {
    if (_postcodes.length) {
      return callback(null, _postcodes);
    }

    global.console.log('    Loading postcodes from %s', inputFile);
    const gunzip = zlib.createGunzip();
    fs.createReadStream(inputFile)
      .pipe(gunzip)
      .pipe(csv.parse())
      .pipe(concat(data => {
        global.console.log('    %d postcodes loaded', data.length);
        _postcodes = data;
        callback(null, data);
      }));
  }
};
