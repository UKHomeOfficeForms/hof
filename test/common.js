'use strict';

process.env.NODE_ENV = 'test';

global.chai = require('chai').use(require('sinon-chai'));
global.should = chai.should();
global.expect = chai.expect;
global.sinon = require('sinon');

process.setMaxListeners(0);
process.stdout.setMaxListeners(0);
