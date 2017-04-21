## 2017-04-21, Version 11.0.0 (Stable), @lennym
* Adds themes. Ships with `hof-theme-govuk` as default.

## 2017-03-14, Version 10.3.1 (Stable), @lennym
* Uses `_.merge` instead of `Object.assign` to combine default config with user-provided config.

## 2017-03-02, Version 10.3.0 (Stable), @lennym
* Fixes i18n language settings. Now offers complete multi-language support
* Adding `--shared ./node_modules/hof-template-partials/translations` to hof-transpiler is no longer necessary. This is handled automatically within bootstrap.

## 2017-02-22, Version 10.2.0 (Stable), @lennym
* Makes `views` directory on a route not throw if undefined and default directory does not exist

## 2017-02-20, Version 10.1.0 (Stable), @lennym
* Adds behaviours option to global config and app config to support defining common behaviours
* Restores `baseController` option with deprecation warning

## 2017-02-17, Version 10.0.0 (Stable), @joefitter
* _BREAKING_ - `clearSession` option on steps is removed
* _BREAKING_ - `mixin` option for fields defaults to `input-text` this means that fields that previously skipped rendering will now be rendered
* _BREAKING_ - `baseController` option removed

## 2017-02-10, Version 9.3.1 (Stable), @josephchapman
* Allow GA script to load js and images form any path

## 2017-02-10, Version 9.3.0 (Stable), @josephchapman
* CSP directives auto-amended with google url when gaTagId set

## 2017-02-09, Version 9.2.0 (Stable), @josephchapman
* CSP directives can be extended with `csp` config
* Documentation reorganised
* Test fixtures reorganised

## 2017-01-27, Version 9.1.0 (Stable), @lennym
* Allow CSP to be disabled to enable acceptance test to run

## 2017-01-27, Version 9.0.1 (Stable), @lennym
* Major version update of hof-template-mixins

## 2017-01-27, Version 9.0.0 (Stable), @lennym
* Major version updates of hof-form-wizard and hof-controllers

## 2017-01-16, Version 8.1.0 (Stable), @josephchapman
* Add basic Content Security Policy (CSP) middleware
* Throw error if session.secret is not set in production

## 2017-01-06, Version 8.0.1 (Stable), @josephchapman
* Fixes issue causing an error to be thrown when mounting middleware.

## 2017-01-05, Version 8.0.0 (Stable), @josephchapman
* Add router in middleware stack for insertion of user middleware (#100)
* Potential **breaking change**: Prevent overwriting initialisation config with custom start config.
* Allow custom protocol, port and host to start method.
* Do not allow this configuration to override the global config
* Fix broken paths to views and translations

## 2016-12-13, Version 7.0.0 (~~Stable~~), @josephchapman
* Pass `appConfig` through to **hof-wizard**
* Update to latest **hof-wizard** v1.1.0 so `appConfig` is passed to each `controller`
* Make `views` use **hof-template-partials** as default
* Remove `views` and `fields` from `defaults.js`
* **BREAKING CHANGE**: Throw if no base `fields` or route `fields` option is specified
  * Breaks all instances of bootstrap overriding `views` and `fields` with boolean `false`
* Update documentation, typos
* Update tests, specifically where optional controller provided

## 2016-07-20, Version 3.0.0 (Stable), @josephchapman
* Use hof-middleware.deepTranslate
* Use hof-middleware.notFound
* Remove assetPath option (Breaking)

## 2016-07-18, Version 2.0.0 (Stable), @josephchapman
* Make async tests run and not fail on travis
* Use cookie middleware
* Hard-code local assetPath (`/public`)
* Replace `assets` option with `assetpath` (breaking change)

## 2016-07-12, Version 1.0.1 (Stable), @josephchapman
* **hof-template-partials** 1.0.1 for common views and translations
* Fix i18n usage
  * Invoke i18n
  * Wait for i18n to become ready
* Fix router's optional paths
* Set the app to trust proxy
* Update cookies settings

