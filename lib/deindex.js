'use strict';

module.exports = (app, config) => {
  // Ensure the value of deIndex is evaluated as a boolean regardless of if single quotes are used
  // to have the expected conditional behaviour in the Mustache template
  const deIndex = (config.deIndexForm === 'true' || config.deIndexForm === true);

  app.use((req, res, next) => {
    // Preparing common res.locals properties
    const properties = {
      deIndex: deIndex
    };
    res.locals = Object.assign(res.locals, properties);
    next();
  });

  return app;
};
