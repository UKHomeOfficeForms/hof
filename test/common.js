'use strict';

const reqres = require('reqres');

process.env.NODE_ENV = 'test';

global.chai = require('chai').use(require('sinon-chai'));
global.should = chai.should();
global.expect = chai.expect;
global.sinon = require('sinon');
global.proxyquire = require('proxyquire');
global.request = reqres.req;
global.response = reqres.res;

process.setMaxListeners(0);
process.stdout.setMaxListeners(0);
