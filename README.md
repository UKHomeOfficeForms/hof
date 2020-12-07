# HOF (Home Office Forms) [![Build Status](https://travis-ci.org/UKHomeOfficeForms/hof-bootstrap.svg?branch=master)](https://travis-ci.org/UKHomeOfficeForms/hof-bootstrap) [![npm version](https://badge.fury.io/js/hof.svg)](https://badge.fury.io/js/hof) [![Known Vulnerabilities](https://snyk.io/test/npm/hof/badge.svg)](https://snyk.io/test/npm/hof)

HOF (Home Office Forms) is a framework designed to assist developers in creating form-based workflows in a rapid, repeatable and secure way. It aims to reduce simple applications as much as possible to being configuration-only.

## Resources

### HOF documentation

[https://ukhomeofficeforms.github.io/hof-guide/](https://ukhomeofficeforms.github.io/hof-guide/)

## Content Security Policy
### Inline JavaScript from 18.0.0
From version 18.0.0, unsafe-inline has been removed from the content security policy by default. This means scripts
must either be referenced using the src attribute, ```<script src='...'></script>``` or with a nonce value attribute. A nonce
value is generated for every request. You can add this to your own templates' inline scripts as needed:

```
<script {{#nonce}}nonce="{{nonce}}"{{/nonce}}>
...
</script>
```

### Built with HOF
 * https://github.com/UKHomeOffice/gro
 * https://github.com/UKHomeOffice/end-tenancy
 * [Firearms Licensing (Home Office)](https://github.com/UKHomeOffice/firearms)
 * [Contact UK Trade & Investment (UK Trade & Investment)](https://github.com/UKTradeInvestment/contact-ukti)
 * [Biometric Residence Permit (Home Office)](https://github.com/UKHomeOffice/brp_app)
 * [Report terrorist material (Home Office)](https://github.com/UKHomeOffice/rotm)
 * [UKVI Complaints (Home Office)](https://github.com/UKHomeOffice/Complaints)
