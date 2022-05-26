'use strict';

const path = require('path');
const fsPromises = require('fs/promises');

module.exports = file => fsPromises.mkdir(path.dirname(file), {recursive: true});
