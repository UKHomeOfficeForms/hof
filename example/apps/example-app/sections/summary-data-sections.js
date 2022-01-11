const moment = require('moment');
const PRETTY_DATE_FORMAT = 'Do MMMM YYYY';

module.exports = {
  applicantsDetails: [
    'name',
    {
      field: 'dateOfBirth',
      parse: d => d && moment(d).format(PRETTY_DATE_FORMAT)
    }
  ],
  address: [
    'building',
    'street',
    'townOrCity',
    'postcode'
  ],
  income: [
    'incomeTypes'
  ],
  appealDetails: [
    'countryOfHearing'
  ],
  contactDetails: [
    'email',
    'phone'
  ],
  complaintDetails: [
    'complaintDetails'
  ],
  countrySelect: [
    'countrySelect'
  ]
};
