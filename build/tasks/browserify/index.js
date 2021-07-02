'use strict';

const browserify = require('browserify');
const fs = require('fs');
const path = require('path');
const minify = require('./compress');

const mkdir = require('../../lib/mkdir');

module.exports = config => {
  if (!config.browserify) {
    return Promise.resolve();
  }

  const out = path.resolve(process.cwd(), config.browserify.out);

  return mkdir(out)
    .then(() => new Promise((resolve, reject) => {
      const bundler = browserify(config.browserify.src);
      if (config.theme) {
        bundler.transform(require('aliasify'), {
          aliases: {
            $$theme: `hof-theme-${config.theme}`
          }
        });
      }
      let stream = bundler.bundle();
      if (config.browserify.compress || config.production) {
        stream = stream.pipe(minify());
      }
      stream = stream.pipe(fs.createWriteStream(out));

      stream.on('finish', resolve).on('error', reject);
    }));
};

module.exports.task = 'browserify';
