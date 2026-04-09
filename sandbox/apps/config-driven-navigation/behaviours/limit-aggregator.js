'use strict';

/**
  * Adds aggregate limit state to the view locals for aggregate summary pages.
  * Exposes noMoreItems when the user has reached the maximum number of items,
  * and maxItems as the configured maximum.
 */
module.exports = superclass =>
  class extends superclass {
    locals(req, res) {
      const locals = super.locals(req, res);
      const limit = req.form.options.aggregateLimit;
      const aggregate = req.sessionModel.get(req.form.options.aggregateTo);
      const items = aggregate?.aggregatedValues;

      if (items) {
        locals.noMoreItems = items.length >= limit;
        locals.maxItems = limit;
      }

      return locals;
    }
  };
