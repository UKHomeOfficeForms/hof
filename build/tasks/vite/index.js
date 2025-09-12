
const vite = require('vite');
const {resolve} = require('path');
const viteConfig = require('../../../vite.config.js'); 

module.exports = () =>{vite.defineConfig({
  root: '../../../frontend',
  build: {
    outDir: '../public/assets',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(__dirname, '../../../../hof/frntend/themes/gov-uk/client-js/index.js'),
        styles: resolve(__dirname, '../../../../hof/frontend/themes/gov-uk/styles/govuk.scss')
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          includes: ['node_modules'],
        }
      }
  }
}
});
return vite.build();
}
module.exports.task = 'vite';

// const { build, resolveConfig } = require('vite');
// const path = require('path');
// module.exports = async function () {
//   const mode = 'production'; // or 'development', etc.
//   // Dynamically import the Vite config as an ES module
//   const viteConfig = (await import(path.resolve(__dirname, './vite.config.js'))).default;

//   const config = await resolveConfig(
//     viteConfig,
//     mode,
//     'build'   // command: 'serve' | 'build'
    
//   );

//   return await build(config);
// }

// module.exports.task = 'vite';
