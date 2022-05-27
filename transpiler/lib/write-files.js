'use strict';

const fs = require('fs');
const path = require('path');
const rm = require('rimraf').sync;

const debug = require('debug')('hof:transpiler');

module.exports = (dir, data) => {
  const langs = Object.keys(data);

  debug(`Compiled content from ${dir} in ${langs.join(', ')}`);

  langs.forEach(lang => {
    const outputDir = path.resolve(dir, '..', lang);
    rm(outputDir);
    debug(`Emptied directory ${outputDir}`);
    fs.mkdirSync(outputDir);
    debug(`Made directory ${outputDir}`);
    Object.keys(data[lang]).forEach(namespace => {
      fs.writeFileSync(path.resolve(outputDir, `${namespace}.json`), JSON.stringify(data[lang][namespace], null, '  '));
    });
  });
};
