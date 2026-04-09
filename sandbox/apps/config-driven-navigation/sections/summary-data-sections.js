const formatDate = date => {
  const PRETTY_DATE_FORMATTER = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  const dateObj = new Date(date);
  return PRETTY_DATE_FORMATTER.format(dateObj);
};

const valueOrNoChange = value => value ?? 'No change';

/*

Alternative way of defining summary data sections, using an object with section names as
keys and arrays of field definitions as values. without the 'steps' key. This is a simpler format, but
less flexible as it doesn't allow for defining step-specific behaviour such as 'dependsOn' or 'parse'
at the field level.

module.exports = {
  personalDetails: [
    'name',
    'surname',
    {
      field: 'dob',
      parse: value => value && formatDate(value)
    }
  ],
  contactDetails: [
    'current-house-number',
    'current-street',
    'current-townOrCity',
    'current-county',
    'has-postcode',
    {
      field: 'postcode',
      dependsOn: 'has-postcode'
    },
    'email',
    'phone'
  ]
};

*/
module.exports = {
  personalDetails: {
    steps: [
      {
        step: '/name',
        field: 'name',
        parse: value => valueOrNoChange(value)
      },
      {
        step: '/surname',
        field: 'surname',
        parse: value => valueOrNoChange(value)
      },
      {
        step: '/dob',
        field: 'dob',
        parse: value => value ? formatDate(value) : 'No change'
      }
    ]
  },
  contactDetails: {
    steps: [
      {
        step: '/address',
        field: ['current-house-number'],
        parse: value => valueOrNoChange(value)
      },
      {
        step: '/address',
        field: ['current-street'],
        parse: value => valueOrNoChange(value)
      },
      {
        step: '/address',
        field: ['current-townOrCity'],
        parse: value => valueOrNoChange(value)
      },
      {
        step: '/address',
        field: ['current-county'],
        parse: value => valueOrNoChange(value)
      },
      {
        step: '/has-postcode',
        field: 'has-postcode',
        parse: value => valueOrNoChange(value)
      },
      {
        step: '/postcode',
        field: 'postcode',
        dependsOn: 'has-postcode'
      },
      {
        step: '/email',
        field: 'email',
        parse: value => valueOrNoChange(value)
      },
      {
        step: '/phone',
        field: 'phone',
        parse: value => valueOrNoChange(value)
      }
    ]
  }
};
