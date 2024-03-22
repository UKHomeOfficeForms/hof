'use strict';

module.exports = (app, config) => {
  const deIndex = config.deIndexForm;
  console.log("DEINDEX VALUE: " + deIndex);

  app.use((req, res, next) => {

    // Preparing common res.locals properties
    const properties = {
      deIndex: deIndex
    };
    res.locals = Object.assign(res.locals, properties);
    next();
  });

  return app;
}
