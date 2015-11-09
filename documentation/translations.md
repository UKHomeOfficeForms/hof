# Translations

HOF exports [i18n-future](https://github.com/lennym/i18n-future) as `i18n` which, is a tool that supports localization.

Internationalizations are a single JSON file of key/value pairs. They are referenced within the application via dot notation. An example follows:

```
{
  "buttons": {
    "continue": "Continue",
    "send": "Send",
    "change": "Change",
    "close": "Close"
  }
}
```

Where "Continue" would be referenced like so:

```
buttons.continue
```

## Setup

i18n is currently used in two areas for HOF, within [template mixins](https://github.com/UKHomeOffice/passports-template-mixins) and in the [form wizard](https://github.com/UKHomeOffice/passports-form-wizard).

### Template mixins

To use the localization tool in template mixins it has to be passed in as an additional option.

```js
var hof = require('hof');
var mixins = hof.mixins;
var i18nFuture = hof.i18n();

mixins(fields, {
  translate: i18nFuture.translate.bind(i18nFuture)
});
```

This makes the i18n available as a function called `t` within the templates. Translations can be called within the templates like so:

`{{#t}}buttons.continue{{/t}}` which would render `Continue` in the html.

### Wizard usage

To use the localization tool within the wizard it has to be passed in as an additional `translate` option.

```js
var hof = require('hof');
var wizard = hof.wizard;
var i18nFuture = hof.i18n();

wizard(steps, fields, {
  translate: i18nFuture.translate.bind(i18nFuture),
});
```

This makes i18n available [internally](https://github.com/UKHomeOffice/passports-form-wizard#additional-wizard-options) within the wizard for fields and errors.


## Structure

Across HOF apps it is recommended you break translations down into sensible chunks to ensure they don't become unwieldy. By convention we like translations to live within your journey apps for example:

```
my_hof_app
│
└───apps
    │
    ├───journey-one
    │   │
    │   └───translations
    │       │
    │       └───src
    │           │
    │           ├───en
    │           │   │
    │           │   ├───buttons.json
    │           │   │
    │           │   ├───fields.json
    │           │   │
    │           │   ├───validation.json
    │           │   │
    │           │   └───...
    │           │
    │           │
    │           └───fr
    │               │
    │               └───...
    │
    └───journey-two
        │
        └───...
```


Although you can store them anywhere that suits. More information on the structure can be found in this repository [hof-example-form](https://github.com/UKHomeOffice/hof-example-form)

If you choose to compartmentalise your locales, [HOF-transpiler](https://github.com/UKHomeOffice/hof-transpiler) can be used to combine a them into a single file for use in i18n.
