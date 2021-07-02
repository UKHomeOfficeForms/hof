/* eslint-disable */ 
'use strict';

const steps = require('../../');

Feature('First Step');

Before((
  I,
  firstPage
) => {
  I.visitPage(firstPage, steps);
});

Scenario('I see the correct fields on the page', (
  I,
  firstPage
) => {
  I.seeElements(firstPage.fields.name);
});

Scenario('I see an error if I submit the form without completing', (
  I,
  firstPage
) => {
  I.submitForm();
  I.seeErrors(firstPage.fields.name);
});

Scenario('I see an error if I submit the form with an invalid name', (
  I,
  firstPage
) => {
  I.fillField(firstPage.fields.name, firstPage.content.invalidName);
  I.submitForm();
  I.seeErrors(firstPage.fields.name);
});

Scenario('I am taken to step-two on a valid submission', (
  I,
  firstPage,
  secondPage
) => {
  I.fillField(firstPage.fields.name, firstPage.content.validName);
  I.submitForm();
  I.seeInCurrentUrl(secondPage.url);
});
