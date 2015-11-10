# Wizard

The Wizard is the place where it all comes together, where the steps and fields meet the [views](./views.md) and the [translations](./translations.md).

## Usage

The `wizard` is a function and takes up to three arguments, [steps](./steps.md), [fields](./fields.md) and [options](#options).

```js
var wizard = require('hof').wizard;
wizard(steps, fields, options);
```

Using the steps and fields, the wizard creates a series of routes.

### Options

- `controller`: Add your own controller to override or extend behvaiour. For instance, we use `hof.controllers.base`. By default the wizard uses `hof.wizard.Controller`.

- `templatePath`: The full path to the location of the views for that instance of the wizard.

- `translate`: The translate function. We use `hof.i18n.translate`.

- `params`: Route params such as, `'/:action?'`.

## Mounting a route

When the wizard is passed as a callback to a router middleware, the series of routes defined in the steps are mounted onto the route.

```js

var steps = {
  '/one': {},
  '/two': {}
};

router.use('/my-route/', wizard(steps, fields, {
  controller: require('../my-controller'),
  templatePath: path.resolve(__dirname, 'views'),
  translate: i18n.translate.bind(i18n),
  params: '/:action?'
}));
```

Using the above configuration settings, we have registered the application routes `/my-route/one`, and `/my-route/two`, with `../my-controller` as the callback to each route.


## Finally

In the index file of each journey directory, initialize the wizard and pass it into the router middleware.

```
└───journeys/
    ├───common/
    │   └───...
    ├───one/
    │   ├───...
    │   └───index.js
```

Export the router, and in your applications' main file - in our case this is app.js - require the index file and pass the export into the Express middleware

```js

var app = express();

app.use('./journeys/one/');
```
