'use strict';

const build = require('./build');
const write = require('./write-files');

module.exports = options => {
  const output = build(options);

  Object.keys(output).forEach(dir => {
    write(dir, output[dir]);
  });
};
