const sections = require('../../../../../example/apps/example-app/sections/summary-data-sections.js');
const pages = require('../../../../../example/apps/example-app/translations/src/en/pages.json');
const utilities = require('../../../helpers/utilities');


const mappedSections = utilities.mapSections(sections);
const areOrderedEqual = utilities.areOrderedEqual;

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
  });
});
