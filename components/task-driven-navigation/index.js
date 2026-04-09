'use strict';

const navigation = require('../../wizard/util/task-driven-navigation-resolver');

module.exports = navigationConfig => superclass =>
  class extends superclass {
    getConfiguredNext(req, res) {
      return navigation.resolveNext(
        req.form.options.route,
        req,
        res,
        this,
        navigationConfig
      );
    }

    markTaskComplete(req, res) {
      const config = navigation.getNavigationConfig(
        req,
        this.options,
        navigationConfig
      );
      const taskSelectionConfig = config.taskSelection || {};
      const completedField = taskSelectionConfig.completedField || 'completed-tasks';
      const currentTaskKey = navigation.getCurrentTaskKey(
        req.form.options.route,
        taskSelectionConfig,
        req,
        res
      );

      if (!currentTaskKey) {
        return;
      }

      const currentTaskConfig = (taskSelectionConfig.tasks || {})[currentTaskKey] || {};

      if (req.form.options.route !== currentTaskConfig.summaryStep) {
        return;
      }

      const completedTasks = [].concat(req.sessionModel.get(completedField) || [])
        .filter(Boolean);

      if (!completedTasks.includes(currentTaskKey)) {
        req.sessionModel.set(completedField, completedTasks.concat(currentTaskKey));
      }
    }

    normaliseUrl(target, req) {
      if (!target) {
        return target;
      }

      if (target.startsWith('http://') || target.startsWith('https://')) {
        return target;
      }

      return req.baseUrl === '/' || target.startsWith(req.baseUrl)
        ? target
        : req.baseUrl + target;
    }

    isCompleted(target, req) {
      let step = target;

      if (req.baseUrl !== '/') {
        const baseUrlPattern = new RegExp('^' + req.baseUrl);
        step = step.replace(baseUrlPattern, '');
      }

      return req.sessionModel.get('steps').includes(step);
    }

    toRelativeStep(target, req) {
      if (target === false || !target) {
        return target;
      }

      if (target.startsWith('http://') || target.startsWith('https://')) {
        return target;
      }

      let step = target;

      if (req.baseUrl !== '/') {
        const baseUrlPattern = new RegExp('^' + req.baseUrl);
        step = step.replace(baseUrlPattern, '');
      }

      return step.replace(/^\//, '');
    }

    getBackLink(req, res) {
      if (Object.prototype.hasOwnProperty.call(req.form.options, 'backLink')) {
        return super.getBackLink(req, res);
      }

      const configuredBackLink = navigation.resolveBackLink(
        req.form.options.route,
        req,
        res,
        this,
        navigationConfig
      );

      if (
        typeof configuredBackLink === 'undefined' ||
        configuredBackLink === null
      ) {
        return super.getBackLink(req, res);
      }

      res.locals.backLink = this.toRelativeStep(configuredBackLink, req);
      return super.getBackLink(req, res);
    }

    getNextStep(req, res) {
      const configured = this.getConfiguredNext(req, res);

      if (!configured.next) {
        return super.getNextStep(req, res);
      }

      if (configured.continueOnEdit) {
        req.form.options.continueOnEdit = true;
      }

      let next = this.normaliseUrl(configured.next, req);
      const confirmStep = this.normaliseUrl(this.confirmStep, req);

      if (req.params.action === 'edit') {
        if (!req.form.options.continueOnEdit && this.isCompleted(next, req)) {
          next = confirmStep;
        }

        if (next !== confirmStep && !next.match(/\/edit$|\/edit\//)) {
          next += '/edit';
        }
      }

      return next;
    }

    successHandler(req, res) {
      this.markTaskComplete(req, res);
      return super.successHandler(req, res);
    }
  };
