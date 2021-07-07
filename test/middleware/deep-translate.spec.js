
'use strict';

const deepTranslate = require('../../middleware/deep-translate');

describe('deepTranslate middleware', () => {
  let req;
  let res;
  let locales;
  let middleware;
  let next;
  let translate;

  beforeEach(() => {
    req = {
      sessionModel: {
        get: sinon.stub()
      }
    };
    res = {};
    locales = {
      a: 'a shallow value',
      b: {
        c: {
          d: 'a deep value'
        }
      },
      'a-field': {
        label: {
          'dependent-field': {
            'first-value': 'Label to show if dependent-field is first-value',
            'second-value': 'Label to show if dependent-field is second-value'
          },
          default: 'This is the default label'
        }
      },
      'another-field': {
        header: {
          'dependent-field-1': {
            'correct-value': {
              'dependent-field-2': {
                'correct-value': 'This should be looked up'
              }
            }
          },
          default: 'This is another default label'
        }
      },
      'multi-value': {
        header: {
          'multi-value-field': {
            'value-1': '1',
            'value-1,value-2': '1 and 2',
            'value-1,value-3': '1 and 3',
            'value-1,value-2,value-3': '1, 2 and 3',
            'value-2': '2',
            'value-2,value-3': '2 and 3',
            'value-3': '3'
          }
        }
      },
      array: [
        'value-1',
        'value-2'
      ]
    };
    translate = key => key.split('.').reduce((ref, keyPart) => ref[keyPart], locales) || key;
    next = sinon.stub();
    middleware = deepTranslate({
      translate
    });
    middleware(req, res, next);
  });

  it('adds a translate function to req', () => {
    req.translate.should.be.ok;
  });

  it('adds a rawTranslate function to req', () => {
    req.rawTranslate.should.be.ok.and.be.equal(translate);
  });

  it('calls next', () => {
    next.should.have.been.calledOnce.and.calledWithExactly();
  });

  it('looks up a shallow locale', () => {
    req.translate('a').should.be.equal('a shallow value');
  });

  it('looks up a deep locale', () => {
    req.translate('b.c.d').should.be.equal('a deep value');
  });

  it('looks up the default value if a nested condition is not met', () => {
    req.translate('a-field.label').should.be.equal('This is the default label');
  });

  it('looks up the result if conditional is met', () => {
    req.sessionModel.get.withArgs('dependent-field').returns('first-value');
    req.translate('a-field.label')
      .should.be.equal('Label to show if dependent-field is first-value');
  });

  it('looks up the result if alternative conditional is met', () => {
    req.sessionModel.get.withArgs('dependent-field').returns('second-value');
    req.translate('a-field.label')
      .should.be.equal('Label to show if dependent-field is second-value');
  });

  it('looks up nested conditions', () => {
    req.sessionModel.get.withArgs('dependent-field-1').returns('correct-value');
    req.sessionModel.get.withArgs('dependent-field-2').returns('correct-value');
    req.translate('another-field.header').should.be.equal('This should be looked up');
  });

  it('returns array if looked up', () => {
    req.translate('array').should.be.an('array');
  });

  describe('Multi value fields', () => {
    it('returns 1, 2 and 3 if field has all 3 values', () => {
      req.sessionModel.get.withArgs('multi-value-field').returns([
        'value-1',
        'value-2',
        'value-3'
      ]);
      req.translate('multi-value.header').should.be.equal('1, 2 and 3');
    });

    it('returns 1 and 2 if field has value-1 and value-2', () => {
      req.sessionModel.get.withArgs('multi-value-field').returns([
        'value-1',
        'value-2'
      ]);
      req.translate('multi-value.header').should.be.equal('1 and 2');
    });

    it('returns 1 and 3 if field has value-1 and value-3', () => {
      req.sessionModel.get.withArgs('multi-value-field').returns([
        'value-1',
        'value-3'
      ]);
      req.translate('multi-value.header').should.be.equal('1 and 3');
    });

    it('returns 1 if field has value-1', () => {
      req.sessionModel.get.withArgs('multi-value-field').returns('value-1');
      req.translate('multi-value.header').should.be.equal('1');
    });

    it('returns 2 if field has value-2', () => {
      req.sessionModel.get.withArgs('multi-value-field').returns('value-2');
      req.translate('multi-value.header').should.be.equal('2');
    });

    it('returns 2 and 3 if field has value-2 and value-3', () => {
      req.sessionModel.get.withArgs('multi-value-field').returns([
        'value-2',
        'value-3'
      ]);
      req.translate('multi-value.header').should.be.equal('2 and 3');
    });

    it('returns 3 if field has value-3', () => {
      req.sessionModel.get.withArgs('multi-value-field').returns('value-3');
      req.translate('multi-value.header').should.be.equal('3');
    });
  });
});
