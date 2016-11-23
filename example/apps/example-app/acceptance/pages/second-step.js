'use strict';

module.exports = {
  url: 'second-step',
  fields: {
    email: '#email-address',
    phone: '#phone-number'
  },
  content: {
    invalidEmail: 'aaaaa',
    validEmail: 'sterling@archer.com',
    phone: '01234567890 - only text'
  }
};
