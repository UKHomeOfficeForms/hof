# HOF (Home Office Forms) Bootstrap [![Build Status](https://travis-ci.org/UKHomeOfficeForms/hof-bootstrap.svg?branch=master)](https://travis-ci.org/UKHomeOfficeForms/hof-bootstrap) [![npm version](https://badge.fury.io/js/hof-bootstrap.svg)](https://badge.fury.io/js/HOF-bootstrap)

HOF-bootstrap is a wrapper function for HOF. It takes the hard work out of setting up your HOF service by encapsulating much of the boilerplate code in a single function. The bootstrap function takes many custom settings and options, but essentially maps your steps to Express routes and (optionally) starts the Express server.

- [Getting started](#getting-started)
  - [From HOF to HOF-Bootstrap](#from-hof-to-hof-bootstrap)
  - [Starting from Scratch](#starting-from-scratch)
    - [Default configuration](#default-configuration)
      - [Typical project layout](#typical-project-layout)
      - [Calling the bootstrap function](#calling-the-bootstrap-function)
- [Interface](#interface)
  - [start](#start)
  - [stop](#stop)
  - [use](#use)
  - [server](#server)
- [Custom configuration](#custom-configuration)
  - [Options](#options)
  - [Environment variables](#environment-variables)
- [Routes](#routes)
- [Resources](#resources)
- [Example form](./example)

## Getting started

`cd` into your project and install HOF-bootstrap.
```
$ npm install --save hof-bootstrap
```

### From HOF to HOF-bootstrap
If you are familiar with HOF, the process of moving to HOF-bootstrap should be straightforward. The entry point of your app, will contain the boilerplate code that configures the apps' settings, routes, middleware, session storage and probably starts the server listening for connections.
You can safely remove the boilerplate code and replace it with the bootstrap function. The following example invokes `bootstrap` with [routes](#routes). The custom configuration is used to tell HOF-bootstrap where to look for resources such as the views or controllers, or what session store to use.

HOF-bootstrap includes all the same dependencies that HOF contains, so you can remove the HOF dependency from `package.json` and `npm uninstall --save hof`.

The following is a contrived example, but is not dissimilar to a real configuration. In reality, you might want to [customise more of the settings](#options).

If you want to a more in depth introduction, read [Starting from scratch](#starting-from-scratch).
```
const bootstrap = require('hof-bootstrap');
const routes = require(/* path_to_routes */);

boostrap({
  /* ... custom configuration ... */,
  routes: routes
});
```

### Starting from scratch
If this is your first time using HOF or HOF-bootstrap, the process is not too different from simply updating from HOF to HOF-bootstrap, but you might want to consider how you organise your project.

#### Default configuration

HOF-bootstrap does not dictate how you structure your project, however, it does assume you require the following resources; views, fields, translations and routes. To invoke the bootstrap function with the least possible fuss, HOF-bootstrap makes some assumptions about the location of the aforementioned resources. Those assumptions are described in the following example, "A typical project layout".

##### Typical project layout

Typically, a project is organised into `apps`, which contain one or more named routes. Each route manages it's own views, translations, fields and steps (`index.js`), and possibly custom controllers and/or custom models (resources). However, project-level views, fields, and translations are merged with the route views, fields and translations, with the route-level resources taking precedent.

This example shows how a default configuration of HOF-bootstrap must be organised if your service has two routes.
```
<project_name>
  |__ assets/
  |__ apps/
       |__ my_app_1/
       |    |__ views/
       |    |__ translations/
       |    |__ fields.js
       |    |__ index.js (exports route)
       |__ my_app_2/
       |    |__ custom_controllers/
       |    |__ custom_models/
       |    |__ views/
       |    |__ translations/
       |    |__ fields.js
       |    |__ index.js (exports route)
       |__ index.js (exports object with my_app_1 and my_app_2)
  |__ views/
  |__ fields/
  |__ translations/
  |__ index.js (main/entry point)
```

##### Calling the bootstrap function
A project using a typical layout can invoke the bootstrap function with the default configuration and an array of route objects.

In the main/entry point (`index.js`):
```
const bootstrap = require('hof-bootstrap');

boostrap({
  routes: [{
    steps: {
      '/one': {}
    }
  }, {
    steps: {
      '/two': {}
    }
  }]
});
```

The previous contrived example is all that is needed to start a service with HOF-boostrap. Although in reality, you might want to [customise more of the configuration](#options).

**Important:** This example would not be very useful because it does not define what `fields` the bootstrap function should use. See the [section on Routes](#routes) for guidance.


## Interface

The `bootstrap` function returns the bootstrap interface object, which includes `start`, `use`, `stop` functions and the Express `server` object.

```
const bootstrap = require('hof-bootstrap');

const interface = boostrap({
  routes: [{
    steps: {
      '/one': {}
    }
  }
});
```

### `start` Function(options)

 * Creates and starts the server listening for connections.
 * `@param {Object}` options (`port, host, protocol`)
 * `@return {Promise.<bootstrap|Error>}` a promise that returns bootstrap interface object if resolved, Error if rejected.

Convenient if starting was deferred during the initial invocation of `HOF-bootstrap` with the option and value `start: false` or the server has been stopped. Returns a promise which resolves to the `bootstrap` interface object.

### `stop` Function(callback)

 * Closes the server, stops listening for connections
 * `@param {Function}` callback. Useful for testing
 * `@return {Promise.<bootstrap|Error>}` a promise that returns bootstrap interface object if resolved, Error if rejected.

### `use` Function(middleware)

 * Alias for Express's `app.use`.`
 * `@param {Function}` middleware.
 * `@return {Object} bootstrap` interface object.

The use function can only be used if bootstrap is called with `{ start: false }` passed in config, `bootstrap.start()` will need to be called afterwards to start the app. This is due to the significance of the order in which middleware are applied. Alternatively an array of middleware functions can be passed in config.

### `server`

 * Instance of an `http`/`https` server bound to the `app`
 * `@type {Object}


## Custom configuration

HOF-bootstrap accepts the following options so a developer can customise elements of the service such as the location of resources, which controller is used to process requests, session store and name of the session.

### Options

- `views`: Location of the base views relative to the root of your project. Defaults to 'views'. Set `views` to `false` if not present.
- `middleware`: An optional array of middleware functions to add to the application middleware pipeline.
- `fields`: Location of the common fields relative to the root of your project. Defaults to 'fields'. Set `fields` to `false` if not present.
- `translations`: Location of the common translations relative to the root of your project. Defaults to 'translations'.
- `baseController`: The base controller for all routes and steps. Defaults to [HOF-controllers.base](https://github.com/UKHomeOfficeForms/hof-controllers/blob/master/lib/base-controller.js).
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
- `redis.port`: Defaults to '6379'.
- `redis.host`: Defaults '127.0.0.1'.
- `session.ttl`: The session timeout in milliseconds. Defaults to `1800` (ms).
- `session.secret`: The session secret. Set this to something unique.
- `session.name`: The session name. Set this to something unique.

### Environent variables

- `PORT`
- `HOST`
- `PROTOCOL`
- `ENV`
- `GA_TAG`
- `REDIS_HOST`
- `REDIS_PORT`
- `SESSION_TTL`
- `SESSION_SECRET`
- `SESSION_NAME`

## Routes

The most important element of your service are the routes. These are what you will use to define the path your user will take when completing your forms.

### Settings
Not all route settings are mandatory, you can create and launch a service with just a set of steps.

#### Required
- `steps`: An object that defines the url, fields and optionally more for each form within your service.

For example, the following step will validate two fields. When submitted, if both fields are successfully validated, the next step to be loaded will be '/two'.
```
const myRoutes = [{
  baseUrl: '/foo',
  steps: {
    '/one': {
      fields: [
        'name_of_field_one',
        'name_of_field_two'
      ],
      next: '/two',
      forks: [{
        target: '/three',
        field: 'option1',
        value: 'yes'
      }]
    }
  }
}];
```
[Read more about steps and fields](https://github.com/UKHomeOfficeForms/HOF/blob/master/documentation/index.md)

#### Options
- `name`: If provided, is used to locate views, fields and translations for a form journey.
- `baseUrl`: Base url from which all steps are relative. Defaults to `/`. If provided will be used to locate views, fields and translations for a form journey.
- `fields`: Location of the routes' fields, relative to the root of your project. Defaults to `fields`.
- `views`: Location of the routes' views relative to the root of your project. Defaults to `views`.

**NOTE**: `fields` defined in a `route` determine the name of the directory or path, relative to the root, where the `fields` module is located. `fields` defined in a step, are a list of the name of each field you want to use in the step.

## Resources

### HOF documentation
https://github.com/UKHomeOfficeForms/HOF/blob/master/documentation/index.md

## Services that are built with HOF-bootstrap
- https://github.com/UKHomeOffice/gro
- https://github.com/UKHomeOffice/rotm
- https://github.com/UKHomeOffice/end-tenancy
- https://github.com/UKHomeOffice/UKVI-Complaints
