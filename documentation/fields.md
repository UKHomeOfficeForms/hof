# Fields

Fields is an object of key/value pairs - each pair the name of a field, and a configuration options object.
```js
module.exports = { /... key/value pairs go here .../ };
```
The configuration options can include properties such as `validate`, `label`, `className`, and others, as documented in each of the examples below.

Note: `validate` pertains to server-side validation.

Its important to remember that the fields themselves do not render as HTML, but make available the properties that might be necessary to create an HTML field. The HOF stack uses [hmpo-template-mixins](https://github.com/UKHomeOffice/passports-template-mixins) - exported as `mixins` - along with the field names and configuration options to render partial HTML templates.

For more information about `fields` see [Form Wizard](https://github.com/UKHomeOffice/passports-form-wizard), and [Form Controller](https://github.com/UKHomeOffice/passports-form-controller#validators).

## Usage

The following are examples of various fields and their configuration options

### Radio buttons

```js
'my-radio-buttons': {
  options: [{
    value: 'yes',
    label: 'Yes'
  }, {
    value: 'no',
    label: 'No',
    toggle: 'myToggleField'
  }],
  validate: ['required'],
  className: ['inline']
}
```

- `my-radio-buttons` has two options.
- `options` is a collection of items, each corresponding to an option in a radio control, and each with its own `label` and `value` property.
- option 'yes' has a name of 'my-radio-buttons' and an id of 'my-radio-buttons-yes'.
- option 'no' has a name of 'my-radio-buttons' and an id of 'my-radio-buttons-no'.
- `toggle` points to an id and can be used show the html field with "id='myToggleField'" when the radio option "no" is selected'
- `validate` takes an array of one or more, optional validators, [listed here](https://github.com/UKHomeOffice/passports-form-controller/blob/master/lib/validation/validators.js).
- `className` takes an array of html class names that can be mapped to the corresponding HTML element.


### Date fields

```js
'my-date': {
  legend: 'Date',
  hint: 'For example, 31 3 1970'
},
'my-date-day': {
  label: 'Day'
},
'my-date-month': {
  label: 'Month'
},
'my-date-year': {
  label: 'Year'
}
```
- A date consists of four fields;
  - the date container, here called `my-date`
  - and the date parts;
    - a date day (`my-date-day`),
    - a date month (`my-date-month`)
    - and a date year (`my-date-year`).

- Preceding the name of a date part with the name of the date container will link it with the date container field. I.e. `my-date-day` is associated with `my-date` because the name of the date day part is is `day` preceeded with `my-date`.

- The date container contains configuration for the date as a whole, which can include options such as;
  - `legend`
  - `hint`

- A date has a set of default, date-specific validation rules, `required`, `numeric`, `format` and `future`, and each one is set by default.
- A dates' validation rules can be overriden with a `validate` property;

In the following example, the date will validate to an error only when all date-related fields in the group have a value and either contain non-numeric values, or are in the future.


```js
{
  'my-date': {
    legend: 'Date',
    hint: 'For example, 31 3 1970',
    validate: ['numeric', 'future']
  }
}
```

### Text field

```js
'my-text-field': {
  validate: ['required'],
  dependent: {
    field: 'my-radio-buttons',
    value: 'yes'
  }
}
```

- The above field (`my-text-field`) defines options that can be used in a HTML text input.
- name and id are both 'my-text-field'.
- `my-text-field` is a required field.
- `dependent` means this field is only required if the field with the name `my-radio-buttons` has the value 'yes'.

Note: `dependent` can either take a string or an object as its value. If the value is a string, its influencing value defaults to Boolean `true`.

### Email field

```js
'my-email-field': {
  validate: ['required', 'email'],
  type: 'email',
  label: 'Email'
}
```

- `my-email-field` is a required field and will validate against an email RegExp.
- `type: 'email'` can be used to add 'type="email"' to an HTML element.
- name and id are both 'my-email-field'.

### Checkbox field

```js
'my-checkbox-field': {
  toggle: 'myToggleField'
  validate: ['required'],
  className: ['inline']
}
```

- `my-checkbox-field` is a required field with the className `inline`.
- name and id are both 'my-checkbox-field'.
- `toggle` points to an id and can be used show the html field with "id='myToggleField'" when the checkbox is selected'.

## Dependency

- The property `dependent` can be used to create a dependency between two fields, where one field will only be validated if the field it is depedent on has the appropriate value.
- It can take as its argument, either take a string `dependent: my-field-name`,
- or an object: `dependent: { field: my-field-name, value: false }`
- If the argument is a string, then the value defaults to a Boolean `true`

The following example depicts two fields, where `my-email-field` will only be validated if `my-number-field` has a numeric value.

```js

'my-number-field': {
  validate: ['required', 'numeric']
},
'my-email-field': {
  validate: ['required', 'email'],
  type: 'email',
  label: 'Email',
  dependent: 'my-number-field'
}
```

In the following example `my-email-field` will only be validated if `my-number-field` has a numeric value of 7.

```js

'my-number-field': {
  validate: ['required', 'numeric']
},
'my-email-field': {
  validate: ['required', 'email'],
  type: 'email',
  label: 'Email',
  dependent: {
    field: 'my-number-field',
    value: 7
}
```
