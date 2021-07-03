'use strict';

const Session = require('./behaviour-session');
const Hooks = require('./behaviour-hooks');
const Controller = require('./controller');
const mix = require('mixwith').mix;

class FormController extends mix(Controller).with(Session, Hooks) {}

FormController.validators = require('./validation/validators');
FormController.formatters = require('./formatting/formatters');

FormController.ValidationError = require('./validation-error');

module.exports = FormController;
module.exports.Controller = Controller;
module.exports.BaseController = require('./base-controller');
