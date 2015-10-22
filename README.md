# HOF

Home Office Forms (HOF) single package that bundles up a collection of packages used to create forms at the Home Office in node.js.

## Installation

```npm install --save hof```

## Usage

HOF comprises of the following modules.

 * [hmpo-form-wizard](https://github.com/UKHomeOffice/passports-form-wizard)
 * [hmpo-frontend-toolkit](https://github.com/UKHomeOffice/passports-frontend-toolkit)
 * [hmpo-govuk-template](https://github.com/UKHomeOffice/govuk-template-compiler)
 * [hmpo-model](https://github.com/UKHomeOffice/passports-model)
 * [hmpo-template-mixins](https://github.com/UKHomeOffice/passports-template-mixins)
 * [i18n-future](https://github.com/lennym/i18n-future)
 * [i18n-lookup](https://github.com/UKHomeOffice/i18n-lookup)

Each one is avalable from the hof package for convinience.

```
var hof = require('hof');

var wizard = hof.wizard;
var toolkit = hof.toolkit;
var template = hof.template;
var Model = hof.Model;
var mixins = hof.mixins;
var i18n = hof.i18n;
var i18nLookup = hof.i18nLookup;
```
