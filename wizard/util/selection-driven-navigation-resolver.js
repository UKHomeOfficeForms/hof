'use strict';

const _ = require('lodash');

// Central decision engine for selection-driven journeys.
//
// The component behaviour calls into this file to answer three questions:
// - what route should come next
// - what back link should be shown
// - which routes became invalid and should have their stored answers cleared
//
// Services provide the journey shape through `journeyNavigation` config; this
// file turns that declarative config into concrete routing decisions.

// Loads the navigation map either directly or from app-level HOF config.
const getNavigationConfig = (req, controllerOptions, navigationConfig) => {
  if (typeof navigationConfig === 'function') {
    return navigationConfig(req, controllerOptions) || {};
  }

  return (
    navigationConfig ||
    _.get(controllerOptions, 'appConfig.journeyNavigation') ||
    {}
  );
};

const getRouteConfig = (route, config) =>
  _.get(config, ['routes', route]) || {};

// Pulls out the selection-driven part of the config for item-based journeys.
const getSelectionConfig = config => config.selection || {};

const getAddMoreConfig = selectionConfig => {
  if (!selectionConfig.addMore) {
    return null;
  }

  const selectionField = selectionConfig.field;
  const addMoreConfig = selectionConfig.addMore;

  return {
    modeField: addMoreConfig.modeField || `${selectionField}-add-more-mode`,
    baselineField:
      addMoreConfig.baselineField || `${selectionField}-add-more-baseline`,
    activeItemsField:
      addMoreConfig.activeItemsField || `${selectionField}-active-items`,
    noChangeTarget:
      addMoreConfig.noChangeTarget || selectionConfig.summaryStep
  };
};

// Resolves a static target or executes a target function lazily at runtime.
const resolveTarget = (target, req, res, controller) => {
  if (typeof target === 'function') {
    return target(req, res, controller);
  }

  return target;
};

// Reads a field value from the configured source, defaulting to submitted form then session.
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

// Normalises scalars and arrays so later selection logic can treat values consistently.
const toArray = value => {
  if (_.isNil(value)) {
    return [];
  }

  return Array.isArray(value) ? value.filter(Boolean) : [value];
};

// Evaluates the supported declarative condition syntax used by route branches and item rules.
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

    if (Array.isArray(condition.value)) {
      return condition.value.includes(actualValue);
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

// Finds the first matching branch so route config can behave like an ordered decision tree.
const getMatchingBranch = (branches, req, res) => {
  return _.castArray(branches).find(
    branch => branch && isConditionSatisfied(branch.condition, req, res)
  );
};

// Applies any per-item availability rule before the item participates in ordering or selection.
const isItemEnabled = (itemConfig, req, res) => {
  if (!itemConfig) {
    return false;
  }

  return isConditionSatisfied(itemConfig.when, req, res);
};

// Builds the canonical item order used by both next-step and back-link resolution.
const getOrderedItems = (itemsConfig, req, res) => {
  return Object.keys(itemsConfig || {})
    .filter(itemKey => isItemEnabled(itemsConfig[itemKey], req, res))
    .sort((leftKey, rightKey) => {
      const leftOrder = itemsConfig[leftKey].order ?? Number.MAX_SAFE_INTEGER;
      const rightOrder = itemsConfig[rightKey].order ?? Number.MAX_SAFE_INTEGER;

      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }

      return leftKey.localeCompare(rightKey);
    });
};

// Returns the selected items, but only in the configured journey order.
const getSelectedItemKeys = (selectionConfig, req, res) => {
  const field = selectionConfig.field;
  const addMoreConfig = getAddMoreConfig(selectionConfig);

  if (!field) {
    return [];
  }

  const selectedValues = addMoreConfig && req.sessionModel.get(addMoreConfig.modeField)
    ? toArray(req.sessionModel.get(addMoreConfig.activeItemsField))
    : toArray(getFieldValue(field, req, selectionConfig));
  const orderedItems = getOrderedItems(selectionConfig.items || {}, req, res);

  return orderedItems.filter(itemKey => selectedValues.includes(itemKey));
};

// Resolves selected items from an arbitrary value source so current and historical selections can be compared.
const getSelectedItemKeysFromValues = (selectionConfig, values, req, res) => {
  const field = selectionConfig.field;

  if (!field) {
    return [];
  }

  const selectedValues = toArray(_.get(values, field));
  const orderedItems = getOrderedItems(selectionConfig.items || {}, req, res);

  return orderedItems.filter(itemKey => selectedValues.includes(itemKey));
};

