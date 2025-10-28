'use strict';

const vite = require('vite');
const path = require('path');
const viteConfig = path.resolve(__dirname, './vite.config.js');
const hofDefaults = require('../../../config/hof-defaults');

module.exports = config => {
  process.env.NODE_ENV = hofDefaults.env;

  if(!config.production) {
    return vite.build({
      configFile: viteConfig,
      mode: 'development'
    });
  }
  return vite.build({
    configFile: viteConfig
  });
};
module.exports.task = 'vite';
