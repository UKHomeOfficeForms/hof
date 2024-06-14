'use strict';

module.exports = key => ({
  [`${key}-hour`]: {
    label: 'Hour',
    autocomplete: 'time-hour'
  },
  [`${key}-minute`]: {
    label: 'Minute',
    autocomplete: 'time-minute'
  }
});
