'use strict';

const glob = require('glob');
const flatten = require('lodash').flatten;
const path = require('path');

/**
 * Takes an array of globs and returns an array of absolute paths of matching directories
 */

module.exports = gls => {
  const globs = gls || [];
  return flatten(globs.map(dir => glob.sync(dir))).map(dir => path.resolve(process.cwd(), dir));
};
