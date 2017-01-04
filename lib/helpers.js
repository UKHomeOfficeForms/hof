'use strict';

const fs = require('fs');
const path = require('path');

const getPath = (config, part) => {
  let result = config.route[part] && path.resolve(config.caller, config.route[part]);
  if (!result) {
    result = config.route.name && path.resolve(config.caller, `apps/${config.route.name}/${part}`);
  }
  return result;
};

module.exports = class Helpers {
  static getPaths(config) {
    return {
      fields: {
        base: config.fields && path.resolve(config.caller, config.fields),
        route: getPath(config, 'fields')
      },
      views: getPath(config, 'views'),
      translations: getPath(config, 'translations')
    };
  }

  static getViews(views) {
    if (views) {
      try {
        fs.accessSync(views);
      } catch (err) {
        throw new Error(`Cannot find route views at ${views}`);
      }
    }
    return views;
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
};
