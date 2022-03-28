'use strict';
/* eslint no-process-env: "off" */

const sanitisationBlacklistArray = {
    // Input will be sanitised using the below rules
    // The key is what we're sanitising out
    // The regex is the rule we used to find them (note some dictate repeating characters)
    // And the replace is what we're replacing that pattern with. Usually nothing sometimes a
    // single character or sometimes a single character followed by a "-"
    '/*': { regex: '\/\\*', replace: '' },
    '*/': { regex: '\\*\\/', replace: '' },
    '|': { regex: '\\|', replace: '' },
    '&&': { regex: '&&+', replace: '&' },
    '@@': { regex: '@@+', replace: '@' },
    '/..;/': { regex: '/\\.\\.;/', replace: '' }, // Purposely input before ".." as they conflict
    '..': { regex: '\\.\\.+', replace: '.' },
    '/etc/passwd': { regex: '\/etc\/passwd', replace: '' },
    'c:\\': { regex: 'c:\\\\', replace: '' },
    'cmd.exe': { regex: 'cmd\\.exe', replace: '' },
    '<': { regex: '<', replace: '<-' },
    '>': { regex: '>', replace: '>-' },
    '[': { regex: '\\[+', replace: '[-' },
    ']': { regex: '\\]+', replace: ']-' },
    '~': { regex: '~', replace: '~-' },
    '&#': { regex: '&#', replace: '&#-' },
    '%U': { regex: '%U', replace: '%U-' }
};

module.exports = sanitisationBlacklistArray;