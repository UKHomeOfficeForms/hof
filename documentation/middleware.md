# Middleware

HOF exports a middleware as `middleware`. Currently the middleware only
adds support for testing whether cookies are supported in the client and
raising an error when they are not.

## Usage

```js
app.use(require('hof').middleware({
  'cookie-name': 'my-application-cookie',
  'param-name': 'my-query-param'
}));
```

This middleware must be declared before your other routes.

The `cookie-name` can be the same as your session cookie. (The
middleware will not overwrite it.) Defaults to `hof-cookie-check`.

The `param-name` should be chosen so that it does not clash with names
you are using elsewhere. In almost all cases the default value of
`hof-cookie-check` will suffice.

The error raised when cookies are not supported by the client can then
be handled in you error handler by identifying it using its `code`
property which will be set to `NO_COOKIES`. An example of handling this error can be found in the [hof-example-form](https://github.com/UKHomeOffice/hof-example-form/blob/master/errors/index.js).

