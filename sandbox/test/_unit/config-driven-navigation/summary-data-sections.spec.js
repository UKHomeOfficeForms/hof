'use strict';

const sections = require('../../../../sandbox/apps/config-driven-navigation/sections/summary-data-sections');

describe('config-driven navigation summary data sections', () => {
  let req;

  beforeEach(() => {
    req = global.hof_request();
  });

  it('should omit unselected simple fields from the summary', () => {
    const nameField = sections.personalDetails.steps.find(step => step.field === 'name');

    req.sessionModel.set('selected-updates', ['surname']);

    global.should.not.exist(nameField.parse('Alice', req));
  });

  it('should return selected simple fields in the summary', () => {
    const nameField = sections.personalDetails.steps.find(step => step.field === 'name');

    req.sessionModel.set('selected-updates', ['name']);

    nameField.parse('Alice', req).should.equal('Alice');
  });

  it('should omit dob when that item was not selected', () => {
    const dobField = sections.personalDetails.steps.find(step => step.field === 'dob');

    req.sessionModel.set('selected-updates', ['name']);

    global.should.not.exist(dobField.parse('1990-01-01', req));
  });

  it('should render the aggregated surname summary when surname was selected', () => {
    const surnameSummaryField = sections.personalDetails.steps
      .find(step => step.field === 'previoussurnames');

    req.sessionModel.set('selected-updates', ['surname']);

    const value = surnameSummaryField.parse({
      aggregatedValues: [
        {
          fields: [
            { parsed: 'Smith' },
            { parsed: 'Jones' }
          ]
        },
        {
          fields: [
            { parsed: 'Taylor' }
          ]
        }
      ]
    }, req);

    value.should.equal('Smith\nJones\n - \nTaylor');
  });

  it('should omit the aggregated surname summary when surname was not selected', () => {
    const surnameSummaryField = sections.personalDetails.steps
      .find(step => step.field === 'previoussurnames');

    req.sessionModel.set('selected-updates', ['name']);

    global.should.not.exist(surnameSummaryField.parse({
      aggregatedValues: [
        {
          fields: [
            { parsed: 'Smith' }
          ]
        }
      ]
    }, req));
  });
});
