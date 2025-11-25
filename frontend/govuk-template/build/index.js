// 'use strict';

// const Hogan = require('hogan.js');
// const fs = require('fs');
// const path = require('path');
// const govukConfig = require('./config');

// function addNonceValueAttributeToInlineScripts(compiledTemplateString) {
//   const scriptNonceValue = '{{#nonce}}nonce="{{nonce}}"{{/nonce}}';
//   return compiledTemplateString.replace(/(<script)((?![^>]+src).*?)>/g,
//     `$1$2 ${scriptNonceValue}>`);
// }

// module.exports = () => {
//   const template = require.resolve('./govuk_template.html');

//   const govukTemplate = fs.readFileSync(template, { encoding: 'utf-8' });
//   const compiledTemplate = Hogan.compile(govukTemplate).render(govukConfig);
//   const parsedTemplate = addNonceValueAttributeToInlineScripts(compiledTemplate);
//   const output = path.resolve(__dirname, '../govuk_template_generated.html');

//   fs.writeFileSync(output, parsedTemplate, { encoding: 'utf-8' });
// };



// 'use strict';

// const nunjucks = require('nunjucks');
// const fs = require('fs');
// const path = require('path');
// const govukConfig = require('./config');

// function addNonceValueAttributeToInlineScripts(compiledTemplateString) {
//   const scriptNonceValue = '{% if nonce %}nonce="{{ nonce }}"{% endif %}';
//   return compiledTemplateString.replace(/(<script)((?![^>]+src).*?)>/g,
//     `$1$2 ${scriptNonceValue}>`);
// }

// module.exports = () => {
//   const template = require.resolve('./govuk_template.html');

//   const govukTemplate = fs.readFileSync(template, { encoding: 'utf-8' });
//   const compiledTemplate = nunjucks.renderString(govukTemplate, govukConfig);
//   const parsedTemplate = addNonceValueAttributeToInlineScripts(compiledTemplate);
//   const output = path.resolve(__dirname, '../govuk_template_generated.html');

//   fs.writeFileSync(output, parsedTemplate, { encoding: 'utf-8' });
// };

'use strict';

const nunjucks = require('nunjucks');
const fs = require('fs');
const path = require('path');
const govukConfig = require('./config');

function addNonceValueAttributeToInlineScripts(compiledTemplateString) {
  const scriptNonceValue = '{% if nonce %}nonce="{{ nonce }}"{% endif %}';
  return compiledTemplateString.replace(/(<script)((?![^>]+src)[\s\S]*?)>/gi,
    `$1$2 ${scriptNonceValue}>`);
}

module.exports = () => {
  const templatePath = path.resolve(__dirname, './govuk_template.html');

  // read raw template source (do NOT render here)
  const govukTemplate = fs.readFileSync(templatePath, { encoding: 'utf-8' });

  // insert the Nunjucks snippet into inline <script> tags (still keeps Nunjucks tags)
  const parsedTemplate = addNonceValueAttributeToInlineScripts(govukTemplate);

  // write the processed template (still contains Nunjucks tags like {{ head }} and {% if nonce %}...)
  const output = path.resolve(__dirname, '../govuk_template_generated.html');

  fs.writeFileSync(output, parsedTemplate, { encoding: 'utf-8' });
};
