/* eslint-disable no-console */
'use strict';
import { defineConfig } from 'vite';
import { resolve } from 'path';
const __dirname = import.meta.dirname;

export default defineConfig({
  root: '../../../frontend',
  build: {
    outDir: '../public/assets',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(__dirname, '../../../../hof/frontend/themes/gov-uk/client-js/index.js'),
        styles: resolve(__dirname, '../../../../hof/frontend/themes/gov-uk/styles/govuk.scss')
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          includes: ['node_modules']
        }
      }
    }
  },
  // Custom plugin to suppress specific resolve warnings.
  // Vite does not process and optimise static images and assets files, it uses a src/ folder.
  // the images and assets folders are therefore loaded at runtime from the public/ folder.
  // This should be resolved with the v5/nunjucks work so we can ignore these warnings for now.
  // TO DO: Remove this when v5/nunjucks is implemented.
  plugins: [
    {
      name: 'suppress-resolve-warnings',
      apply: 'build',
      configResolved() {
        // Intercept all console warnings printed during build
        const originalWarning = console.warn;
        console.warn = (...args) => {
          if (
            args.some(arg =>
              typeof arg === 'string' &&
              arg.includes("didn't resolve at build time")
            )
          ) {
            return; // skip this specific warning
          }
          originalWarning(...args);
        };
      }
    }
  ]
});
