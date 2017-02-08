# Configuring Routes

The most important element of any service are the routes. These are what you will use to define the path(s) your users might take to complete a form.

The following example is of a route with a `baseUrl`, (`'/foo'`) and one step (`'/one'`). The `step` has a short list of `fields`, a `next` property (`'/two'`) and a `fork` that is taken if a fictional `field` (`'option1'`) evaluates to the `value`, `'yes'`.
```
const myRoute = [{
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
Then call HOF-bootstrap with `myRoute`.
```
const hofBootstrap = require('hof-bootstrap');
hofBootstrap(myRoute);
```


## Required
- `steps`: An object that defines the url, fields and optionally more for each form within your service.


## Options
- `name`: Passed to the form Wizard.
- `baseUrl`: Base url from which all `steps` are relative. Defaults to `/`. Used to locate the `views`, `fields` and `translations` for that route.
- `views`: Location of the routes' `views` relative to the root of your project. Takes precedence over `views` specified at the base level and from [hof-template-partials.views](https://github.com/UKHomeOfficeForms/hof-template-partials/tree/master/views).
- `fields`: Location of the routes' `fields`, relative to the root of your project. Takes precedence over `fields` specified at the base level (outside of the route.
  - If route `fields` is not explicitly set, will try to load them from the project using the route `name` assuming the `fields` file is located at `apps/${name}/fields`.

**NOTE**: The `fields` defined in a route is the path to the folder, relative to the root, where the `fields` are located.
The `fields` defined in a `step`, is the list of each field by name, you want to load in the `step`.

For example:
```
[{
  fields: '../../fields',
  steps: {
    '/one': {
      fields: [
        'name_of_field_one',
        'name_of_field_two'
      ]
    }
  }
}];
```

[Read more about steps and fields](https://github.com/UKHomeOfficeForms/HOF/blob/master/documentation/index.md).
