/* eslint no-process-env: 0 */

'use strict';

const chai = require('chai');

process.env.NODE_ENV = 'test';

global.chai = require('chai');
global.should = chai.should();
global.expect = chai.expect;
global._ = require('lodash');