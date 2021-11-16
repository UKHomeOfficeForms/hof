const { Given, Then } = require('@cucumber/cucumber');
const expect = require('chai').expect;
const World = require('../test.setup.js');
const config = require('../../../config');
const domain = config.hosts.acceptanceTests;
Given('I start the {string} application journey', async function (subApp) {
  this.subApp = subApp === 'base' ? '' : `/${subApp}`;
  await this.page.goto(`${domain}${this.subApp}`);
}.bind(World));
Then('I select {string}', async function (name) {
  await this.page.click(`text=${name}`);
}.bind(World));
Then('I check {string}', async function (name) {
  await this.page.check(`#${name}`);
}.bind(World));
Then('I choose {string}', async function (name) {
  await this.page.click(`text=${name}`);
}.bind(World));
Then('I change {string}', async function (name) {
  await this.page.click(`text=Change ${name}`);
}.bind(World));
Then('I delete {string}', async function (name) {
  await this.page.click(`text=Delete ${name}`);
}.bind(World));
Then('I click the {string} button', async function (name) {
  await this.page.click(`text=${name}`);
}.bind(World));
Then('I continue to the next step', { timeout: 4 * 5000 }, async function () {
  await this.page.click('input[type="submit"]');
}.bind(World));
Then('I fill {string} with {string}', async function (field, value) {
  await this.page.fill(`input[name="${field}"]`, value);
}.bind(World));
Then('I fill {string} text area with {string}', async function (field, value) {
  await this.page.fill(`textarea[name="${field}"]`, value);
}.bind(World));
Then('I fill the date {string} with {string}', async function (field, date) {
  const dateArr = date.split('-');
  await this.page.fill(`input[name="${field}-day"]`, dateArr[0]);
  await this.page.fill(`input[name="${field}-month"]`, dateArr[1]);
  await this.page.fill(`input[name="${field}-year"]`, dateArr[2]);
}.bind(World));
Then('I enter a date of birth for a {int} year old', async function (years) {
  const now = new Date();
  await this.page.fill('input[name="dateOfBirth-day"]', now.getUTCDate().toString());
  await this.page.fill('input[name="dateOfBirth-month"]', (now.getUTCMonth() + 1).toString());
  await this.page.fill('input[name="dateOfBirth-year"]', (now.getUTCFullYear() - years).toString());
}.bind(World));
Then('I enter a {string} date of birth for a {int} year old', async function (field, years) {
  const now = new Date();
  await this.page.fill(`input[name="${field}DateOfBirth-day"]`, now.getUTCDate().toString());
  await this.page.fill(`input[name="${field}DateOfBirth-month"]`, (now.getUTCMonth() + 1).toString());
  await this.page.fill(`input[name="${field}DateOfBirth-year"]`, (now.getUTCFullYear() - years).toString());
}.bind(World));
Then('I should be on the {string} page showing {string}', async function (uri, heading) {
  await this.page.waitForSelector('body', { timeout: 15000 });
  expect(new URL(await this.page.url()).pathname).to.eql(`${this.subApp}/${uri}`);
  expect(await this.page.innerText('body')).to.include(heading);
}.bind(World));
Then('I should see {string} on the page', async function (content) {
  await this.page.waitForSelector('body', { timeout: 15000 });
  expect(await this.page.innerText('body')).to.include(content);
}.bind(World));
Then('I should see the {string} error', async function (content) {
  await this.page.waitForSelector('body', { timeout: 15000 });
  expect(await this.page.innerText('.validation-summary.error-summary')).to.include(content);
}.bind(World));
Then('I select {string} and {string}', async function (field, value) {
  await this.page.selectOption(`select#${field}`, { label: `${value}`});
  expect(await this.page.innerText('body')).to.include(value);
}.bind(World));
