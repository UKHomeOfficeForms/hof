var $ = require('jquery');

describe('hmpo', function () {
  before(function () {
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
