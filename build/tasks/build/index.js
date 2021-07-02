'use strict';

const tasks = require('../');
const run = require('../../lib/run');

module.exports = config => run(Object.keys(tasks).map(task => tasks[task]), config);
