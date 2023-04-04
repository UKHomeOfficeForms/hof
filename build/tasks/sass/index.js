/* eslint-disable no-console */
'use strict';

const fs = require('fs');
const path = require('path');
const sass = require('sass');
const importer = require('../../helpers/importer');
const mkdir = require('../../lib/mkdir');

module.exports = config => {
  if (!config.sass) {
    return Promise.resolve();
  }

  const out = path.resolve(process.cwd(), config.sass.out);

  return mkdir(out)
    .then(() => new Promise((resolve, reject) => {
      const aliases = {};

      if (config.theme) {
        console.log('Applying theme: ' + config.theme);
        aliases.$$theme = `hof-theme-${config.theme}`;
      }

      sass.render({
        file: config.sass.src,
        importer: importer({ aliases }),
        aliases,
        outputStyle: config.sass.outputStyle,
        quietDeps: config.sass.quietDeps
      }, (err, result) => err ? reject(err) : resolve(result.css));
    }))
    .then(css => new Promise((resolve, reject) => {
      fs.writeFile(out, css, err => err ? reject(err) : resolve());
    }));
};
module.exports.task = 'compile sass';
