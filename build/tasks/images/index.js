/* eslint-disable no-console */
'use strict';

const fs = require('fs');
const chalk = require('chalk');
const spawn = require('../../lib/spawn');

module.exports = config => {
  if (!config.images) {
    return Promise.resolve();
  }
  const imagesOutput = config.images.out;

  // Due to govuk rebrand logo, images are copied from multiple sources & mapping can cause 'File exists' error.
  // Remove if exists as a file
  if (fs.existsSync(imagesOutput) && !fs.lstatSync(imagesOutput).isDirectory()) {
    fs.unlinkSync(imagesOutput);
  }
  // Ensure directory exists
  if (!fs.existsSync(imagesOutput)) {
    fs.mkdirSync(imagesOutput, { recursive: true });
  }
  const srcs = Array.isArray(config.images.src) ? config.images.src : [config.images.src];

  return Promise.all(srcs.map(src => {
    if (!fs.existsSync(src)) {
      console.log(`${chalk.yellow('warning')}: Skipping missing images folder: ${src}`);
      return Promise.resolve();
    }
    return spawn('cp', ['-r', `${src}/.`, imagesOutput]);
  }))
    .catch(e => {
      if (e.code !== 'ENOENT') {
        console.error(`${chalk.red('error')}: Failed to copy images - ${e.message}`);
        throw e;
      } else {
        console.log(`${chalk.yellow('warning')}: no images directory found at ${config.images.src}`);
      }
    });
};
module.exports.task = 'copy images';
