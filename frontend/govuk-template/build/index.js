'use strict';

const Hogan = require('hogan.js');
const fs = require('fs');
const path = require('path');
const govukConfig = require('./config');

function addNonceValueAttributeToInlineScripts(compiledTemplateString) {
  const scriptNonceValue = '{{#nonce}}nonce="{{nonce}}"{{/nonce}}';
  return compiledTemplateString.replace(/(<script)((?![^>]+src).*?)>/g,
    `$1$2 ${scriptNonceValue}>`);
}

module.exports = () => {
  const template = require.resolve('govuk_template_mustache/views/layouts/govuk_template.html');

  const govukTemplate = fs.readFileSync(template, { encoding: 'utf-8' });
  const compiledTemplate = Hogan.compile(govukTemplate).render(govukConfig);
  const parsedTemplate = addNonceValueAttributeToInlineScripts(compiledTemplate);
  const output = path.resolve(__dirname, '../govuk_template.html');

  fs.writeFileSync(output, parsedTemplate, { encoding: 'utf-8' });
};
