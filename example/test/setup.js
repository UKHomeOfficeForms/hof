'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
global.chai = require('chai').use(require('sinon-chai'));
global.should = chai.should();