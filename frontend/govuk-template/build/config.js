'use strict';
/* eslint max-len: 0 */
module.exports = {
  htmlLang: '{{ htmlLang }}',
  assetPath: '{{ govukAssetPath }}',
  themeColour: '#1d70b8',
  afterHeader: '{% block afterHeader %}{% endblock %}',
  bodyClasses: '{% set bodyClasses %}{% endset%}',
  bodyStart: '{% block bodyStart %}{% endblock %}',
  bodyEnd: '{% block bodyEnd %}{% endblock %}',
  content: '{% block main %}{% endblock %}',
  cookieMessage: '{% block cookieMessage %}{% endblock %}',
  footerSupportLinks: '{% block footerSupportLinks %}{% endblock %}',
  footerTop: '{% block footerTop %}{% endblock %}',
  head: '{% block head %}{% endblock %}',
  headerClass: '{% block headerClass %}{% endblock %}',
  homepageUrl: '{{ homepageUrl | default("https://www.gov.uk") }}',
  logoLinkTitle: '{{$logoLinkTitle}}Go to the GOV.UK homepage{{/logoLinkTitle}}',
  insideHeader: '{% block insideHeader %}{% endblock %}',
  pageTitle: '{% block pageTitle %}{% endblock %}',
  propositionHeader: '{% block propositionHeader %}{% endblock %}',
  globalHeaderText: '{{$globalHeaderText}}GOV.UK{{/globalHeaderText}}',
  licenceMessage: '{{$licenceMessage}}All content is available under the <a href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/" id="open-government-licence" class="govuk-footer__link" target="_blank" rel="license">Open Government Licence v3.0</a>, except where otherwise stated{{/licenceMessage}}',
  crownCopyrightMessage: '{{$crownCopyrightMessage}}© Crown copyright{{/crownCopyrightMessage}}'
};
