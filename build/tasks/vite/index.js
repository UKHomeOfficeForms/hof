'use strict';

const fs = require('fs');
const path = require('path');
const vite = require('vite');
const viteConfig = path.resolve(__dirname, './vite.config.js');
const hofDefaults = require('../../../config/hof-defaults');

module.exports = config => {
  process.env.NODE_ENV = hofDefaults.env;
  fs.writeFileSync(
    path.resolve(__dirname, './hof-vite-config.json'),
    JSON.stringify(config, null, 2)
  );
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
