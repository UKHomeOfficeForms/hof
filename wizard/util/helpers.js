'use strict';

const _ = require('lodash');

module.exports = {
  getRouteSteps(route, steps) {
    return _.reduce(steps, (list, step, path) => {
      const isNext = step.next === route;
      const targets = _.map((step.forks || []), 'target');

      const isFork = targets.some(fork => fork === route);

      if (isNext || isFork) {
        list.push(path);
      }
      return list;
    }, []);
  }
};
