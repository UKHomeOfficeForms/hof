const skipToMain = function () {
  const skipToMainLink = document.getElementById('skip-to-main');
  const firstControlId = skipToMainLink.hash.split('#')[1] ? skipToMainLink.hash.split('#')[1] : 'main-content';
  if(firstControlId === 'main-content') {
    skipToMainLink.setAttribute('href', '#main-content');
  }
  if(firstControlId) {
    // eslint-disable-next-line no-unused-vars
    skipToMainLink.onclick = function (e) {
      // here timeout added just to make this functionality asynchronous
      // to focus on form as well as non form contents
      setTimeout(() => {
        const firstControl = document.getElementById(firstControlId);
        firstControl.focus();
      }, 10);
    };
  }
};
skipToMain();
