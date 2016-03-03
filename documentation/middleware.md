# Middleware

HOF exports a middleware as `middleware`, a small collection of routes and middlewares. Currently the middleware only adds support for enforcing that a cookie is set and if not redirecting to a /cookies-required page.

## Usage

```js
app.use(require('hof').middleware({
  'cookie-name': 'my-application-cookie'
}));
```

This middleware must be declared before your other routes.

When this middleware is used it will add one new route that you will need to create a template for:

 * /cookies-required
