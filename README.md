# HOF (Home Office Forms) [![Build Status](https://travis-ci.org/UKHomeOfficeForms/hof-bootstrap.svg?branch=master)](https://travis-ci.org/UKHomeOfficeForms/hof-bootstrap) [![npm version](https://badge.fury.io/js/hof.svg)](https://badge.fury.io/js/hof) [![Known Vulnerabilities](https://snyk.io/test/npm/hof/badge.svg)](https://snyk.io/test/npm/hof)

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
