'use strict';

const dayjs = require('dayjs');
const advancedFormat = require('dayjs/plugin/advancedFormat');

dayjs.extend(advancedFormat);

const DEFAULT_DATE_FORMAT = 'D MMMM YYYY';

const formatDate = (value, format = DEFAULT_DATE_FORMAT) => dayjs(value).format(format);

module.exports = {
  formatDate
};
