'use strict';

const vite = require('vite');
const path = require('path');
const viteConfig = path.resolve(__dirname, './vite.config.js');
const hofDefaults = require('../../../config/hof-defaults');

module.exports = config => {
  process.env.NODE_ENV = hofDefaults.env;
  const publicDirectory = path.resolve(process.cwd(), config.js.outDir || 'public');

  if(!config.production) {
    return vite.build({
      configFile: viteConfig,
      mode: 'development',
      build: {
        sourcemap: config.js.sourceMaps,
        outDir: publicDirectory
      }
    });
  }
  return vite.build({
    configFile: viteConfig,
    build: {
      outDir: publicDirectory
    }
  });
};
module.exports.task = 'vite';
