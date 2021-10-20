const moment = require('moment');
const PRETTY_DATE_FORMAT = 'Do MMMM YYYY';
const staticAppealStages = require('../lib/staticAppealStages');


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
    'countryOfHearing',
    {
      field: 'appealStages',
      parse: v => staticAppealStages.getstaticAppealStages().find(appealStage => appealStage.value === v).label
    }
  ],
  contactDetails: [
    'email',
    'phone'
  ],
  complaintDetails: [
    'complaintDetails'
  ]
};
