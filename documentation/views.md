# Views, Templates and Mixins


## HMPO GOVUK Template

HOF exports `template` from [HMPO GOVUK Template](https://github.com/UKHomeOffice/govuk-template-compiler), which when extended from, provides the gov.uk chrome.

In your apps' entry point, i.e, `app.js`, require [ExpressJS](https://expressjs.com/) and [HOF](https://github.com/UKHomeOffice/hof), and pass an instance of `express` into `template.setup()`.
```js
var express = require('express');
var app = express();

require('hof').template.setup(app);
```

And to make the `govuk-template` partial available, add the following to the top of your base view.
```html
{{< govuk-template}}
```

## HMPO Template Mixins

HOF exports `mixins` from [HMPO Template Mixins](https://github.com/UKHomeOffice/passports-template-mixins). These are a set of functions, written with [Hogan](http://twitter.github.io/hogan.js/) and expressed as in the following example, that render the named partial compiled with its argument.

In this example, `email` is the argument, which refers to a [field](./fields.md) named 'email'.

```html
{{#input-text}}email{{/input-text}}
```

## Partials support

To enable support for partials, first set the location of the common views.
```js
app.set('views','./common/views/');
```

Above we are setting the location of the views for our application, where 'partials' is included as a subdirectory.

```
├──common
|   └──views/
|      └──partials/
            └── ...
```

To enable access to the partials add [Express Partial Templates](https://github.com/UKHomeOffice/express-partial-templates) to your middleware stack.
```js
app.use(require('express-partial-templates')(app));
```

Express Partial Templates will traverse the location of your views and build a hash of your partial templates onto the locals object so they can be accessed from within your views as in the following example.

```html
{{> partials-navigation}}
```

## Putting it all together

Typically these settings live in the applications' entry point, i.e, app.js, and before the routes are defined.
We include [hogan-express-strict](https://github.com/lennym/hogan-express), a fork of Hogan Express, and a Mustache template engine for ExpressJS, without which the Hogan templates will not compile.

```js
var express = require('express');
var app = express();
var hof = require('hof');

hof.template.setup(app);
app.set('view engine', 'html');
app.set('views', path.resolve(__dirname, './apps/common/views'));
app.use(require('express-partial-templates')(app));
app.engine('html', require('hogan-express-strict'));
```
