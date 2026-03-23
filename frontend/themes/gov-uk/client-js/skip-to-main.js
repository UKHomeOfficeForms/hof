const skipToMain = function () {
  const skipToMainLink = document.getElementsByClassName('skip-to-main');
  const firstControlId = skipToMainLink[0].hash.split('#')[1] ? skipToMainLink[0].hash.split('#')[1] : 'main-content';
  if(firstControlId === 'main-content') {
    skipToMainLink[0].setAttribute('href', '#main-content');
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
