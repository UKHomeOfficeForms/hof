'use strict';

const Formatters = require('../../../controller').formatters;

function testStringFormatter(name, values) {
  describe(name, () => {
    const fn = Formatters[name];
    it('passes through non-string', () => {
      fn(0).should.equal(0);
      fn(false).should.equal(false);
      expect(fn(null)).to.equal(null);
      expect(fn(undefined)).to.be.undefined;
    });

    Object.keys(values).forEach(input => {
      const output = values[input];
      it('formats "' + input + '"" to "' + output + '"', () => {
        fn(input).should.equal(output);
      });
    });
  });
}

describe('Formatters', () => {

  describe('boolean', () => {
    it('formats inputs correctly', () => {
      Formatters.boolean(true).should.equal(true);
      Formatters.boolean('true').should.equal(true);
      Formatters.boolean(false).should.equal(false);
      Formatters.boolean('false').should.equal(false);
      expect(Formatters.boolean('other')).to.be.undefined;
      expect(Formatters.boolean(null)).to.be.undefined;
      expect(Formatters.boolean(undefined)).to.be.undefined;
      expect(Formatters.boolean(1234)).to.be.undefined;
    });
  });

  testStringFormatter('trim', {
    'nospace': 'nospace',
    '  lspace': 'lspace',
    'rspace  ': 'rspace',
    ' mid space ': 'mid space'
  });

  testStringFormatter('uppercase', {
    'lowercase': 'LOWERCASE',
    'UPPERCASE': 'UPPERCASE',
    'MixedCase': 'MIXEDCASE'
  });

  testStringFormatter('lowercase', {
    'lowercase': 'lowercase',
    'UPPERCASE': 'uppercase',
    'MixedCase': 'mixedcase'
  });

  testStringFormatter('removespaces', {
    'nospace': 'nospace',
    '  lspace': 'lspace',
    'rspace  ': 'rspace',
    ' mid space ': 'midspace',
    ' multiple  \t spaces ': 'multiplespaces'
  });

  testStringFormatter('singlespaces', {
    'nospace': 'nospace',
    '  lspace': ' lspace',
    'rspace  ': 'rspace ',
    ' mid space ': ' mid space ',
    ' multiple  \t spaces ': ' multiple spaces '
  });

  testStringFormatter('hyphens', {
    'nohyphen': 'nohyphen',
    'hyphen–one': 'hyphen-one',
    'hyphen—two': 'hyphen-two',
    '-—–—-multiple-—–—-hyphens-—–—-': '-multiple-hyphens-'
  });

  testStringFormatter('removeroundbrackets', {
    'nobrackets': 'nobrackets',
    '(brackets)': 'brackets'
  });

  testStringFormatter('removehyphens', {
    'nohyphen': 'nohyphen',
    'hyphen–one': 'hyphenone',
    'hyphen—two': 'hyphentwo',
    '-—–—-multiple-—–—-hyphens-—–—-': 'multiplehyphens'
  });

  testStringFormatter('removeslashes', {
    'noslashes': 'noslashes',
    '/forward/slashes': 'forwardslashes',
    '\\back\\slashes': 'backslashes'
  });

  testStringFormatter('ukphoneprefix', {
    '07987654321': '07987654321',
    '+447987654321': '07987654321',
    '+4407987654321': '07987654321',
    '+44(0)7987654321': '07987654321',
    '+44(07987654321': '07987654321',
    '+440)7987654321': '07987654321',
    '+44()7987654321': '07987654321'
  });

  describe('base64decode', () => {
    it('decodes base64 correctly', () => {
      Formatters.base64decode('YWJjMTIz').should.equal('abc123');
    });
  });

});
