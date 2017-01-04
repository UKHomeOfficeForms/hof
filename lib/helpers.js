'use strict';

const fs = require('fs');
const path = require('path');

module.exports = class Helpers {

  static getRouteFields(config) {
    let routeFields = config.route.fields && path.resolve(config.caller, config.route.fields);
    if (!routeFields) {
      routeFields = config.route.name && path.resolve(config.caller, `apps/${config.route.name}/fields.js`);
    }
    return routeFields;
  }

  static getPaths(config) {
    return {
      fields: {
        base: config.fields && path.resolve(config.caller, config.fields),
        route: this.getRouteFields(config)
      },
      views: {
        base: config.views && path.resolve(config.caller, config.views),
        route: config.route.views && path.resolve(config.caller, config.route.views)
      },
      translations: path.resolve(config.caller, config.route.translations || config.translations)
    };
  }

  static getFields(pathFields) {
    let routeFields;
    let fields;

    if (pathFields.base) {
      try {
        fields = require(pathFields.base);
      } catch (err) {
        throw new Error(`Cannot find fields at ${pathFields.base}`);
      }
    }
    if (pathFields.route) {
      try {
        routeFields = require(pathFields.route);
      } catch (err) {
        throw new Error(`Cannot find route fields at ${pathFields.route}`);
      }
    }

    if (!fields && !routeFields) {
      throw new Error('Set base fields or route fields or both');
    }

    return Object.assign({}, fields, routeFields);
  }

  static getViews(pathViews) {
    let views = [];

    if (pathViews.base) {
      try {
        fs.accessSync(pathViews.base);
        views.unshift(pathViews.base);
      } catch (err) {
        throw new Error(`Cannot find views at ${pathViews.base}`);
      }
    }

    if (pathViews.route) {
      try {
        fs.accessSync(pathViews.route);
        views.unshift(pathViews.route);
      } catch (err) {
        throw new Error(`Cannot find route views at ${pathViews.route}`);
      }
    }

    return views;
  }

};
