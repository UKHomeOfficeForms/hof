'use strict';

const path = require('path');
const _ = require('lodash');
const helpers = require('../util/helpers');

module.exports = (route, controller, steps) => {
  const previousSteps = helpers.getRouteSteps(route, steps);

  const checkReferrer = (referrer, baseUrl) => {
    const referrerPath = new URL(referrer).pathname;
    const matchingPath = controller.options.backLinks.find(link => {
      if (link.match(/^\//)) {
        return path.normalize(link) === referrerPath;
      } else if (path.relative(baseUrl, referrerPath)) {
        return path.normalize(link) === path.relative(baseUrl, referrerPath);
      } else if (referrerPath.replace(/^\//, '') === link.replace(/^\.*\//, '')) {
        return path.normalize(link);
      }
      return undefined;
    });
    if (typeof matchingPath === 'string') {
      return path.normalize(matchingPath);
    }
    return undefined;
  };

  const checkFormHistory = sessionData => {
    const prev = _(sessionData)
      .pickBy((value, key) => key.indexOf('hof-wizard') > -1)
      .map('steps')
      .flatten()
      .uniq()
      .value();

    const allowedLinks = controller.options.backLinks.map(item =>
      item.replace('\.', '')
    );

    const backLinks = _.intersection(prev, allowedLinks);

    return backLinks.length ? _.last(backLinks).replace(/^\//, '') : undefined;
  };

  const getBackLink = req => {
    const previous = _.intersection(req.sessionModel.get('steps'), previousSteps);
    let backLink;

    if (typeof controller.options.backLink !== 'undefined') {
      return controller.options.backLink;
    } else if (previous.length) {
      backLink = req.baseUrl === '/' ? _.last(previous) : _.last(previous).replace(/^\//, '');
    } else if (controller.options.backLinks && req.get('referrer')) {
      backLink = checkReferrer(req.get('referrer'), req.baseUrl) || checkFormHistory(req.session);
    }

    return backLink;
  };

  return (req, res, next) => {
    if (req.method === 'GET') {
      const last = _.last(req.sessionModel.get('steps'));
      req.isBackLink = (last === route || last === controller.options.next);
      res.locals.backLink = getBackLink(req);
    }
    next();
  };
};
