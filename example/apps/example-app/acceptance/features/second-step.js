/* eslint-disable */ 
'use strict';

const steps = require('../../');

Feature('Second Step');

Before((
  I,
  secondPage
) => {
  I.visitPage(secondPage, steps);
});

Scenario('The correct fields are on the page', (
  I,
  secondPage
) => {
  I.seeElements([
    secondPage.fields.email,
    secondPage.fields.phone
  ]);
});

Scenario('I see the name I entered on the first step', function* (
  I,
  firstPage
) {
  yield I.setSessionData(steps.name, {
    'your-name': firstPage.content.validName
  });
  yield I.refreshPage();
  I.see(firstPage.content.validName);
});

Scenario('I see errors if I submit the form without completing', (
  I,
  secondPage
) => {
  I.submitForm();
  I.seeErrors([
    secondPage.fields.email,
    secondPage.fields.phone
  ]);
});

Scenario('I see an error if I enter an invalid email address', (
  I,
  secondPage
) => {
  I.fillField(secondPage.fields.email, secondPage.content.invalidEmail);
  I.submitForm();
  I.seeErrors(secondPage.fields.email);
});

Scenario('I am taken to the third step on a valid submission', (
  I,
  secondPage,
  thirdPage
) => {
  I.fillField(secondPage.fields.email, secondPage.content.validEmail);
  I.fillField(secondPage.fields.phone, secondPage.content.phone);
  I.submitForm();
  I.seeInCurrentUrl(thirdPage.url);
});
