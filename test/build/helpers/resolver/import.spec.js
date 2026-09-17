'use strict';

const path = require('path');
const Import = require('../../../../build/helpers/resolver/import');

describe('resolver import', () => {
  ['hof', 'govuk_frontend_toolkit'].forEach(importUrl => {
    it(`recognises an unscoped package entrypoint: ${importUrl}`, () => {
      const imported = new Import(importUrl);

      imported.packageName().should.equal(importUrl);
      imported.isEntrypoint().should.equal(true);
    });
  });

  ['hof/frontend/themes/gov-uk/styles/govuk', 'hof\\frontend\\themes\\gov-uk\\styles\\govuk']
    .forEach(importUrl => {
      it(`parses an unscoped package path: ${importUrl}`, () => {
        const imported = new Import(importUrl);

        imported.packageName().should.equal('hof');
        imported.isEntrypoint().should.equal(false);
        imported.specifiedFilePath().should.equal(
          path.join('frontend', 'themes', 'gov-uk', 'styles', 'govuk')
        );
      });
    });

  ['@scope/package', '@scope\\package'].forEach(importUrl => {
    it(`parses a scoped package entrypoint: ${importUrl}`, () => {
      const imported = new Import(importUrl);

      imported.packageName().should.equal('@scope/package');
      imported.isEntrypoint().should.equal(true);
    });
  });

  ['@scope/package/styles/main', '@scope\\package\\styles\\main'].forEach(importUrl => {
    it(`parses a scoped package path: ${importUrl}`, () => {
      const imported = new Import(importUrl);

      imported.packageName().should.equal('@scope/package');
      imported.isEntrypoint().should.equal(false);
      imported.specifiedFilePath().should.equal(path.join('styles', 'main'));
    });
  });
});
