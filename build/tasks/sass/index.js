/* eslint-disable no-console */
'use strict';

const fs = require('fs');
const path = require('path');
const sass = require('sass');
const importer = require('../../helpers/importer');
const mkdir = require('../../lib/mkdir');
const hofConfig = require('../../../config/hof-defaults');
const logger = require('../../../lib/logger')(hofConfig);

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

      // Build source maps if we are not in production
      const createSourceMaps = !config.production && config.sass.sourceMaps;

      sass.render({
        file: config.sass.src,
        importer: importer({ aliases }),
        aliases,
        outputStyle: config.sass.outputStyle,
        quietDeps: config.sass.quietDeps,
        outFile: out,
        sourceMap: createSourceMaps
      }, (err, result) => err ? reject(err) : resolve(result));
    }))
    .then(result => {
      // Write the compiled CSS to the output file
      const writeCss = new Promise((resolve, reject) => {
        fs.writeFile(out, result.css, err => err ? reject(err) : resolve());
      });

      // If a sourcemap was generated, write it to a separate file
      if (result.map) {
        const mapPath = path.join(path.dirname(out), path.basename(out) + '.map');
        const writeMap = new Promise((resolve, reject) => {
          fs.writeFile(mapPath, result.map, err => {
            if (err) {
              logger.error('Failed to create sourcemap:', err);
              reject(err);
            } else {
              logger.info('Sourcemap created successfully:', mapPath);
              resolve();
            }
          });
        });
        return Promise.all([writeCss, writeMap]);
      }

      return writeCss;
    });
};
module.exports.task = 'compile sass';
