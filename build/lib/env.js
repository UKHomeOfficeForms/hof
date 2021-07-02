'use strict';

const fs = require('fs');
const dotenv = require('dotenv');

function hasenv(envfile) {
  return new Promise(resolve => {
    fs.stat(envfile, (err, stat) => err ? resolve(false) : resolve(stat.isFile()));
  });
}

function readenv(envfile) {
  return new Promise((resolve, reject) => {
    fs.readFile(envfile, (err, data) => err ? reject(err) : resolve(data));
  });
}

function loadenv(envfile, enabled) {
  return hasenv(envfile)
    .then(exists => {
      if (!exists && enabled) {
        throw new Error(`No env file could be found at ${envfile}`);
      } else if (exists && !enabled) {
        console.log(`Local env file found at ${envfile}.`);
        console.log('To load variables from this file run with --env.');
      } else if (exists && enabled) {
        console.log(`Loading variables from env file at ${envfile}`);
        return readenv(envfile)
          .then(env => dotenv.parse(env));
      }
      return {};
    });
}

module.exports = loadenv;
