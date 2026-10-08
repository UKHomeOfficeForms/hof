'use strict';

const path = require('path');
const spawn = require('../../lib/spawn');

const transpiler = path.resolve(__dirname, '../../../bin/hof-transpiler');

module.exports = config => {
  if (!config.translate) {
    return Promise.resolve();
  }

  const args = [config.translate.src];
  if (config.translate.shared) {
    const shared = [].concat(config.translate.shared);
    shared.forEach(sharedPath => {
      args.push('--shared', sharedPath);
    });
  }

  return spawn(process.execPath, [transpiler, ...args]);
};
module.exports.task = 'compile translations';
