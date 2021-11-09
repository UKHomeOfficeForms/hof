'use strict';

process.env.NODE_ENV = 'test';

global.chai = require('chai').use(require('sinon-chai'));
global.should = chai.should();

process.setMaxListeners(0);
process.stdout.setMaxListeners(0);
