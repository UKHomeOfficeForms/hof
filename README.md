# Home Office Forms Bootstrap

Home Office Forms (HOF) Bootstrap is a highly configurable mechanism for creating and optionally, launching your service.

## Bootstrap is a function

You can call the `bootstrap` function with a list of [routes](#routes) and your [custom settings](#custom-settings) to invoke your personally configured service.

```
const bootstrap = require('hof-bootstrap');

bootstrap({
  views: ...,
  errorHandler: ...,
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

## Routes

Probably the most important element of your service are the routes. These are what you will use to define the path your user will take when completing your forms.

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
    next: '/two'
  }
}
```
[Read more about steps and fields](UkHomeOffice/hof/documentation)

#### Options
- `baseUrl`: the base url from which all steps will be relative. Defaults to `/`.
- `fields`: the path to the fields folder or file, relative to your project root.
- `templates`: the path to the templates folder or file, relative to your project root.

