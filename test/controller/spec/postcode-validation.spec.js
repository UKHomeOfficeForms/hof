'use strict';

const Validators = require('../../../controller').validators;

const PostcodeData = require('../helpers/postcodes');

const isCoverageTest = require.cache[require.resolve('nyc')];
const describeUnlessCoverage = isCoverageTest ? describe.skip : describe;

describe('Postcode validation', () => {
  it('correctly validates empty string', () => {
    Validators.postcode('').should.be.ok;
  });

  it('correctly rejects invalid postcodes', () => {
    Validators.postcode('A11AA A11AA').should.not.be.ok;
    Validators.postcode('N443 6DFG').should.not.be.ok;
    Validators.postcode('ABCD1234').should.not.be.ok;
  });

  describeUnlessCoverage('Full postcode test - loads full UK postcode database, may take some time', () => {
    let testData;

    const test = pc => {
      try {
        Validators.postcode(pc).should.be.ok;
      } catch (e) {
        // echo out the failing postcode
        global.console.error('Failed postcode:', pc);
        throw e;
      }
    };

    before(done => {
      PostcodeData.load((err, data) => {
        testData = data;
        done(err);
      });
    });

    it('correctly validates uk postcodes with a single space', () => {
      testData.forEach(testPostcode => {
        const pc = testPostcode.replace(/ \s+/, ' ');
        test(pc);
      });
    });

    it('correctly validates uk postcodes with no spaces', () => {
      testData.forEach(testPostcode => {
        const pc = testPostcode.replace(/\s+/g, '');
        test(pc);
      });
    });
  });
});
