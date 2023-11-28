/* eslint-disable no-console */
'use strict';

const fs = require('fs');
const chalk = require('chalk');
const spawn = require('../../lib/spawn');
const mkdir = require('../../lib/mkdir');

module.exports = config => {
  if (!config.fonts) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    fs.stat(config.fonts.src, err => err ? reject(err) : resolve());
  })
    .then(() => mkdir(config.fonts.out))
    .then(() => spawn('cp', ['-r', config.fonts.src, config.fonts.out]))
    .catch(e => {
      if (e.code !== 'ENOENT') {
        throw e;
      } else {
        console.log(`${chalk.yellow('warning')}: no fonts directory found at ${config.fonts.src}`);
      }
    });
};
module.exports.task = 'copy fonts';
