'use strict';

const path = require('path');
const stack = require('callsite');
const findup = require('findup');

function which(name, scpt) {
  if (!name) { throw new Error('package name must be provided'); }
  const script = scpt || name;

  const pkgPath = `node_modules/${name}/package.json`;
  const callsite = stack()[1].getFileName();
  const dir = findup.sync(callsite, pkgPath);

  const pkgLocation = path.join(dir, pkgPath);
  const pkg = require(pkgLocation);
  let bin = pkg.bin[script];

  if (!bin && typeof pkg.bin === 'string') {
    bin = pkg.bin;
  }

  if (!bin) { throw new Error(`binary path for ${script} not found`); }

  return path.resolve(path.dirname(pkgLocation), bin);
}

module.exports = which;
