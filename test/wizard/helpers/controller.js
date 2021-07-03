'use strict';

const util = require('util');
const EventEmitter = require('events').EventEmitter;

module.exports = opts => {
  const options = opts || {};
  options.constructor = options.constructor || function () {};
  options.requestHandler = options.requestHandler || function () {};

  const Controller = function () {
    this.options = {};
    options.constructor.apply(null, arguments);
  };

  util.inherits(Controller, EventEmitter);

  Controller.prototype.requestHandler = function () {
    return options.requestHandler;
  };

  Controller.prototype.use = sinon.stub();

  return Controller;
};
