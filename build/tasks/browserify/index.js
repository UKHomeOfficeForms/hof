'use strict';

const browserify = require('browserify');
const fs = require('fs');
const path = require('path');
const minify = require('./compress');
const exorcist = require('exorcist');

const mkdir = require('../../lib/mkdir');

module.exports = config => {
  if (!config.browserify) {
    return Promise.resolve();
  }

  const out = path.resolve(process.cwd(), config.browserify.out);

  // Enable debug mode (builds source maps) only if not in production
  const debugMode = !config.production && config.browserify.debug;

  return mkdir(out)
    .then(() => new Promise((resolve, reject) => {
      const bundler = browserify(config.browserify.src, {debug: debugMode});
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

      // If debugging, use exorcist to extract a source map
      if (debugMode) {
        const mapPath = path.join(path.dirname(out), path.basename(out) + '.map');
        stream = stream.pipe(exorcist(mapPath));
      }

      stream = stream.pipe(fs.createWriteStream(out));

      stream.on('finish', resolve).on('error', reject);
    }));
};

module.exports.task = 'browserify';
