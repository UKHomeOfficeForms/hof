/* eslint-disable max-len */

describe('frontend/toolkit', function () {
  beforeAll(function () {
    document.body.insertAdjacentHTML('beforeend', '<div id="test-container"/>');
  });

  beforeEach(function () {
    document.querySelector('#test-container').replaceChildren();
  });

  require('./helpers');
  require('./form-focus');
  require('./progressive-reveal');
  require('./validation');
  require('./character-count');
});
