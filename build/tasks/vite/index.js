/* eslint-disable no-console */
'use strict';

const vite = require('vite');
const path = require('path');
const viteConfig = path.resolve(__dirname, './vite.config.js');
const hofDefaults = require('../../../config/hof-defaults');
module.exports = config => {
// The config.production’s value is set up with a command flag
//  in the package.json’s script. process.env.NODE_ENV);
  console.log('Vite build - production:', config.production, 'env: ',config.env);
  console.log('hofDefaults:', hofDefaults);
  
  // if (config.production === true) {
  //   return vite.build({
  //     configFile: viteConfig
  //   });
  // }
  // process.env.NODE_ENV = 'development'; // TO DO make this dynamic to Ensure
  // // the environment is set to development for non-production build
  // return vite.build({
  //   configFile: viteConfig,
  //   mode: 'development'
  // });
  process.env.NODE_ENV = hofDefaults.env;
 
if(!config.production){
  console.log('Vite build - expecting development/local:', process.env.NODE_ENV);
  return vite.build({
  configFile: viteConfig,
  mode: 'development'
  });
} else{
  console.log('Vite build - expecting production:', process.env.NODE_ENV);
  return vite.build({
  configFile: viteConfig
  });
 }
}
module.exports.task = 'vite';
