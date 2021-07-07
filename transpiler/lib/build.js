'use strict';

const expand = require('./expand-dirs');
const aggregate = require('./aggregate');
const _ = require('lodash');

module.exports = options => {
  const directories = expand(options.sources);
  const shared = expand([].concat(options.shared || [])).map(dir => aggregate(dir));

  return _.zipObject(directories, directories.map(dir => {
    const inputs = [{}].concat(shared).concat([aggregate(dir)]);
    return _.merge.apply(null, inputs);
  }));
};
