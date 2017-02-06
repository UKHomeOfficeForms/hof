# Getting Started

`cd` into your project and install HOF-bootstrap.
```
$ npm install --save hof-bootstrap
```

## Starting from scratch
If this is your first time using HOF and/or HOF-bootstrap, read on. If you want to migrate from [HOF to HOF-bootstrap, read here](#migrate-to-hof-bootstrap).

### Default configuration

HOF-bootstrap does not dictate how you structure your project, however, it does assume you require the following resources; views, fields, translations and routes. To invoke the bootstrap function with the least possible fuss, HOF-bootstrap makes some assumptions about the location of the aforementioned resources. Those assumptions are described in the following example, "A typical project layout".

#### Typical project layout

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

#### Calling the bootstrap function
A project using a typical layout can invoke the bootstrap function with the default configuration and an array of route objects.

In the main/entry point (`index.js`):
```
const bootstrap = require('hof-bootstrap');

bootstrap({
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

The previous contrived example is all that is needed to start a service with HOF-bootstrap. Although in reality, you might want to [customise more of the configuration](#options).

**Important:** This example would not be very useful because it does not define what `fields` the bootstrap function should use. See the [section on Routes](#routes) for guidance.


## Interface

The `bootstrap` function returns the bootstrap interface object, which includes `start`, `use`, `stop` functions and the Express `server` object.

```
const bootstrap = require('hof-bootstrap');

const interface = bootstrap({
  routes: [{
    steps: {
      '/one': {}
    }
  }]
});
```


## From HOF to HOF-bootstrap
If you are familiar with HOF, the process of moving to HOF-bootstrap should be straightforward. The entry point of your app, will contain the boilerplate code that configures the apps' settings, routes, middleware, session storage and probably starts the server listening for connections.
You can safely remove the boilerplate code and replace it with the bootstrap function. The following example invokes `bootstrap` with [routes](#routes). The custom configuration is used to tell HOF-bootstrap where to look for resources such as the views or controllers, or what session store to use.

HOF-bootstrap includes all the same dependencies that HOF contains, so you can remove the HOF dependency from `package.json` and `npm uninstall --save hof`.

The following is a contrived example, but is not dissimilar to a real configuration. In reality, you might want to [customise more of the settings](#options).

If you want to a more in depth introduction, read [Starting from scratch](#starting-from-scratch).
```
const bootstrap = require('hof-bootstrap');
const routes = require(/* path_to_routes */);

bootstrap({
  /* ... custom configuration ... */,
  routes: routes
});
```
