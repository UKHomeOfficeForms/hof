# Interface

## `start` Function(options)

 * Creates and starts the server listening for connections.
 * `@param {Object}` options (`port, host, protocol`)
 * `@return {Promise.<bootstrap|Error>}` a promise that returns bootstrap interface object if resolved, Error if rejected.

Convenient if starting was deferred during the initial invocation of `HOF-bootstrap` with the option and value `start: false` or the server has been stopped. Returns a promise which resolves to the `bootstrap` interface object.

## `stop` Function(callback)

 * Closes the server, stops listening for connections
 * `@param {Function}` callback. Useful for testing
 * `@return {Promise.<bootstrap|Error>}` a promise that returns bootstrap interface object if resolved, Error if rejected.

## `use` Function(middleware)

 * Alias for Express's `app.use`.`
 * `@param {Function}` middleware.
 * `@return {Object} bootstrap` interface object.

The use function can only be used if bootstrap is called with `{ start: false }` passed in config, `bootstrap.start()` will need to be called afterwards to start the app. This is due to the significance of the order in which middleware are applied. Alternatively an array of middleware functions can be passed in config.

## `server`

 * Instance of an `http`/`https` server bound to the `app`
 * `@type {Object}
