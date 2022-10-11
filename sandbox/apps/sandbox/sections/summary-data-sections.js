const moment = require('moment');
const PRETTY_DATE_FORMAT = 'Do MMMM YYYY';
const APPEAL_STAGES = require('../lib/staticAppealStages').getstaticAppealStages();
const _ = require('lodash');

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
      parse: v => _.get(_.find(APPEAL_STAGES, stage => stage.value === v), 'label', '')
    }
  ],
  contactDetails: [
    'email',
    'phone'
  ],
  countrySelect: [
    'countrySelect'
  ],
  complaintDetails: [
    'complaintDetails'
  ],
  whatHappened: [
    'whatHappened'
  ]
};
