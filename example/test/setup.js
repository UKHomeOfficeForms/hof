/* eslint no-process-env: 0 */

'use strict';


const chai = require('chai');

process.env.NODE_ENV = 'test';

global._ = require('lodash');
global.chai = require('chai')
global.should = chai.should();
global.expect = chai.expect;

