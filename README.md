# HOF [![npm version](https://badge.fury.io/js/hof.svg)](https://badge.fury.io/js/hof)

Home Office Forms (HOF) is a single package that bundles up a collection of modules used to create forms at the Home Office in node.js.

[Read the support documentation](./documentation/index.md) for more details or see use the simple instructions below to get started.

[The example app](https://github.com/UKHomeOffice/hof-example-form) is also a good place to start. We recommend cloning the repository, cleaning the commit history, and replacing the example form in there with one of your own. The example shows examples for most of the common ways you might want to use the libraries.

## What is it?

HOF provides the following which can be accessed through its properties.

 * [hmpo-form-wizard](https://github.com/UKHomeOffice/passports-form-wizard)
 * [hmpo-frontend-toolkit](https://github.com/UKHomeOffice/passports-frontend-toolkit)
 * [hmpo-govuk-template](https://github.com/UKHomeOffice/govuk-template-compiler)
 * [hmpo-model](https://github.com/UKHomeOffice/passports-model)
 * [hmpo-template-mixins](https://github.com/UKHomeOffice/passports-template-mixins)
 * [hof-controllers](https://github.com/UKHomeOffice/hof-controllers)
 * [i18n-future](https://github.com/lennym/i18n-future)
 * [middleware](https://github.com/UKHomeOffice/hof/blob/master/documentation/middleware.md)

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
var middleware = hof.middleware;
```
