'use strict';

const navigation = require('../../wizard/util/selection-driven-navigation-resolver');

module.exports = navigationConfig => superclass =>
  class extends superclass {
    // Captures the selector's pre-submit session value so later invalidation logic can tell
    // which items were deselected on this request.
    captureSelectionHistory(req) {
      const config = navigation.getNavigationConfig(
        req,
        this.options,
        navigationConfig
      );
      const selectionConfig = config.selection || {};
      const selectionField = selectionConfig.field;

      if (!selectionField) {
        return;
      }

      req.form.selectionHistoricalValues = {
        [selectionField]: req.sessionModel.get(selectionField)
      };
    }

    // Normalises an empty selector submission so validation errors do not restore stale selections.
    // HOF omits unchecked checkbox-group values entirely, so the absence of the field needs to be
    // treated as an explicit empty selection on the selector step.
    normaliseSelectionInput(req) {
      const config = navigation.getNavigationConfig(
        req,
        this.options,
        navigationConfig
      );
      const selectionConfig = config.selection || {};
      const selectionField = selectionConfig.field;

      if (
        req.form.options.route !== selectionConfig.selectorStep ||
        !selectionField ||
        Object.prototype.hasOwnProperty.call(req.form.values, selectionField)
      ) {
        return;
      }

      req.form.values[selectionField] = [];
    }

    hasMeaningfulValue(value) {
      if (Array.isArray(value)) {
        return value.some(item => this.hasMeaningfulValue(item));
      }

      if (value && typeof value === 'object') {
        return Object.keys(value).some(key => this.hasMeaningfulValue(value[key]));
      }

      return value !== '' && value !== null && typeof value !== 'undefined';
    }

    getCurrentSelectionItemKey(selectionConfig, route) {
      const items = selectionConfig.items || {};

      return Object.keys(items).find(itemKey => {
        const routes = [].concat(items[itemKey].routes || []).filter(Boolean);
        return routes.includes(route);
      });
    }

    syncSelectionForAnsweredRoute(req) {
      const config = navigation.getNavigationConfig(
        req,
        this.options,
        navigationConfig
      );
      const selectionConfig = config.selection || {};
      const selectionField = selectionConfig.field;
      const route = req.form.options.route;
      const steps = this.options.steps || req.form.options.steps || {};
      const stepConfig = steps[route] || {};
      const currentItemKey = this.getCurrentSelectionItemKey(selectionConfig, route);

      if (
        !selectionField ||
        !currentItemKey ||
        route === selectionConfig.selectorStep ||
        route === selectionConfig.summaryStep
      ) {
        return;
      }

      const selectedItems = [].concat(req.sessionModel.get(selectionField) || []).filter(Boolean);

      if (selectedItems.includes(currentItemKey)) {
        return;
      }

      const hasAnsweredField = [].concat(stepConfig.fields || []).some(field => {
        return this.hasMeaningfulValue(req.sessionModel.get(field));
      });

      if (hasAnsweredField) {
        req.sessionModel.set(selectionField, selectedItems.concat(currentItemKey));
      }
    }

    process(req, res, next) {
      this.captureSelectionHistory(req);
      return super.process(req, res, next);
    }

    // Reads the reusable navigation resolver output for the current step.
    getConfiguredNext(req, res) {
      return navigation.resolveNext(
        req.form.options.route,
        req,
        res,
        this,
        navigationConfig
      );
    }

    // Clears answers for routes that were skipped by the chosen branch before redirecting.
    invalidateSkippedSteps(req, res) {
      const skippedSteps = navigation.resolveInvalidatedSteps(
        req.form.options.route,
        req,
        res,
        this,
        navigationConfig
      );
      const steps = this.options.steps || req.form.options.steps || {};
      let completedSteps = req.sessionModel.get('steps') || [];

      skippedSteps.forEach(step => {
        const stepConfig = steps[step] || {};

        req.sessionModel.unset(stepConfig.fields || []);
        completedSteps = completedSteps.filter(
          completedStep => completedStep !== step
        );
      });

      req.sessionModel.set('steps', completedSteps);
    }

    // Converts app-relative steps into URLs that work under the mounted baseUrl.
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

    // Checks HOF's recorded completed steps so edit mode can avoid revisiting completed pages.
    isCompleted(target, req) {
      let step = target;

      if (req.baseUrl !== '/') {
        const baseUrlPattern = new RegExp('^' + req.baseUrl);
        step = step.replace(baseUrlPattern, '');
      }

      return req.sessionModel.get('steps').includes(step);
    }

    // Converts a full URL back to the relative step format expected by HOF backlink handling.
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

    // Overrides backlink resolution so selection-driven pages can navigate backwards correctly.
    getBackLink(req, res) {
      // If the step has an explicitly configured backLink, use it as normal.
      // Otherwise consult the resolver for a backlink based on the current selection state.
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

    validate(req, res, next) {
      this.normaliseSelectionInput(req);
      return super.validate(req, res, next);
    }

    // Overrides next-step resolution while preserving HOF edit-flow conventions.
    // The resolver decides the target route, and this method adapts that decision to mounted baseUrl
    // handling plus HOF's `/edit` and confirm-page behaviour.
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
      this.syncSelectionForAnsweredRoute(req);
      this.invalidateSkippedSteps(req, res);
      return super.successHandler(req, res);
    }
  };
