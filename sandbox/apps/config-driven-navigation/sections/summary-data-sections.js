const formatDate = date => {
  const PRETTY_DATE_FORMATTER = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  const dateObj = new Date(date);
  return PRETTY_DATE_FORMATTER.format(dateObj);
};

const hasSelectedUpdate = (updateKey, req) =>
  [].concat(req.sessionModel.get('selected-updates') || []).includes(updateKey);

const selectedValueOrOmit = updateKey => (value, req) =>
  hasSelectedUpdate(updateKey, req) ? value : null;

const formatFields = aggregator => {
  const items = aggregator?.aggregatedValues;
  if (!items?.length) {
    return null;
  }

  if (!items.every(item => Array.isArray(item?.fields))) {
    return null;
  }

  return items
    .map(({ fields }) =>
      fields
        .map(({ parsed }) => parsed)
        .filter(Boolean)
        .join('\n')
    )
    .join('\n - \n');
};

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
        parse: selectedValueOrOmit('name')
      },
      {
        step: '/surname',
        field: 'surname',
        parse: selectedValueOrOmit('surname')
      },
      {
        step: '/surname-summary',
        field: 'previoussurnames',
        changeLink: '/config-driven-navigation/surname-summary',
        parse: (value, req) => hasSelectedUpdate('surname', req)
          ? formatFields(value)
          : null
      },
      {
        step: '/dob',
        field: 'dob',
        parse: (value, req) => hasSelectedUpdate('dob', req) && value
          ? formatDate(value)
          : null
      }
    ]
  },
  contactDetails: {
    steps: [
      {
        step: '/address',
        field: 'current-house-number',
        parse: selectedValueOrOmit('address')
      },
      {
        step: '/address',
        field: 'current-street',
        parse: selectedValueOrOmit('address')
      },
      {
        step: '/address',
        field: 'current-townOrCity',
        parse: selectedValueOrOmit('address')
      },
      {
        step: '/address',
        field: 'current-county',
        parse: selectedValueOrOmit('address')
      },
      {
        step: '/has-postcode',
        field: 'has-postcode',
        parse: selectedValueOrOmit('address')
      },
      {
        step: '/postcode',
        field: 'postcode',
        dependsOn: 'has-postcode',
        parse: selectedValueOrOmit('address')
      },
      {
        step: '/email',
        field: 'email',
        parse: selectedValueOrOmit('email')
      },
      {
        step: '/phone',
        field: 'phone',
        parse: selectedValueOrOmit('phone')
      }
    ]
  }
};
