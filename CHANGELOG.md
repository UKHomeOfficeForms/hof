## 2025-07-09, Version 22.7.6 (Stable), @robertdeniszczyc2 @sulthan-ahmed
### Changed
- Updated SVG handling and related dependencies to address issues and improve compatibility. 

## 2025-05-29, Version 22.7.2 (Stable), @Rhodine-orleans-lindsay
### Fixed
- Service unavailable text can now use html

## 2025-05-28, Version 22.7.0 (Stable), @Rhodine-orleans-lindsay @sulthan-ahmed
### Added
- 'Service Unavailable' functionality added which allows for services to redirect to a 'Service Unavailable' page when there is a need to pause a service for things like maintenance:
  - Adds 'service unavailable' error middleware
  - Includes default service unavailable html view
  - Includes flag to set `SERVICE_UNAVAILABLE` config to true to enable the functionality
### Changed
- Error pages can now show the service name in the title and journey header
### Security
- Updates patch and minor dependencies

## 2025-05-09, Version 22.6.0 (Stable), @vivekkumar-ho
### Changed
- Support for passing `maxlengthAttribute` property for input-text field. The HTML maxlength attribute is applied when `maxlengthAttribute: true` and the `maxlength` validator are specified in the field config

## 2025-05-06, Version 22.5.2 (Stable), @Rhodine-orleans-lindsay
### Fixed
- Hints for radio button options are now aligned correctly
### Security
- Updates patch and minor dependencies

## 2025-04-15, Version 22.5.0 (Stable), @shamiluwais
### Changed
- Refactors notify component to enable email attachments

## 2025-04-15, Version 22.4.0 (Stable), @Rhodine-orleans-lindsay
### Changed
- Amends page title format to follow the govuk design system so that the service name is now included in the the title by setting the `header` or `serviceName` in journey.json.
- Where page titles need to be different from page headings, if `title` is set pages.json, it can be used in the page title instead of `header`.
### Security
- Updates patch and minor dependencies

## 2025-03-17, Version 22.3.2 (Stable), @Rhodine-orleans-lindsay
### Fixed
- Error message now shows above textarea field if label is hidden
### Security
- Updates patch and minor dependencies

## 2025-03-07, Version 22.3.0 (Stable), @robertdeniszczyc2 @sulthan-ahmed
### Fixed
- the validator `ukmobilephone` now accepts `+447 and 07`
### Security
- Updates minor dependencies for `axios`

## 2025-03-07, Version 22.2.0 (Stable), @Rhodine-orleans-lindsay
### Changed
- Amends cookie config to allow limited changes to sameSite property during safe cross-origin navigations.
### Security
- Updates patch and minor dependencies
  
## 2025-01-24, Version 22.1.0 (Stable), @robertdeniszczyc2 @sulthan-ahmed
* ⛓️‍💥 **BREAKING CHANGE** : removed `nodemailer-smtp-transport` replaced with `nodemailer`. 
  - The nodemailer-smtp-transport package has been removed due to a critical vulnerability, and its functionality has been consolidated under nodemailer.
  - 👊 Impact : Any functions or configurations relying on nodemailer-smtp-transport must be updated to use nodemailer.
  - 🎬 Action: Rewrite code to utilize nodemailer as the replacement, ensuring compatibility and security.

## 2025-01-17, Version 22.0.0 (Stable), @Rhodine-orleans-lindsay
* Adds session timeout warning
  - user can stay on page or exit form
  - adds exit html
  - user can stay signed in or save and exit the form if the form is a save and exit form
  - adds default save-and-exit html
  - updates confirmation html to a static page
  - allows for customisation of session timeout warning dialog content, exit and save-and-exit page content, and exit and save-and-exit steps
  - Potential **_breaking change_**: Static pages should use the `{{<layout}}...{{/layout}}` tags instead of the `{{<partials-page}}...{{/partials-page}}` tags if the timeout warning should not be displayed.
* Fixes accessibility issues
* Sandbox area for testing hof changes
* Updates patch and minor dependency versions

## 2024-07-22, Version 21.0.0 (Stable), @Rhodine-orleans-lindsay
* Replaces deprecated request module with axios
  - refactors the hof model and apis to use axios instead of request
* Updates patch and minor dependency versions

## 2024-04-24, Version 20.5.0 (Stable), @mislam987
* Add hint property to checkboxes to align with govuk design guidelines

## 2024-02-29, Version 20.4.0 (Stable), @sulthan-ahmed
* Update version of govuk-frontend to 3.15
  - this adds the new crown for the King
  - this supports a lot of changes from the govuk design system
* Adds support for Google tag manager
* Fixes accessibility issues
* Sandbox area for testing hof changes
* Updates patch and minor versions including
  - libphonenumber to 1.9.44
  - nodemailer to 6.9.9
  - ip to 1.1.9
  - es5-ext to 0.10.63

## 2020-06-02, Version 16.0.0 (Stable), @andymoody
* Update version of helmet to 3.22.0
* Update version of i18n-future to 2.0.0

## 2020-06-01, Version 15.1.1
* Update hof-form-wizard to 5.1.1

## 2020-05-16, Version 15.1.0
* Add support for configuring multiple views folders at the root level 

## 2020-04-29, Version 15.0.0 (Stable), @andymoody
* Update version of hof-template-mixins to 5.2.1
* Now supports hints on options for checkbox and radio groups
* Includes a breaking change to older-style 'grey-label' option groups

## 2017-04-21, Version 12.0.0 (Stable), @lennym
* Renames to `hof`!
* Includes refactor of `hof-form-controller` to move error messaging to a render-time concern.
* Depecrates `Controller#Error` in favour of `Controller#ValidationError`

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