const getItemRoutes = itemConfig =>
  _.castArray(itemConfig?.routes).filter(Boolean);

// Normalises a target route so journey calculations can compare raw step paths reliably.
const toComparableRoute = target => {
  if (typeof target !== 'string') {
    return target;
  }

  return target.split('?')[0].replace(/\/edit(?:\/.*)?$/, '');
};

// Flattens the currently selected items into the ordered journey route list.
const getSelectedJourneyRoutes = (selectionConfig, req, res) => {
  const itemsConfig = selectionConfig.items || {};

  return getSelectedItemKeys(selectionConfig, req, res).reduce(
    (routes, itemKey) => routes.concat(getItemRoutes(itemsConfig[itemKey])),
    []
  );
};

// Uses HOF's recorded step history so back links follow the pages actually visited.
const getVisitedJourneyRoutes = (selectionConfig, req, res) => {
  const allowedRoutes = [
    selectionConfig.selectorStep,
    selectionConfig.dispatcherStep,
    selectionConfig.summaryStep,
    ...getSelectedJourneyRoutes(selectionConfig, req, res)
  ].filter(Boolean);
  const visitedSteps = req.sessionModel.get('steps') || [];

  return visitedSteps.filter(
    (step, index) =>
      allowedRoutes.includes(step) && visitedSteps.indexOf(step) === index
  );
};

// Maps a route back to the selected item that owns it.
const getItemForRoute = (route, selectionConfig, req, res) => {
  const orderedItems = getOrderedItems(selectionConfig.items || {}, req, res);

  return orderedItems.find(itemKey =>
    getItemRoutes(selectionConfig.items[itemKey]).includes(route)
  );
};

// Resolves the next step within the current selected item, or advances to the next selected item.
const getNextSelectedRoute = (route, selectionConfig, req, res) => {
  const itemsConfig = selectionConfig.items || {};
  const selectedItemKeys = getSelectedItemKeys(selectionConfig, req, res);
  const addMoreConfig = getAddMoreConfig(selectionConfig);
  const isAddMoreMode = addMoreConfig && req.sessionModel.get(addMoreConfig.modeField);

  if (!selectedItemKeys.length) {
    if (isAddMoreMode) {
      return addMoreConfig.noChangeTarget;
    }

    return selectionConfig.emptySelectionTarget || selectionConfig.summaryStep;
  }

  if (
    route === selectionConfig.selectorStep ||
    route === selectionConfig.dispatcherStep
  ) {
    return (
      getItemRoutes(itemsConfig[selectedItemKeys[0]])[0] ||
      selectionConfig.summaryStep
    );
  }

  const currentItemKey = getItemForRoute(route, selectionConfig, req, res);

  if (!currentItemKey) {
    return null;
  }

  const currentItemRoutes = getItemRoutes(itemsConfig[currentItemKey]);
  const currentRouteIndex = currentItemRoutes.indexOf(route);

  if (
    currentRouteIndex > -1 &&
    currentRouteIndex < currentItemRoutes.length - 1
  ) {
    return currentItemRoutes[currentRouteIndex + 1];
  }

  const currentItemIndex = selectedItemKeys.indexOf(currentItemKey);
  const nextItemKey = selectedItemKeys[currentItemIndex + 1];

  if (nextItemKey) {
    return (
      getItemRoutes(itemsConfig[nextItemKey])[0] || selectionConfig.summaryStep
    );
  }

  return selectionConfig.summaryStep;
};

// Resolves the first route of the next selected item, skipping any remaining routes in the current item.
// This differs from getNextSelectedRoute, which prefers to finish the current item's route list first.
const getNextSelectedItemRoute = (route, selectionConfig, req, res) => {
  const itemsConfig = selectionConfig.items || {};
  const selectedItemKeys = getSelectedItemKeys(selectionConfig, req, res);
  const currentItemKey = getItemForRoute(route, selectionConfig, req, res);

  if (!currentItemKey) {
    return selectionConfig.summaryStep;
  }

  const currentItemIndex = selectedItemKeys.indexOf(currentItemKey);
  const nextItemKey = selectedItemKeys[currentItemIndex + 1];

  if (nextItemKey) {
    return (
      getItemRoutes(itemsConfig[nextItemKey])[0] || selectionConfig.summaryStep
    );
  }

  return selectionConfig.summaryStep;
};

