/* eslint-disable max-len */
const $ = require('jquery');

describe('frontend/toolkit', function () {
  beforeAll(function () {
    $(document.body).append($('<div id="test-container"/>'));
  });

  beforeEach(function () {
    $('#test-container').empty();
  });

  require('./helpers');
  require('./form-focus');
  require('./progressive-reveal');
  require('./validation');
  require('./character-count');
});
