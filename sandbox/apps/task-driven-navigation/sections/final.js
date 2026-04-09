'use strict';

const personalDetails = require('./personal-details');
const dependantChanges = require('./dependant');
const evidence = require('./evidence');
const deathReport = require('./report-death');

module.exports = Object.assign(
  {},
  personalDetails,
  dependantChanges,
  evidence,
  deathReport
);
