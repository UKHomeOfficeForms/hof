'use strict';

const _ = require('lodash');

const getNavigationConfig = (req, controllerOptions, navigationConfig) => {
  if (typeof navigationConfig === 'function') {
    return navigationConfig(req, controllerOptions) || {};
  }

  return (
    navigationConfig ||
    _.get(controllerOptions, ['appConfig', 'taskNavigation']) ||
    {}
  );
};

const getRouteConfig = (route, config) =>
  _.get(config, ['routes', route]) || {};

const getTaskSelectionConfig = config => config.taskSelection || {};

const resolveTarget = (target, req, res, controller) => {
  if (typeof target === 'function') {
    return target(req, res, controller);
  }

  return target;
};

const getFieldValue = (field, req, condition = {}) => {
  if (condition.source === 'body') {
    return _.get(req, ['body', field]);
  }

  if (condition.source === 'session') {
    return req.sessionModel.get(field);
  }

  if (condition.source === 'query') {
    return _.get(req, ['query', field]);
  }

  const submittedValue = _.get(req, ['form', 'values', field]);

  return typeof submittedValue === 'undefined'
    ? req.sessionModel.get(field)
    : submittedValue;
};

const isConditionSatisfied = (condition, req, res) => {
  if (!condition) {
    return true;
  }

  if (typeof condition === 'function') {
    return condition(req, res);
  }

  if (Array.isArray(condition.all)) {
    return condition.all.every(item => isConditionSatisfied(item, req, res));
  }

  if (Array.isArray(condition.any)) {
    return condition.any.some(item => isConditionSatisfied(item, req, res));
  }

  if (condition.not) {
    return !isConditionSatisfied(condition.not, req, res);
  }

  if (condition.field) {
    const actualValue = getFieldValue(condition.field, req, condition);

    if (typeof condition.exists === 'boolean') {
      const exists = !_.isNil(actualValue) && actualValue !== '';
      return exists === condition.exists;
    }

    if (Array.isArray(condition.in)) {
      return condition.in.includes(actualValue);
    }

    if (Array.isArray(condition.notIn)) {
      return !condition.notIn.includes(actualValue);
    }

    if (Object.prototype.hasOwnProperty.call(condition, 'value')) {
      return actualValue === condition.value;
    }

    if (Object.prototype.hasOwnProperty.call(condition, 'equals')) {
      return actualValue === condition.equals;
    }

    if (Object.prototype.hasOwnProperty.call(condition, 'notEquals')) {
      return actualValue !== condition.notEquals;
    }

    return Boolean(actualValue);
  }

  return false;
};

const getMatchingBranch = (branches, req, res) => {
  return _.castArray(branches).find(
    branch => branch && isConditionSatisfied(branch.condition, req, res)
  );
};

const isTaskEnabled = (taskConfig, req, res) => {
  if (!taskConfig) {
    return false;
  }

  return isConditionSatisfied(taskConfig.when, req, res);
};

const getOrderedTaskKeys = (tasksConfig, req, res) => {
  return Object.keys(tasksConfig || {})
    .filter(taskKey => isTaskEnabled(tasksConfig[taskKey], req, res))
    .sort((leftKey, rightKey) => {
      const leftOrder = tasksConfig[leftKey].order ?? Number.MAX_SAFE_INTEGER;
      const rightOrder = tasksConfig[rightKey].order ?? Number.MAX_SAFE_INTEGER;

      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }

      return leftKey.localeCompare(rightKey);
    });
};

const getSelectedTaskKey = (taskSelectionConfig, req, res) => {
  const selectionField = taskSelectionConfig.field;

  if (!selectionField) {
    return null;
  }

  const selectedTask = getFieldValue(selectionField, req, taskSelectionConfig);
  const orderedTaskKeys = getOrderedTaskKeys(taskSelectionConfig.tasks || {}, req, res);

  return orderedTaskKeys.includes(selectedTask) ? selectedTask : null;
};

const getTaskRoutes = taskConfig => {
  return _.uniq(
    [taskConfig.entryStep, taskConfig.summaryStep]
      .concat(_.castArray(taskConfig.routes || []))
      .filter(Boolean)
  );
};

const getCurrentTaskKey = (route, taskSelectionConfig, req, res) => {
  const tasksConfig = taskSelectionConfig.tasks || {};

  return getOrderedTaskKeys(tasksConfig, req, res)
    .find(taskKey => getTaskRoutes(tasksConfig[taskKey]).includes(route));
};

const resolveSpecialTarget = (target, route, taskSelectionConfig, req, res) => {
  const tasksConfig = taskSelectionConfig.tasks || {};
  const selectedTaskKey = getSelectedTaskKey(taskSelectionConfig, req, res);
  const selectedTask = selectedTaskKey && tasksConfig[selectedTaskKey];

  if (target === 'selected-task-entry') {
    return (selectedTask && selectedTask.entryStep) || taskSelectionConfig.selectorStep;
  }

  if (target === 'selected-task-summary') {
    return (selectedTask && selectedTask.summaryStep) || taskSelectionConfig.finalSummaryStep;
  }

  if (target === 'task-selector') {
    return taskSelectionConfig.selectorStep;
  }

  if (target === 'final-summary') {
    return taskSelectionConfig.finalSummaryStep;
  }

  return target;
};

const resolveRouteDefinition = (definition, req, res) => {
  const matchedBranch = getMatchingBranch(definition.branches, req, res);

  if (matchedBranch) {
    const resolvedBranch = resolveRouteDefinition(matchedBranch, req, res);

    return Object.assign({}, definition, matchedBranch, resolvedBranch, {
      matchedBranch
    });
  }

  if (definition.default) {
    const resolvedDefault = resolveRouteDefinition(definition.default, req, res);

    return Object.assign({}, definition, resolvedDefault, {
      matchedBranch: null
    });
  }

  return Object.assign({}, definition, {
    matchedBranch: null
  });
};

const resolveNext = (route, req, res, controller, navigationConfig) => {
  const config = getNavigationConfig(req, controller.options, navigationConfig);
  const routeConfig = getRouteConfig(route, config);
  const taskSelectionConfig = getTaskSelectionConfig(config);
  const resolvedConfig = resolveRouteDefinition(routeConfig, req, res);
  const configuredNext = resolveSpecialTarget(
    resolveTarget(resolvedConfig.next, req, res, controller),
    route,
    taskSelectionConfig,
    req,
    res
  );

  return {
    next: configuredNext || null,
    continueOnEdit: Boolean(resolvedConfig.continueOnEdit),
    backLink: resolveTarget(resolvedConfig.backLink, req, res, controller),
    routeConfig,
    matchedBranch: resolvedConfig.matchedBranch
  };
};

const resolveBackLink = (route, req, res, controller, navigationConfig) => {
  const config = getNavigationConfig(req, controller.options, navigationConfig);
  const routeConfig = getRouteConfig(route, config);
  const resolvedConfig = resolveRouteDefinition(routeConfig, req, res);

  if (Object.prototype.hasOwnProperty.call(resolvedConfig, 'backLink')) {
    return resolveTarget(resolvedConfig.backLink, req, res, controller);
  }

  return undefined;
};

module.exports = {
  getNavigationConfig,
  getSelectedTaskKey,
  getCurrentTaskKey,
  isConditionSatisfied,
  resolveBackLink,
  resolveNext
};
