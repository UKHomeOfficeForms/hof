/* eslint-disable no-undef */
'use strict';

// TODO: update package.json(s)

function hideFallbackContent(containerId) {
  const container = document.getElementById(containerId);
  if (container === null) return;
  const fallbackContent = container.getElementsByClassName('js-disabled');
  for (let i = 0; i < fallbackContent.length; i++) {
    fallbackContent[i].style.display = 'none';
  }
}

function showInteractiveContent(containerId) {
  const container = document.getElementById(containerId);
  if (container === null) return;
  const interactiveContent = container.getElementsByClassName('js-enabled');
  for (let i = 0; i < interactiveContent.length; i++) {
    interactiveContent[i].style.display = 'block';
  }
}

function setCookiePreferences(preferences) {
  GOVUK.cookie('cookie_preferences', JSON.stringify(preferences), { days: 30 });

  if (!preferences.usage) {
    GOVUK.cookie('_ga', null);
    GOVUK.cookie('_gat', null);
    GOVUK.cookie('_gid', null);
  }
}

function showCookieBannerSubmitted() {
  document.getElementById('cookie-banner-info').style.display = 'none';
  document.getElementById('cookie-banner-actions').style.display = 'none';
  let cookieBannerSubmitted;
  const cookieBannerDiv = document.getElementById('cookie-banner-submitted-accepted');
  if (cookieBannerDiv.dataset.acceptCookies === 'true') {
    cookieBannerSubmitted = document.getElementById('cookie-banner-submitted-accepted');
  } else {
    cookieBannerSubmitted = document.getElementById('cookie-banner-submitted-rejected');
  }
  cookieBannerSubmitted.style.display = 'block';
  cookieBannerSubmitted.focus();
}

function hideCookieBanner() {
  document.getElementById('cookie-banner').style.display = 'none';
}

function initialiseBannerButtons() {
  const acceptedCookieBannerDiv = document.getElementById('cookie-banner-submitted-accepted');
  document.getElementById('accept-cookies-button').addEventListener('click', function () {
    setCookiePreferences({essential: true, usage: true});
    showCookieBannerSubmitted();
    sessionStorage.setItem('reloading', 'true');
    window.location = document.URL;
  });

  document.getElementById('reject-cookies-button').addEventListener('click', function () {
    setCookiePreferences({ essential: true, usage: false });
    acceptedCookieBannerDiv.dataset.acceptCookies = 'false';
    showCookieBannerSubmitted();
  });

  document.getElementById('hide-accept-cookie-banner').addEventListener('click', hideCookieBanner);

  document.getElementById('hide-reject-cookie-banner').addEventListener('click', hideCookieBanner);
}

function initialiseCookieBanner() {
  const preferences = GOVUK.cookie('cookie_preferences');

  if (preferences !== null) {
    return;
  }

  // the default cookie message container from hof-govuk-template
  const bannerContainer = document.getElementById('global-cookie-message');

  // the cookie banner that will replace the container's default content if using google analytics
  const cookieBanner = document.getElementById('cookie-banner');

  if (bannerContainer !== null && cookieBanner !== null) {
    hideFallbackContent('global-cookie-message');
    showInteractiveContent('global-cookie-message');
    bannerContainer.style.display = 'block';
    initialiseBannerButtons();
  }
}

function handleSaveSettings(e) {
  e.preventDefault();
  setCookiePreferences({ essential: true, usage: document.getElementById('radio-1').checked });

  const cookieNotification = document.getElementById('cookie-notification');
  const cookieBanner = document.getElementById('cookie-banner');

  if (cookieBanner !== null) {
    cookieBanner.style.display = 'none';
  }

  if (cookieNotification !== null) {
    cookieNotification.style.display = 'block';
    cookieNotification.focus();
  }
}

function initialiseFormControls() {
  const preferences = JSON.parse(GOVUK.cookie('cookie_preferences'));
  let usage;

  if (preferences !== null && preferences.usage !== undefined && typeof preferences.usage === 'boolean') {
    usage = preferences.usage;
  } else {
    usage = false;
  }

  document.getElementById('radio-1').checked = usage;
  document.getElementById('radio-2').checked = !usage;
  document.getElementById('save-cookie-settings').addEventListener('click', handleSaveSettings);
}

function initialiseCookiePage() {
  const shouldDisplayCookieControls = document.getElementById('cookie-settings') !== null;

  if (shouldDisplayCookieControls) {
    hideFallbackContent('cookie-settings');
    showInteractiveContent('cookie-settings');
    initialiseFormControls();
  }
}

function onLoad() {
  window.onload = function () {
    const reloading = sessionStorage.getItem('reloading');
    if (reloading) {
      sessionStorage.removeItem('reloading');

      const bannerContainer = document.getElementById('global-cookie-message');
      const cookieBanner = document.getElementById('cookie-banner');

      if (bannerContainer !== null && cookieBanner !== null) {
        bannerContainer.style.display = 'block';
      }
      initialiseBannerButtons();
      showCookieBannerSubmitted();
    }
  };
}

module.exports = {
  initialiseCookieBanner: initialiseCookieBanner,
  initialiseCookiePage: initialiseCookiePage,
  onLoad: onLoad
};
