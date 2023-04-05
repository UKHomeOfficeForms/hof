'use strict';
/* eslint no-process-env: "off" */

const sanitisationBlacklistArray = {
  // Input will be sanitised using the below rules
  // Each one is an array which will run sequentially
  // Some have multiple steps which allow us to remove dups then append the suffix
  // Useful for ensuring we're not re-sanitising the same input multiple times (and appending extra hypens each time)
  // The key is what we're sanitising out
  // The regex is the rule we used to find them (note some dictate repeating characters)
  // And the replace is what we're replacing that pattern with. Usually nothing sometimes a
  // single character or sometimes a single character followed by a "-"
  '/*': [{ regex: '\/\\*', replace: '-' }],
  '*/': [{ regex: '\\*\\/', replace: '-' }],
  '|': [{ regex: '\\|', replace: '-' }],
  '&&': [{ regex: '&&+', replace: '&' }],
  '@@': [{ regex: '@@+', replace: '@' }],
  '/..;/': [{ regex: '/\\.\\.;/', replace: '-' }], // Purposely input before ".." as they conflict
  // '..': [{ regex: '\\.\\.+', replace: '.' }], // Agreed to disable this rule for now unless its specifically required
  '/etc/passwd': [{ regex: '\/etc\/passwd', replace: '-' }],
  'c:\\': [{ regex: 'c:\\\\', replace: '-' }],
  'cmd.exe': [{ regex: 'cmd\\.exe', replace: '-' }],
  '<': [{ regex: '<+', replace: '<' }, { regex: '<(?!-)', replace: '<-' }],
  '>': [{ regex: '>+', replace: '>' }, { regex: '>(?!-)', replace: '>-' }],
  '[': [{ regex: '\\[+', replace: '[' }, { regex: '\\[(?!-)', replace: '[-' }],
  ']': [{ regex: '\\]+', replace: ']-' }, { regex: '\\](?!-)', replace: ']-' }],
  '~': [{ regex: '~+', replace: '~' }, { regex: '~(?!-)', replace: '~-' }],
  '&#': [{ regex: '&#', replace: '-' }],
  '%U': [{ regex: '%U', replace: '-' }]
};

module.exports = sanitisationBlacklistArray;
