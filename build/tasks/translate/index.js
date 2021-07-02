'use strict';

const spawn = require('../../lib/spawn');

module.exports = config => {
  if (!config.translate) {
    return Promise.resolve();
  }

  const args = [config.translate.src];
  if (config.translate.shared) {
    const shared = [].concat(config.translate.shared);
    shared.forEach(path => {
      args.push('--shared', path);
    });
  }

  return spawn('node_modules/hof/bin/hof-transpiler', args);
};
module.exports.task = 'compile translations';
