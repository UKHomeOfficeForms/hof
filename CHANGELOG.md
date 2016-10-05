# HOF ChangeLog

## 2016-10-5, Versions 10.0.0 (Stable) @easternbloc @joefitter
* **hmpo-form-wizard**: Upgraded to 5.1.1
* **hmpo-frontend-toolkit**: Upgraded to 4.0.0-rev1
* **hmpo-govuk-template**: Upgraded to 0.0.3
* **hmpo-model@0.7.0
* **hmpo-template-mixins**: Upgraded to 4.4.0-rev2
* **hof-controllers**: Upgraged to 3.0.0
* **hof-middleware**: Upgraded to 0.4.0
* **eslint-config-homeoffice**: Added to 2.0.0
* **i18n-future**: Upgraded to 0.2.0
* **hof-controllers**: Upgraded to 3.0.1
* removed shrinkwrap - there are a number of bugs using npm 2-3
* chore - lock down dependency versions

## 2016-06-2, Versions 8.0.0 (Stable) @joefitter
* **hmpo-template-mixins**: Upgraded to 4.2.0
* **hmpo-frontend-toolkit**: Upgraded to 4.2.0
* **hmpo-model**: Upgraded to 0.6.0
* **hmpo-form-controller**: Upgraded to 0.8.0
* **hmpo-form-wizard**: Upgraded to 4.4.1

## 2016-05-11, Version 7.1.0 (Stable), @joechapman
* **hof-middleware**: Upgraded to 0.1.1

## 2016-05-04, Version 7.0.1 (Stable), @easternbloc
Fixes browserify bug (a backend module was not being removed from the frontend)

## 2016-05-03, Version 7.0.0 (Stable), @easternbloc
* **hof-controllers**: Upgraded to 0.4.0
* **hmpo-model**: 0.4.0
* **hmpo-template-mixins**: 4.0.1
* **hmpo-frontend-toolkit**: 3.1.1
* **hof-middleware**: 0.0.1 (This release removes support for node `0.12` due to es6 features)

## 2016-04-18, Version 6.2.0 (Stable), @easternbloc
* **hof-controllers**: Upgraded to 0.3.0

## 2016-04-18, Version 6.1.0 (Stable), @easternbloc
* **hof-controllers**: Upgraded to 0.2.0

## 2016-03-14, Version 6.0.0 (Stable), @easternbloc
* **hmpo-frontend-toolkit**: Upgraded to 3.0.1
* **hmpo-form-wizard**: Upgraded to 4.3.0

## 2016-03-11, Version 5.0.0 (Stable), @easternbloc
* **HOF-Middleware**: Changed to only return an error instead of deciding making a cookie route

## 2016-03-04, Version 4.0.0 (Stable), @easternbloc
* **hmpo-form-wizard**: Upgraded to 4.1.0
* **hmpo-template-mixins**: Upgraded to 4.0.0

## 2016-03-03, Version 3.2.0 (Stable), @easternbloc
* **HOF-Middleware**: Added support for cookie checking on all routes other than /cookies-required

## 2015-11-25, Version 1.1.0 (Stable), @Joechapman
* **HOF-Controllers**: Added support for `forks` when defined in `steps.js`
  - [Forking](https://github.com/UKHomeOffice/hof-controllers#handles-journey-forking)
