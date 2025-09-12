import { defineConfig } from 'vite';
import {resolve} from 'path';
const __dirname = import.meta.dirname

export default defineConfig({
  root: './frontend',
  build: {
    outDir: '../public/assets',
    emptyOutDir: true,
    rollupOptions: {
     input: {
        index: resolve(__dirname, 'frontend/themes/gov-uk/client-js/index.js'),
        styles: resolve(__dirname, 'frontend/themes/gov-uk/styles/govuk.scss')
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
