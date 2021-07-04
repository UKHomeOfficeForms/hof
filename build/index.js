'use strict';

const path = require('path');
const merge = require('lodash').merge;
const config = require('../config/builder-defaults');

module.exports = options => {
  const settings = {};

  merge(settings, config);

  // load settings from ./hof.settings.json if it exists
  let localConfig;
  let hofSettings;
  try {
    localConfig = path.resolve(process.cwd(), './hof.settings');
    hofSettings = require(localConfig).build || {};
    hofSettings.theme = require(localConfig).theme;
  } catch (e) {
    // ignore error for missing config file
  }

  if (hofSettings) {
    console.log(`Found local config at ${localConfig}`);
    merge(settings, hofSettings);
  }

  // load override config file if defined
  if (options.config) {
    merge(settings, require(path.resolve(process.cwd(), options.config)));
  }

  settings.production = options.production || process.env.NODE_ENV === 'production';
  settings.watchNodeModules = options['watch-node-modules'];
  settings.watchDotFiles = options['watch-dotfiles'];
  settings.verbose = options.verbose;
  settings.env = options.env;

  const task = options._[0] || 'build';

  try {
    require.resolve(`./tasks/${task}`);
  } catch (e) {
    throw new Error(`Unknown task: ${task}`);
  }

  return require(`./tasks/${task}`)(settings);
};
