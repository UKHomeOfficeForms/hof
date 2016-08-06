# Home Office Forms Bootstrap [![Build Status](https://travis-ci.org/UKHomeOffice/hof-bootstrap.svg?branch=master)](https://travis-ci.org/UKHomeOffice/hof-bootstrap) [![npm version](https://badge.fury.io/js/hof-bootstrap.svg)](https://badge.fury.io/js/hof-bootstrap)

Home Office Forms (HOF) Bootstrap is a highly configurable mechanism for creating and optionally, launching your service.

## Bootstrap is a function

You can call the `bootstrap` function with a list of [routes](#routes) and your [custom settings](#options) to invoke your personally configured service.

```
const bootstrap = require('hof-bootstrap');

bootstrap({
  views: 'optional_path_to_your_views',
  ...,
  routes: [{ ... }, { ... }]
});
```

**NOTE**: `bootstrap` returns a promise that resolves with with the bootstrap interface, which means you can call methods on bootstrap, such as;
```
bootstrap({ ... }).then(bootstrapInterface => {
  if (conditionIsMet)
    bootstrapInterface.stop();
    bootstrapInterface.use(middleware);
    bootstrapInterface.start();
  }
});
```

## Structure
`bootstrap` does not dictate how to structure your service, however, it does provide a number of default settings so you don't need to pass in anything other than a `route` and `steps`.

When the service consists of a single form journey
```
<service_name>
  |__ views/
  |__ fields/
  |__ translations/
  |__ public/
```

If the service consists of multiple form journeys
```
<service_name>
  |__ views/
  |__ fields/
  |__ translations/
  |__ public/
  |__ apps/
       |__ <name>
       |    |__ views/
       |    |__ fields/
       |    |__ translations/
       |__ <name>
            |__ views/
            |__ fields/
            |__ translations/
```

## Options

- `views`: Location of the base views relative to the root of your project. Defaults to 'views'.
- `fields`: Location of the common fields relative to the root of your project. Defaults to 'fields'.
- `translations`: Location of the common translations relative to the root of your project. Defaults to 'translations'.
- `viewEngine`: Name of the express viewEngine. Defaults to 'html'.
- `start`: Start the server listening when the bootstrap function is called. Defaults to `true`.
- `getCookies`: Load 'cookies' view at `GET /cookies`.
- `getTerms`: Load 'terms' view at `GET /terms-and-conditions`.
- `sessionStore`: Provide a sessionStore to be used in place of redis. Suggest using [https://github.com/expressjs/session/blob/master/session/memory.js](express-session.MemoryStore) for development and acceptance testing.


## Routes

The most important element of your service are the routes. These are what you will use to define the path your user will take when completing your forms.

### Settings
Not all route settings are mandatory, you can create and launch a service with just a set of steps.

#### Required
- `steps`: An object that defines the url, fields and optionally more for each form within your service.

For example, the following step will validate two fields. When submitted, if both fields are successfully validated, the next step to be loaded will be '/two'.
```
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
```
[Read more about steps and fields](https://github.com/UKHomeOffice/hof/blob/master/documentation/index.md)

#### Options
- `name`: If provided, is used to locate views, fields and translations for a form journey.
- `baseUrl`: Base url from which all steps are relative. Defaults to `/`. If provided will be used to locate views, fields and translations for a form journey.
- `fields`: Location of the routes' fields, relative to the root of your project. Defaults `fields`.
- `views`: Location of the routes' views relative to the root of your project. Defaults `views`.

**NOTE**: `fields` defined in a `route` determine the name of the directory or path, relative to the root, where the `fields` module is located. `fields` defined in a step, are a list of the name of each field you want to use in the step.
