# HOF

Home Office Forms (HOF) is a single package that bundles up a collection of modules used to create forms at the Home Office in node.js.

[Read the support documentation](./documentation) for more details or see use the simple instructions below to get started.

HOF comprises the following modules.

 * [hmpo-form-wizard](https://github.com/UKHomeOffice/passports-form-wizard)
 * [hmpo-frontend-toolkit](https://github.com/UKHomeOffice/passports-frontend-toolkit)
 * [hmpo-govuk-template](https://github.com/UKHomeOffice/govuk-template-compiler)
 * [hmpo-model](https://github.com/UKHomeOffice/passports-model)
 * [hmpo-template-mixins](https://github.com/UKHomeOffice/passports-template-mixins)
 * [hof-controllers](https://github.com/UKHomeOffice/hof-controllers)
 * [i18n-future](https://github.com/lennym/i18n-future)
 * [i18n-lookup](https://github.com/UKHomeOffice/i18n-lookup)

And each module is available as a property of `hof`

## Installation
```bash
$ npm install --save hof
```

## Usage
```js
var hof = require('hof');

var wizard = hof.wizard;
var toolkit = hof.toolkit;
var template = hof.template;
var Model = hof.Model;
var mixins = hof.mixins;
var controllers = hof.controllers;
var i18n = hof.i18n;
var i18nLookup = hof.i18nLookup;
```
