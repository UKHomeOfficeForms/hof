# HOF (Home Office Forms) [![NPM_Publish Actions Status](https://github.com/UKHomeOfficeForms/hof-build/workflows/Auto_Publish/badge.svg)](https://github.com/UKHomeOfficeForms/hof-build/actions) [![npm version](https://badge.fury.io/js/hof.svg)](https://badge.fury.io/js/hof) [![Known Vulnerabilities](https://snyk.io/test/npm/hof/badge.svg)](https://snyk.io/test/npm/hof)

HOF (Home Office Forms) is a framework designed to assist developers in creating form-based workflows in a rapid, repeatable and secure way. It aims to reduce simple applications as much as possible to being configuration-only.

## Resources

### HOF documentation

[https://ukhomeofficeforms.github.io/hof-guide/](https://ukhomeofficeforms.github.io/hof-guide/)

## Content Security Policy
### Inline JavaScript from 18.0.0
From version 18.0.0, unsafe-inline has been removed from the content security policy by default. This means scripts
must either be referenced using the src attribute, ```<script src='...'></script>``` or with a nonce value attribute. A nonce
value is generated for every request. You can add this to your own templates' inline scripts as needed:

```
<script {{#nonce}}nonce="{{nonce}}"{{/nonce}}>
...
</script>
```

### Built with HOF
 * https://github.com/UKHomeOffice/gro
 * https://github.com/UKHomeOffice/end-tenancy
 * [Firearms Licensing (Home Office)](https://github.com/UKHomeOffice/firearms)
 * [Contact UK Trade & Investment (UK Trade & Investment)](https://github.com/UKTradeInvestment/contact-ukti)
 * [Biometric Residence Permit (Home Office)](https://github.com/UKHomeOffice/brp_app)
 * [Report terrorist material (Home Office)](https://github.com/UKHomeOffice/rotm)
 * [UKVI Complaints (Home Office)](https://github.com/UKHomeOffice/Complaints)

## HOF BUILD
Performs build workflow for hof apps in prod and development

## Usage

Run a build by running `hof-build` from the command line in your project directory.

```
hof-build [task]
```

If no task is specified then all tasks will run.

It is recommended to alias `hof-build` to an npm script in your package.json.

## Tasks

* `browserify` - compiles client-side js with browserify
* `sass` - compiles sass
* `images` - copies images from ./assets/images directory to ./public/images
* `translate` - compiles translation files

## Watch

You can additionally run a `watch` task to start a server instance, which will automatically restart based on changes to files. This will also re-perform the tasks above when relevant files change.

By default files inside `node_modules` directories and dotfiles will not trigger a restart. If you want to include these files then you can set `--watch-node-modules` and `--watch-dotfiles` flags respectively.

### Local environment variables

You can load local environment variables from a file by passing an `--env` flag to `hof-build watch` and creating a `.env` file in your project root that defines your local variables as follows:

```
MY_LOCAL_ENVVAR=foo
MY_OTHER_ENVVAR=bar
```

_Note: `export` is not required, and values should not be quoted._

To load variables from a file other than `.env` you should pass the location of the file as a value on the `--env` flag.

```
hof-build watch --env .envdev
```

## Configuration

The default settings will match those for an app generated using [`hof-generator`](https://npmjs.com/hof-generator).

If a `hof.settings.json` file is found in the application root, then the `build` section of the settings file will be used to override [the default configuration](./defaults.js).

Alternatively you can define a path to a local config file by passing a `--config` option

```
hof-build --config /path/to/my/config.js
```

Any task can be disabled by setting its configuration to `false` (or any falsy value).

```js
module.exports = {
  browserify: false
};
```

### Configuration options

Each task has a common configuration format with the following options:

* `src` - defines the input file or files for the build task
* `out` - defines the output location of the built code where relevant
* `match` - defines the pattern for files to watch to trigger a rebuild of this task
* `restart` - defines if this task should result in a server restart

Additionally the server instance created by `watch` can be configured by setting `server` config. Available options are:

* `cmd` - defines the command used to start the server
* `extensions` - defines the file extensions which will be watched to trigger a restart

## HOF TRANSPILER

Home office forms transpiler is a tiny tool that can be used as part of a build or manually to convert multipart locales files into one default.json. This is used in our stack for translations of form applications.

## Usage

```
hof-transpiler [source dir|glob] {OPTIONS}

       --shared, -s  A path or glob to a directory of shared translations
```

## Example

Lets say you have a directory such as: ```translations/src/en```

Which contains:
```
buttons.json
emails.json
errors.json
validation.json
```

If you run hof-transpiler against the directory ```hof-transpiler ./translations/src```

It will iterate through src and for each directory it will create a new directory at the root level with a built default.json file ```translations/en/default.json```

Which will look something like

```
{
  "buttons": {
    json blob from buttons.json
  },
  "emails": {
    json blob from emails.json
  },
  "errors": {
    json blob from errors.json
  },
  "validation": {
    json blob from validation.json
  }
}
```

This is used further down the hof stack for application translations.

## Advanced example - duplicate keys between source folder and shared folder

Lets say you have a directory such as: ```translations/src/en```

Which contains:
buttons.json containing:
```json
{
  "unusual-button": "Moo"
}
```
emails.json containing:
```json
{
  "customer-email": "Hi how are you?"
}
```

And you also have a directory of shared translations such as: ```shared-translations/src/en```

Which contains:
buttons.json containing:
```json
{
  "common-button": "Click me"
}
```

If you then run:
```bash
hof-transpiler translations/src --shared shared-translations/src
```

Then transpiled translations should appear in translations/en/default.json as follows:
```json
{
  "buttons": {
    "unusual-button": "Moo",
    "common-button": "Click me"
  },
  "emails": {
    "customer-email": "Hi how are you?"
  }
}
```

Note how a deep merge is performed between the json, with key value pairs from "buttons" being included from both files.

## Multiple shared sources

hof-transpiler supports multiple shared sources, extending them from left to right. This is useful if you have translations shared between applications, and additional shared translations between routes within an application.

If you have the following sources:

node_modules/hof-template-partials/translations/src/en/buttons.json
```json
{
  "continue": "Continue",
  "skip": "Skip",
  "submit": "Submit",
  "abort": "Abort"
}
```

common/translations/src/en/buttons.json
```json
{
  "skip": "Skip this step",
  "cancel": "Cancel"
}
```

my-application/translations/src/en/buttons.json
```json
{
  "continue": "Go Forth!"
}
```

If you then run:
```bash
hof-transpiler my-application/translations/src --shared node_modules/hof-template-partials/translations/src --shared common/translations/src
```

my-application/translations/en/default.json
```json
{
  "buttons": {
    "continue": "Go Forth!",
    "skip": "Skip this step",
    "submit": "Submit",
    "abort": "Abort",
    "cancel": "Cancel"
  }
}
```
#HOF Controller

Implements a request pipeline for GET and POST of forms, with input cleaning/formatting and validation.

## Usage

Basic usage:

```javascript
var Form = require('./controller');

var form = new Form({
    template: 'form',
    fields: {
        name: {
            validate: 'required'
        }
    }
});

app.use('/', form.requestHandler());
```

This won't really be very useful though, since all it will do is render the "form" template on `/` and respond to GET and POST requests.

For real-world usage you will probably want to extend the Form class to create your own controllers.

```javascript
var Form = require('./controller''),
    util = require('util');

var MyForm = function (options) {
    Form.call(this, options);
};

util.inherits(MyForm, Form);

module.exports = MyForm;
```

The Form class allows for a number of insertion points for extended functionality:

* `configure`   Allows for dynamic overwriting of particular points of form configuration based on user session
* `process`     Allows for custom formatting and processing of input prior to validation
* `validate`    Allows for custom input validation
* `getValues`   To define what values the fields are populated with on GET
* `saveValues`  To define what is done with successful form submissions

All of these methods take three arguments of the request, the response and a callback. In all cases the callback should be called with a first argument representing an error.

* `getErrors/setErrors` Define how errors are persisted between the POST and subsequent GET of a form step.
* `locals` Define what additional variables a controller exposes to its template

These methods are synchronous and take only the request and response obejct as arguments.

### Validators

The library [supports a number of validators](https://github.com/UKHomeOffice/passports-form-controller/blob/master/lib/validation/validators.js).

By default the application of a validator is optional on empty strings. If you need to ensure a field is validated as being 9 characters long and exists then you need to use both an `exactlength` and a `required` validator.

#### Custom Validators

Custom validator functions can be passed in field config. These must be named functions and the name is used as the error.type for looking up validation error messages.

fields.js
```js
{
    'field-1': {
        validate: ['required', function isTrue(val) {
            return val === true;
        }]
    }
}
```

### steps config

#### Handles journey forking

Each step definition accepts a `next` property, the value of which is the next route in the journey. By default, when the form is successfully submitted, the next steps will load. However, there are times when it is necessary to fork from the current journey based on a users response to certain questions in a form. For such circumstances there exists the `forks` property.

In this example, when the submits the form, if the field called 'example-radio' has the value 'superman', the page at '/fork-page' will load, otherwise '/next-page' will be loaded.

```js

'/my-page': {
    next: '/next-page',
    forks: [{
        target: '/fork-page',
        condition: {
            field: 'example-radio',
            value: 'superman'
        }
    }]
}
```

The condition property can also take a function. In the following example, if the field called 'name' is more than 30 characters in length, the page at '/fork-page' will be loaded.

```js

'/my-page': {
    next: '/next-page',
    forks: [{
        target: '/fork-page',
        condition: function (req, res) {
            return req.form.values['name'].length > 30;
        }
    }]
}
```

Forks is an array and therefore each fork is interrogated in order from top to bottom. The last fork whose condition is met will assign its target to the next page variable.

In this example, if the last condition resolves to true - even if the others also resolve to true - then the page at '/fork-page-three' will be loaded. The last condition to be met is always the fork used to determine the next step.

```js

'/my-page': {
    next: '/next-page',
    forks: [{
        target: '/fork-page-one',
        condition: function (req, res) {
            return req.form.values['name'].length > 30;
        }
    }, {
        target: '/fork-page-two',
        condition: {
            field: 'example-radio',
            value: 'superman'
        }
    }, {
        target: '/fork-page-three',
        condition: function (req, res) {
            return typeof req.form.values['email'] === 'undefined';
        }
    }]
}
```

### Dynamic field options

If the options for a particular field are dependent on aspects of the user session, then these can be extended on a per-session basis using the `configure` method.

For example, for a dynamic address selection component:

```js
MyForm.prototype.configure = function configure(req, res, next) {
    req.form.options.fields['address-select'].options = req.sessionModel.get('addresses');
    next();
}
```

### The FormError class

FormError can be used as a façade to normalise different types of error one may receive / trigger, and to be subsequently returned from a controller.
Its constructor takes a series of options. `title` and `message` have both getters and public methods to define default values.


```js

let error = new ErrorClass(this.missingDoB, {
    key: this.missingDob,
    type: 'required',
    redirect: '/missingData',
    title: 'Something went wrong',
    message: 'Please supply a valid date of birth'});
```

##hof-behaviour-session

HOF Behaviour for reading and writing to the session

##Usage

###With [mixwith.js](https://github.com/justinfagnani/mixwith.js)

```js
const mix = require('mixwith').mix;
const Session = require('./controller/behaviour-session');
const BaseController = require('./controller');

class MyController extends mix(BaseController).with(Session) {
  ...
}
```
`MyController` now extends `hof-form-controller` and has `hof-behaviour-session` functionality mixed in.

##Functionality

This mixin extends `hof-form-controller` by persisting the form data to the `sessionModel` - assuming the [session-model](https://github.com/UKHomeOfficeForms/hof-form-wizard/blob/master/lib/middleware/session-model.js) middleware has been applied.

The following form controller methods are used:

* `getValues(req, res, cb)` - calls callback with `null` and a map of all items in the `sessionModel`, extended with `errorValues` - to persist entered values on current step if validation fails
* `saveValues(req, res, cb)` - Called on success. Sets all step fields in `req.form.values` to the sessionModel, unsets `errorValues`.
* `getErrors(req)` - returns all errors for fields on the current step (`req.form.options.fields`), excluding redirects. Set to `req.form.errors` in `hof-form-controller`.
* `setErrors(err, req)` - called on validation error(s). Sets the current step field values as `errorValues` in sessionModel to be used in `getValues`. Sets `errors` to sessionModel - a map of `field-name: error` to be used in `getErrors`.
* `locals(req, res)` - Extends the result of `super.locals` with `baseUrl` (`req.baseUrl`) and `nextPage` (the result of `this.getNextStep(req, res)`).
* `missingPrereqHandler(req, res)` - Error handler called when a `MISSING_PREREQ` error is thrown from the [check-progress](https://github.com/UKHomeOfficeForms/hof-form-wizard/blob/master/lib/middleware/check-progress.js) middleware. This occurs if a step is visited out of sequence. This error handler causes the user to be redirected to the last completed step, or the first step if none have been completed.
* `errorHandler(err, req, res, next)` - checks if `err.code` is `MISSING_PREREQ`, if so calls `missingPrereqHandler`, if not calls `super` to hand over to parent error handler.


##behaviour-hooks

HOF Behaviour enabling lifecycle hooks for extending functionality in main form pipeline.

##Usage

###With [mixwith.js](https://github.com/justinfagnani/mixwith.js)

```js
const mix = require('mixwith').mix;
const Hooks = require('./controller/behaviour-hooks');
const BaseController = require('./controller');

class MyController extends mix(BaseController).with(Hooks) {
  ...
}
```
`MyController` now extends `hof-form-controller` and has `hof-behaviour-hooks` functionality mixed in.

##Functionality

The following hooks are currently supported, the methods are GET/POST pipeline methods from `hof-form-controller`:

####GET
* `_getErrors` - `'pre-getErrors', 'post-getErrors'`
* `_getValues` - `'pre-getValues', 'post-getValues'`
* `_locals` - `'pre-locals', 'post-locals'`
* `render` - `'pre-render', 'post-render'`

####POST
* `_process` - `'pre-process', 'post-process'`
* `_validate` - `'pre-validate', 'post-validate'`
* `saveValues` - `'pre-saveValues', 'post-saveValues'`
* `successHandler` - `'pre-successHandler', 'post-successHandler'`

###In field config

fields.js
```js
module.exports = {
  'field-1': {
    hooks: {
      'post-locals': (req, res, next) => {
        Object.assign(res.locals, {
          foo: 'bar'
        });
        next();
      },
      'pre-process': (req, res, next) => {
        req.body['field-1'] = req.body['field-1'].toUpperCase();
        next();
      }
    }
  }
}
```

# HOF Model
Simple model for interacting with http/rest apis.

##Usage
```javascript
const Model = require('./model');
```
## Data Storage

Models can be used as basic data storage with set/get and change events.

### Methods

#### `set`

Save a property to a model. Properties can be passed as a separate key/value arguments, or with multiple properties as an object.

```javascript
const model = new Model();
model.set('key', 'value');
model.set({
  firstname: 'John',
  lastname: 'Smith'
});
```

#### `get`

Retrieve a property from a model:

```javascript
const val = model.get('key');
// val = 'value'
```

#### `toJSON`

Returns a map of all properties on a model:

```javascript
const json = model.toJSON();
// json = { key: 'value' }
```

### Events

`change` is emitted when a property on a model changes

```javascript
const model = new Model();
model.on('change', (changedFields) => {
  // changedFields contains a map of the key/value pairs which have changed
  console.log(changedFields);
});
```

`change:<key>` is emitted when a particular property - with a key of `<key>` - on a model changes

```javascript
const model = new Model();
model.on('change:name', (newValue, oldValue) => {
  // handler is passed the new value and the old value as arguents
});
model.set('name', 'John Smith');
```

### Referenced Fields

A field can be set to a reference to another field by setting it a value of `$ref:<key>` where `<key>` is the field to be reference. The field will then behave exactly like a normal field except that its value will always appear as the value of the referenced field.

```javascript
const model = new Model();
model.set('home-address', '1 Main Street');
model.set('contact-address', '$ref:home-address');

model.get('contact-address'); // => '1 Main Street';
model.set('home-address', '2 Main Street');
model.get('contact-address'); // => '2 Main Street';

model.toJSON(); // => { home-address: '2 Main Street', 'contact-address': '2 Main Street' }
```

Change events will be fired on the referenced field if the underlying value changes.

```javascript
const model = new Model();
model.set('home-address', '1 Main Street');
model.set('contact-address', '$ref:home-address');
model.on('change:contact-address', (value, oldValue) => {
  // this is fired when home-address property changes
});

model.set('home-address', '2 Main Street');
```

A field can be unreferenced by setting its value to any other value.

```javascript
const model = new Model();
model.set('home-address', '1 Main Street');

// reference the field
model.set('contact-address', '$ref:home-address');

// unreference the field
model.set('contact-address', '1 Other Road');
```

## API Client

Normally this would be used as an abstract class and extended with your own implementation.

Implementations would normally define at least a `url` method to define the target of API calls.

There are three methods for API interaction corresponding to GET, POST, and DELETE http methods. These methods all return a Promise.

### Methods

#### `fetch`

```javascript
const model = new Model();
model.fetch().then(data => {
  console.log(data);
});
```

#### `save`

```javascript
const model = new Model();
model.set({
  property: 'properties are sent as JSON request body by default'
});
model.save().then(data => {
  console.log(data);
});
```

The method can also be overwritten by passing options

```javascript
const model = new Model();
model.set({
  property: 'this will be sent as a PUT request'
});
model.save({ method: 'PUT' }).then(data => {
  console.log(data);
});
```

#### `delete`

```javascript
const model = new Model();
model.delete().then(data => {
  console.log(data);
});
```

### Options

If no `url` method is defined then the model will use the options parameter and [Node's url.format method](https://nodejs.org/api/url.html#url_url_format_urlobj) to construct a URL.

```javascript
const model = new Model();

// make a GET request to http://example.com:3000/foo/bar
model.fetch({
  protocol: 'http',
  hostname: 'example.com',
  port: 3000,
  path: '/foo/bar'
}).then(data => {
  console.log(data);
});
```

### Events

API requests will emit events as part of their lifecycle.

`sync` is emitted when an API request is sent
```javascript
model.on('sync', function (settings) { });
```

`success` is emitted when an API request successfully completes
```javascript
model.on('success', function (data, settings, statusCode, responseTime) { });
```

`fail` is emitted when an API request fails
```javascript
model.on('fail', function (err, data, settings, statusCode, responseTime) { });
```

# HOF Middleware
A collection of commonly used HOF middleware, exports `cookies`, `notFound`, and `errors` on `middleware`

## Arranging the middleware in your app

Cookies middleware should be placed before any other routes, this guarantees that any data gathered in the form will be saved to the session.
The Not Found middleware should be placed after all routes and before the Error handler middleware. This arrangement ensures that if an error is thrown it will be caught.

## Cookies

### Usage
```js
app.use(require('hof').middleware.cookies({
  'cookie-name': 'my-application-cookie',
  'param-name': 'my-query-param'
}));
```

This middleware must be declared before your other routes.

### Options
The `cookie-name` can be the same as your session cookie. (The
middleware will not overwrite it.) Defaults to `hof-cookie-check`.

The `param-name` should be chosen so that it does not clash with names
you are using elsewhere. In almost all cases the default value of
`hof-cookie-check` will suffice.

The error raised when cookies are not supported by the client can then
be handled in you error handler by identifying it using its `code`
property which will be set to `NO_COOKIES`.

You can also provide an array of healthcheck URLs with `healthcheckUrls`,
should you not want to throw a Cookies required error when requesting the app with specific URLs.
Kubernetes healthcheck URLs are provided as defaults if no overrides are supplied.

## Not found (404)

Expects there to be a view called 404 in your configured `/views` directory

### Usage
```js
app.use(require('hof').middleware.notFound({
  logger: require('/logger'),
  translate: require('hof').i18n({path: path_to_translations/__lng__/__ns__.json}).translate
}));
```

This middleware should be declared *after* your other routes but *before* your errorhandler.

### Options
`logger` can be any object with a warn method.

`translate` can be the HOF i18n translate function

## Errors

### Usage
```js
app.use(require('hof').middleware.errors({
  logger: require('/logger'),
  translate: require('hof').i18n({path: path_to_translations/__lng__/__ns__.json}).translate,
  debug: true
}));
```

This middleware must be declared *after* your other routes.

### Options
`logger` can be any object with an error method.

`translate` can be the HOF i18n translate function

`debug` set to true will present the stack trace in the form and return the err as the content of the template.

__Note__ If `debug === true` translations will not be served, but the error handler default messages
=======
## Deep translate

deepTranslate middleware supports nested conditional translations in order to show different content in different scenarios. The middleware adds a `translate` function to `req` which is used in various points throughout the architecture.  This middleware must be applied before any other middleware which rely on the `req.translate` function. Also when initializing the form wizard, or template mixins, if a `translate` function is provided, this will be used rather than the deepTranslate middleware.

### Usage

```js
const i18nFuture = require('hof').i18n;
const i18n = i18nFuture({
  path: path.resolve(__dirname, './path/to/translations')
})
app.use(require('hof').middleware.deepTranslate({
  translate: i18n.translate.bind(i18n)
}));
```

locales
```json
"fields": {
    "field-name": {
        "label": {
            "dependent-field": {
                "value-1": {
                    "dependent-field-2": {
                        "value-1": "Label 1",
                        "value-2": "Label 2"
                    }
                },
                "value-2": "Label 3"
            },
            "default": "Fallback label"
        }
    }
}
```

Using the translation key `fields.field-name.label` will return different values in different situations depending on the values of named fields. In the above example the following are true:

* If both `dependent-field` and `dependent-field-2` have the value `"value-1"`, the label returned will be `"Label 1"`.
* If the value of `dependent-field` is `"value-1"` and the value of `dependent-field-2` is `"value-2"`, the label returned will be `"Label 2"`.
* If the value of `dependent-field` is `"value-2"` the label returned will be `"Label 3"` regardless of the value of `dependent-field-2`
* The default label `"Fallback label"` will be used if value of `dependent-field` is neither of the given options, or it is `undefined`. It will also be used if the value of `dependent-field` is `"value-1"` and the value of `dependent-field-2` is neither of the given options or it is undefined.