// Identifies which later routes in the current item were skipped by a branch decision.
const getSkippedSelectionRoutes = (
  route,
  nextRoute,
  selectionConfig,
  req,
  res
) => {
  const itemsConfig = selectionConfig.items || {};
  const currentItemKey = getItemForRoute(route, selectionConfig, req, res);

  if (!currentItemKey) {
    return [];
  }

  const currentItemRoutes = getItemRoutes(itemsConfig[currentItemKey]);
  const currentRouteIndex = currentItemRoutes.indexOf(route);

  if (currentRouteIndex === -1) {
    return [];
  }

  const comparableNextRoute = toComparableRoute(nextRoute);
  const nextRouteIndex = currentItemRoutes.indexOf(comparableNextRoute);

  if (nextRouteIndex > currentRouteIndex + 1) {
    return currentItemRoutes.slice(currentRouteIndex + 1, nextRouteIndex);
  }

  if (nextRouteIndex === -1) {
    return currentItemRoutes.slice(currentRouteIndex + 1);
  }

  return [];
};

// Identifies routes belonging to items removed on the selector page so their answers can be cleared.
const getDeselectedSelectionRoutes = (route, selectionConfig, req, res) => {
  if (route !== selectionConfig.selectorStep) {
    return [];
  }

  const itemsConfig = selectionConfig.items || {};
  const historicalValues = Object.assign(
    {},
    req.form.historicalValues || {},
    req.form.selectionHistoricalValues || {}
  );
  const currentValues = req.form.values || {};
  const previousSelectedItems = getSelectedItemKeysFromValues(
    selectionConfig,
    historicalValues,
    req,
    res
  );
  const currentSelectedItems = getSelectedItemKeysFromValues(
    selectionConfig,
    currentValues,
    req,
    res
  );

  return previousSelectedItems
    .filter(itemKey => !currentSelectedItems.includes(itemKey))
    .reduce(
      (routes, itemKey) => routes.concat(getItemRoutes(itemsConfig[itemKey])),
      []
    );
};

// Interprets symbolic config targets so services can express navigation intent declaratively.
const resolveSpecialTarget = (target, route, selectionConfig, req, res) => {
  if (target === 'next-selected-item') {
    return getNextSelectedItemRoute(route, selectionConfig, req, res);
  }

  return target;
};

// Mirrors the forward selection flow so backlinks follow the selected journey order.
const getPreviousSelectedRoute = (route, selectionConfig, req, res) => {
  const visitedRoutes = getVisitedJourneyRoutes(selectionConfig, req, res);
  const itemsConfig = selectionConfig.items || {};
  const selectedItemKeys = getSelectedItemKeys(selectionConfig, req, res);

  if (route === selectionConfig.selectorStep) {
    return false;
  }

  if (!selectedItemKeys.length) {
    return selectionConfig.selectorStep || false;
  }

  if (route === selectionConfig.summaryStep) {
    const previousVisitedRoutes = visitedRoutes.filter(
      visitedRoute => visitedRoute !== selectionConfig.summaryStep
    );

    if (previousVisitedRoutes.length) {
      return _.last(previousVisitedRoutes) || selectionConfig.selectorStep || false;
    }

    const lastSelectedItemKey = selectedItemKeys[selectedItemKeys.length - 1];
    const lastSelectedRoutes = getItemRoutes(itemsConfig[lastSelectedItemKey]);

    return (
      lastSelectedRoutes[lastSelectedRoutes.length - 1] ||
      selectionConfig.selectorStep ||
      false
    );
  }

  if (route === selectionConfig.dispatcherStep) {
    return selectionConfig.selectorStep || false;
  }

  const currentVisitedIndex = visitedRoutes.lastIndexOf(route);

  if (currentVisitedIndex > 0) {
    return visitedRoutes[currentVisitedIndex - 1];
  }

  if (currentVisitedIndex === -1 && visitedRoutes.length) {
    const previousVisitedRoutes = visitedRoutes.filter(
      visitedRoute => visitedRoute !== selectionConfig.summaryStep
    );

    return _.last(previousVisitedRoutes) || selectionConfig.selectorStep || false;
  }

  const currentItemKey = getItemForRoute(route, selectionConfig, req, res);

  if (!currentItemKey) {
    return null;
  }

  const currentItemRoutes = getItemRoutes(itemsConfig[currentItemKey]);
  const currentRouteIndex = currentItemRoutes.indexOf(route);

  if (currentRouteIndex > 0) {
    return currentItemRoutes[currentRouteIndex - 1];
  }

  const currentItemIndex = selectedItemKeys.indexOf(currentItemKey);

  if (currentItemIndex > 0) {
    const previousItemKey = selectedItemKeys[currentItemIndex - 1];
    const previousItemRoutes = getItemRoutes(itemsConfig[previousItemKey]);

    return (
      previousItemRoutes[previousItemRoutes.length - 1] ||
      selectionConfig.selectorStep ||
      false
    );
  }

  return selectionConfig.selectorStep || false;
};

