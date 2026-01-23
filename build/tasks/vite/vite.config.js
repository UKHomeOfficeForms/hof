/* eslint-disable no-console */
'use strict';

import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

const publicDirectory = resolve(process.cwd(), 'public');
const config = require('../../../config/builder-defaults.js');
console.log('Vite config - loading builder defaults from:', config);
const entryFile = (() => {
  const src = resolve(process.cwd(), 'assets/js/index.js');
  if (fs.existsSync(src)) return src;

  throw new Error(`vite: entry file not found. Checked: ${src}`);
})();


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
    }
  ],
  base: '/assets/',
  publicDir: 'static', // static files copied as-is
  build: {
    outDir: publicDirectory,
    emptyOutDir: false,
    sourcemap: config.js.sourceMaps, // Enable JS/TS sourcemaps in dev
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
