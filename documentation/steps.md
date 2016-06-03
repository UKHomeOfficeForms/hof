# Steps

Steps is an object used for defining the set pages that the user goes through in order to complete a [wizard](https://github.com/UKHomeOffice/passports-form-wizard) journey. Steps is combined with fields by the form wizard to create the journey.

## Example

```js
module.exports = {
  '/step1': {
    next: '/step2'
  },
  '/step2': {
    next: '/step3',
    fields: ['name']
  },
  '/step3': {
    next: '/step4',
    fields: ['age']
  },
  '/step4': {}
}
```

## Additional step options

The minimum amount of configuration for a wizard step is the `next` property to determine where the user should be taken after completing a step. A number of additional properties can be defined.

* `forks` - [How to configure a fork in a journey](https://github.com/UKHomeOffice/passports-form-controller#handles-journey-forking)
* `fields` - specifies which of the fields from the field definition list are applied to this step. Form inputs which are not named on this list will not be processed. Default: `[]`
* `template` - Specifies the template to render for GET requests to this step. Defaults to the route (without trailing slash)
* `backLink` - Specifies the location of the step previous to this one. If not specified then an algorithm is applied which checks the previously visited steps which have the current step set as `next`.
* `controller` - The constructor for the controller to be used for this step's request handling. The default is an extension of the [hmpo-form-controller](https://www.npmjs.com/package/hmpo-form-controller), which is exported as a `Controller`
* `clearSession` - When set to `true` will clear the session for the journey. This is useful when creating exit pages or for pages where the journey cannot be completed.

