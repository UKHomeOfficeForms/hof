# Controllers

HOF exports [HOF Controllers](https://github.com/UKHomeOffice/hof-controllers) as `controllers`, a small collection of common patterns that extend from [HMPO Form Controller](https://github.com/UKHomeOffice/passports-form-controller) and can be extended from to alter built in behaviour.

See [HOF Controllers](https://github.com/UKHomeOffice/hof-controllers) for details on functionality of specific controllers.

## Usage

```js
var controllers = require('hof').controllers;

var BaseController = controllers.base;
var DateController = controllers.date;
```

## Extending from HOF Controllers

To extend the functionality of a controller call the parent constructor and use node `util` to inherit the prototype;

Note: Custom controllers should extend from either the base controller or the date controller.

```js
var util = require('util');
var BaseController = require('hof').controllers.base;

var MyController = function MyController() {
  BaseController.apply(this, arguments);
};

util.inherits(MyController, BaseController);
```

## Adding a controller to your app

Controllers can be used to alter the behaviour of an entire journey or a single step.

### Journey

To add a controller to a journey, pass it in as an option to the [HOF Wizard](https://github.com/UKHomeOffice/passports-form-wizard).

```js
var wizard = require('hof').wizard;
var MyController = require('./my-controller');

wizard(steps, fields, {controller: MyController});
```

### Step

To add a controller to a step, pass the controller to the `controller` option of the appropriate step options.
```js
{
  '/personal-details': {
    controller: require('./controllers/personal-details'),
    fields: [
      'fullname',
      'nationality',
      'passport'
    ],
    /* options */
  }
}
```
