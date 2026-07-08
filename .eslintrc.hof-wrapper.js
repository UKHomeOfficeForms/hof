'use strict';

/*
 * NOTE: This file is a wrapper for the default Hof ESLint config.
 * It is used to override rules for specific files in the Hof repo that are
 * not compatible with the default config.
 * This can be removed once the hof-config-eslint default config is updated
 * to support these files.
 */

const baseConfig = require('./node_modules/eslint-config-hof/default.js');

module.exports = {
  ...baseConfig,
  overrides: [
    ...(baseConfig.overrides || []),
    {
      files: [
        'build/tasks/vite/index.js',
        'build/tasks/vite/vite.config.js',
        'test/frontend/toolkit/vitest.config.js'
      ],
      rules: {
        'import/no-unresolved': 'off',
        'node/no-missing-import': 'off',
        'node/no-missing-require': 'off'
      }
    }
  ]
};
