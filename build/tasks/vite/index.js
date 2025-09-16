
const vite = require('vite');
// const {resolve} = require('path');
// const viteConfig = require('../../../vite.config.js'); 
const path = require('path');

module.exports = () => {
//   vite.defineConfig({
//   root: '../../../frontend',
//   build: {
//     outDir: '../public/assets',
//     emptyOutDir: true,
//     rollupOptions: {
//       input: {
//         index: resolve(__dirname, '../../../../hof/frntend/themes/gov-uk/client-js/index.js'),
//         styles: resolve(__dirname, '../../../../hof/frontend/themes/gov-uk/styles/govuk.scss')
//       }
//     },
//     css: {
//       preprocessorOptions: {
//         scss: {
//           includes: ['node_modules'],
//         }
//       }
//   }
// }
// });
return vite.build({
  configFile: path.resolve(__dirname, './vite.config.js')
});
//return vite.build();
}
module.exports.task = 'vite';
