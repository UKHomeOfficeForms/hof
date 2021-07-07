/* eslint-disable no-console */
'use strict';

const fs = require('fs');
const chalk = require('chalk');
const spawn = require('../../lib/spawn');
const mkdir = require('../../lib/mkdir');

module.exports = config => {
  if (!config.images) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    fs.stat(config.images.src, err => err ? reject(err) : resolve());
  })
    .then(() => mkdir(config.images.out))
    .then(() => spawn('cp', ['-r', config.images.src, config.images.out]))
    .catch(e => {
      if (e.code !== 'ENOENT') {
        throw e;
      } else {
        console.log(`${chalk.yellow('warning')}: no images directory found at ${config.images.src}`);
      }
    });
};
module.exports.task = 'copy images';