// Recursively resolves nested branch/default route definitions down to the final active rule.
// Later logic works with this flattened definition rather than having to re-evaluate branches.
const resolveRouteDefinition = (definition, req, res) => {
  const matchedBranch = getMatchingBranch(definition.branches, req, res);

  if (matchedBranch) {
    const resolvedBranch = resolveRouteDefinition(matchedBranch, req, res);

    return Object.assign({}, definition, matchedBranch, resolvedBranch, {
      matchedBranch
    });
  }

  if (definition.default) {
    const resolvedDefault = resolveRouteDefinition(
      definition.default,
      req,
      res
    );

    return Object.assign({}, definition, resolvedDefault, {
      matchedBranch: null
    });
  }

  return Object.assign({}, definition, {
    matchedBranch: null
  });
};

// Produces the final next-step decision by combining explicit route rules with selection-driven flow.
const resolveNext = (route, req, res, controller, navigationConfig) => {
  const config = getNavigationConfig(req, controller.options, navigationConfig);
  const routeConfig = getRouteConfig(route, config);
  const selectionConfig = getSelectionConfig(config);
  const resolvedConfig = resolveRouteDefinition(routeConfig, req, res);
  const selectionNext = getNextSelectedRoute(route, selectionConfig, req, res);
  const configuredNext = resolveSpecialTarget(
    resolveTarget(resolvedConfig.next, req, res, controller),
    route,
    selectionConfig,
    req,
    res
  );

  return {
    next: configuredNext || selectionNext,
    continueOnEdit: Boolean(resolvedConfig.continueOnEdit),
    backLink: resolveTarget(resolvedConfig.backLink, req, res, controller),
    routeConfig,
    matchedBranch: resolvedConfig.matchedBranch,
    selectionNext
  };
};

// Returns the steps whose stored answers should be cleared because the chosen branch skipped them.
// Invalidation can come from either branch skipping within the current item or selector changes
// that removed an item entirely.
const resolveInvalidatedSteps = (
  route,
  req,
  res,
  controller,
  navigationConfig
) => {
  const config = getNavigationConfig(req, controller.options, navigationConfig);
  const selectionConfig = getSelectionConfig(config);
  const resolvedNext = resolveNext(
    route,
    req,
    res,
    controller,
    navigationConfig
  );

  return _.uniq(
    getSkippedSelectionRoutes(
      route,
      resolvedNext.next,
      selectionConfig,
      req,
      res
    ).concat(getDeselectedSelectionRoutes(route, selectionConfig, req, res))
  );
};

// Produces the effective backlink, preferring explicit config and then falling back to journey order.
const resolveBackLink = (route, req, res, controller, navigationConfig) => {
  const config = getNavigationConfig(req, controller.options, navigationConfig);
  const routeConfig = getRouteConfig(route, config);
  const selectionConfig = getSelectionConfig(config);
  const resolvedConfig = resolveRouteDefinition(routeConfig, req, res);

  if (Object.prototype.hasOwnProperty.call(resolvedConfig, 'backLink')) {
    return resolveTarget(resolvedConfig.backLink, req, res, controller);
  }

  return getPreviousSelectedRoute(route, selectionConfig, req, res);
};

module.exports = {
  getNavigationConfig,
  getRouteConfig,
  isConditionSatisfied,
  getSelectedItemKeys,
  resolveBackLink,
  resolveInvalidatedSteps,
  resolveNext
};
