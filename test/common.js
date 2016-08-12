'use strict';

global.chai = require('chai').use(require('sinon-chai'));
global.should = chai.should();
global.sinon = require('sinon');
require('sinomocha')();

process.setMaxListeners(0);
process.stdout.setMaxListeners(0);
