
const vite = require('vite');
const path = require('path');
const viteConfig = path.resolve(__dirname, './vite.config.js');

module.exports = (config) => {
  // The Options.production’s value is set it up with a command flag in the package.json’s script. process.env.NODE_ENV);
  console.log('Vite build - production:', config.production);
  if (config.production === true) {
    return vite.build({
      configFile: viteConfig
    });
  } else {
    process.env.NODE_ENV = 'development'; // TO DO make this dynamic to Ensure the environment is set to development for non-production builds
  return vite.build({
    configFile: viteConfig,
    mode: 'development'
  });
}}

module.exports.task = 'vite';
