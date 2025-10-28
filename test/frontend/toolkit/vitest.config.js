import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: path.resolve(__dirname), // make project root the actual repo root

  // Tells Vite/Vitest this is a framework, not an app
  build: {
    lib: {
      entry: path.resolve(__dirname, 'noop.js'), // placeholder entry since there is no actual build
      formats: ['es', 'cjs']
    }
  },

  test: {
    globals: true,
    environment: 'jsdom',
    include: ['./spec/index.js'],
    transformMode: {
      // Lets Vitest transform .js files in CommonJS format
      web: [/\.([jt]sx?|cjs)$/]
    }
  }
});
