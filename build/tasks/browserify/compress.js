'use strict';

const duplexify = require('duplexify');
const spawn = require('child_process').spawn;
const witch = require('witch');
const bin = witch('uglify-js', 'uglifyjs');

const args = ['--comments', '/copyright|licen(c|s)e/i', '--'];

function uglify() {
  const proc = spawn(bin, args, { stdio: 'pipe' });
  return duplexify(proc.stdin, proc.stdout);
}

module.exports = uglify;
