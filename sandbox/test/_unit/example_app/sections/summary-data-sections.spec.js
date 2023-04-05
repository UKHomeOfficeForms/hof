const sections = require('../../../../../sandbox/apps/sandbox/sections/summary-data-sections.js');
const pages = require('../../../../../sandbox/apps/sandbox/translations/src/en/pages.json');
const fields = require('../../../../../sandbox/apps/sandbox/fields.js');
const utilities = require('../../../helpers/utilities');

const mappedSections = utilities.mapSections(sections);
const areOrderedEqual = utilities.areOrderedEqual;
const containsAll = utilities.containsAll;

describe('Apply Summary Data Sections', () => {
  describe('Sections and Pages', () => {
    it('should have sections and page translations that correlate', () => {
      const sectionsKeys = Object.keys(sections).sort();
      const pagesSectionsKeys = Object.keys(pages.confirm.sections).sort();
      sectionsKeys.should.deep.equal(pagesSectionsKeys);
    });
  });

  describe('Section Primary Fields', () => {
    it("should check expected fields in applicant's details field", () => {
      const sectionFields = mappedSections.applicantsDetails;
      const expectedFields = [
        'name',
        'dateOfBirth'
      ];
      const result = areOrderedEqual(sectionFields, expectedFields);
      expect(result).to.be.true;
    });

    it('should check expected fields in address field', () => {
      const sectionFields = mappedSections.address;
      const expectedFields = [
        'building',
        'street',
        'townOrCity',
        'postcode'
      ];
      const result = areOrderedEqual(sectionFields, expectedFields);
      expect(result).to.be.true;
    });

    it('should check expected fields in income field', () => {
      const sectionFields = mappedSections.income;
      const expectedFields = [
        'incomeTypes'
      ];
      const result = areOrderedEqual(sectionFields, expectedFields);
      expect(result).to.be.true;
    });

    it('should check expected fields in appeal details field', () => {
      const sectionFields = mappedSections.appealDetails;
      const expectedFields = [
        'countryOfHearing',
        'appealStages'
      ];
      const result = areOrderedEqual(sectionFields, expectedFields);
      expect(result).to.be.true;
    });

    it('should check expected fields in contact details field', () => {
      const sectionFields = mappedSections.contactDetails;
      const expectedFields = [
        'email',
        'phone'
      ];
      const result = areOrderedEqual(sectionFields, expectedFields);
      expect(result).to.be.true;
    });

    it('should check expected fields in complaint details field', () => {
      const sectionFields = mappedSections.complaintDetails;
      const expectedFields = [
        'complaintDetails'
      ];
      const result = areOrderedEqual(sectionFields, expectedFields);
      expect(result).to.be.true;
    });

    it('should check expected fields in what happened field', () => {
      const sectionFields = mappedSections.whatHappened;
      const expectedFields = [
        'whatHappened'
      ];
      const result = areOrderedEqual(sectionFields, expectedFields);
      expect(result).to.be.true;
    });
  });

  describe('Sections and Fields', () => {
    it('applicantsDetails', () => {
      expect(containsAll(
        Object.keys(fields),
        mappedSections.applicantsDetails)
      ).to.be.true;
    });

    it('address', () => {
      expect(containsAll(
        Object.keys(fields),
        mappedSections.address)
      ).to.be.true;
    });

    it('income', () => {
      expect(containsAll(
        Object.keys(fields),
        mappedSections.income)
      ).to.be.true;
    });

    it('appealDetails', () => {
      expect(containsAll(
        Object.keys(fields),
        mappedSections.appealDetails)
      ).to.be.true;
    });

    it('contactDetails', () => {
      expect(containsAll(
        Object.keys(fields),
        mappedSections.contactDetails)
      ).to.be.true;
    });

    it('complaintDetails', () => {
      expect(containsAll(
        Object.keys(fields),
        mappedSections.complaintDetails)
      ).to.be.true;
    });

    it('whatHappened', () => {
      expect(containsAll(
        Object.keys(fields),
        mappedSections.whatHappened)
      ).to.be.true;
    });
  });
});
