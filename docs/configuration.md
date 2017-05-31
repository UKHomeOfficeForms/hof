# Configuration

HOF-bootstrap accepts the following options so a developer can customise elements of the service including which port to bind to, which controller is used to process requests, whether to use a Content Security Policy and the name of the session.

The default value of any option can be overriden or extended in a developers own implementation, and many can be set as [environment variables](#environment variables).

## Options

- `root`: The path to the project root directory.
  - App paths will be relative to this directory.
  - Defaults to the current working directory.
- `views`: Location of the common views relative to the root of your project.
  - Will not error if it can't find any views in the root of your project.
  - Looks for views - optionally set in your [route options](#route-options).
  - Always loads views from [hof-template-partials.views](https://github.com/UKHomeOfficeForms/hof-template-partials/tree/master/views).
  - Views extend like so, where route-views are the most specific: `hof-template-partials -> your-common-views -> your-route-views`.
- `fields`: Location of the common fields relative to the root of your project.
  - Does not error if not set, as long as `fields` are set for the route.
  - [Route level `fields`](#route-options) will override common `fields`.
- `translations`: Location of the common translations relative to the root of your project. Defaults to `./translations`.
- `middleware`: An optional array of middleware functions to add to the application middleware pipeline.
- `behaviours`: An optional array of behaviours to be applied to the base controller for all steps. These are applied before any additional step behaviours.
- `appConfig`: Allows you to attach a configuration object to each controllers' options argument. Useful if you need to access properties of your applications config settings in other parts of your code base, e.g:
- `baseController[DEPRECATED]`: The base controller for all routes and steps. Defaults to [hof-form-controller](https://github.com/UKHomeOfficeForms/hof-controller).

```javascript
...
constructor(options) {
  this.emailSettings = options.appConfig.emailSettings;
}
...
```
- `csp` (We use [Helmetjs/csp](https://github.com/helmetjs/csp) middleware)
  - `true` by default, enables Content Security Policy middleware.
  - `false` set with custom config or with `process.env.DISABLE_CSP`, disables Content Security Policy middleware.
  - CSP formatted object enables Content Security Policy middleware and extends default CSP directives with your own.
  - If `gaTagId` is set, the CSP directives are auto-amended to include www.google-analytics.com as a source for js and images.

- `viewEngine`: Name of the express viewEngine. Defaults to 'html'.
- `start`: Start the server listening when the bootstrap function is called. Defaults to `true`.
- `getCookies`: Load 'cookies' view at `GET /cookies`.
- `getTerms`: Load 'terms' view at `GET /terms-and-conditions`.
- `sessionStore`: Provide a sessionStore to be used in place of redis. Suggest using [express-session.MemoryStore](https://github.com/expressjs/session/blob/master/session/memory.js) for development and acceptance testing.
- `port`: Defaults to 8080.
- `host`: Defaults to '0.0.0.0'.
- `protocol`: Defaults to 'http'.
- `env`: Can be used to switch contexts. Defaults to 'development'.
- `gaTagId`: Google analytics tag.
- `loglevel`: Defaults to `info`. Logger is bound to the request object, accessible on every request.
- `redis.port`: Defaults to '6379'.
- `redis.host`: Defaults '127.0.0.1'.
- `session.ttl`: The session timeout in milliseconds. Defaults to `1800` (ms).
- `session.secret`: The session secret. Set this to something unique.
- `session.name`: The session name. Set this to something unique.

## Global configuration

Any of the configuration parameters can be set globally for all bootstrap instances by calling `bootstrap.configure`. This is mostly relevant for running unit tests which will create a large number of bootstrap instances.

```javascript
const bootstrap = require('hof-bootstrap');
// set the project root to a custom location for all bootstrap instances
boostrap.configure('root', path.resolve(__dirname, '..'));
```

## Environent variables

- `PORT`
- `HOST`
- `PROTOCOL`
- `ENV`
- `GA_TAG`
- `LOG_LEVEL`
- `REDIS_HOST`
- `REDIS_PORT`
- `SESSION_TTL`
- `SESSION_SECRET`
- `SESSION_NAME`
