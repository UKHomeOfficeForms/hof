'use strict';

const spawn = require('../../lib/spawn');
const witch = require('witch');

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

  return spawn(witch('hof-transpiler'), args);
};
module.exports.task = 'compile translations';
