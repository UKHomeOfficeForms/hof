/* eslint-disable no-console */
'use strict';

import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
// import hofDefaults from '../../../config/hof-defaults';

let tempConfig = {};
try {
  tempConfig = JSON.parse(
    fs.readFileSync(resolve(__dirname, './hof-vite-config.json'), 'utf8')
  );
}catch (e) {
  console.warn('Could not load hof-vite-config.json. ' + e.message);
}

const publicDirectory = resolve(process.cwd(), 'public');
// const config = require('../../../config/builder-defaults.js');
const entryFile = (() => {
  const src = resolve(process.cwd(), 'assets/js/index.js');
  if (fs.existsSync(src)) return src;

  throw new Error(`vite: entry file not found. Checked: ${src}`);
})();

console.log('5555555555 Vite build -in vite.config.js  file :', tempConfig);
export default defineConfig({
  plugins: [
    commonjs({
      include: [/node_modules/, /assets\/js/, /frontend/]
    }),
    nodeResolve({ browser: true, preferBuiltins: false }),
    // Intercept all console warnings printed during build
    // Custom plugin to suppress specific resolve warnings.
    // Vite does not process and optimise static images and assets files, it uses a src/ folder.
    // the images and assets folders are therefore loaded at runtime from the public/ folder.
    // This should be resolved with the v5/nunjucks work so we can ignore these warnings for now.
    // TODO: Remove this when v5/nunjucks is implemented.
    {
      name: 'suppress-resolve-warnings',
      apply: 'build',
      configResolved() {
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
    },
    {
      name: 'delete-hof-vite-config',
      closeBundle() {
        const configPath = resolve(__dirname, './hof-vite-config.json');
        if (fs.existsSync(configPath)) {
          try {
            fs.unlinkSync(configPath);
            console.log('.hof-vite-config.json deleted after build');
          } catch (err) {
            console.warn('Failed to delete .hof-vite-config.json:', err);
          }
        }
      }
    }
  ],
  base: '/assets/',
  publicDir: 'static', // static files copied as-is
  build: {
    outDir: publicDirectory,
    emptyOutDir: false,
    sourcemap: tempConfig.js && tempConfig.js.sourceMaps,
    rollupOptions: {
      input: {
        index: entryFile
      },
      output: {
        entryFileNames: 'js/bundle.js',
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames: assetInfo => {
          const ext = assetInfo.name && assetInfo.name.split('.').pop();
          if (/css/i.test(ext)) return 'css/[name]-[hash][extname]';
          if (/svg|png|jpg|jpeg|gif|webp|ico/i.test(ext)) return 'images/[name]-[hash][extname]';
          return 'assets/[name]-[hash][extname]';
        },
        format: 'iife'
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          includes: ['node_modules']
        }
      }
    }
  }
});
