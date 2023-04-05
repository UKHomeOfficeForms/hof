@feature @example_app @validations
Feature: validations
  A user should see the appropriate validation error messages for each page

  @basic_form
  Scenario: Full Basic Form Submission
    Given I start the 'base' application journey
    Then I continue to the next step
    Then I should see the 'Select an option below and press continue' error
    Then I choose 'Basic form'
    Then I continue to the next step
    Then I click the 'Continue' button
    Then I should see the 'Enter your full name' error
    Then I fill 'name' with 'Jane Doe'
    Then I click the 'Continue' button
    Then I click the 'Continue' button
    Then I should see the 'Enter your date of birth in the correct format; for example, 31 10 1990' error
    Then I fill the date 'dateOfBirth' with '1-1-1899'
    Then I click the 'Continue' button
    Then I should see the 'Enter a date after 1 1 1900' error
    Then I fill the date 'dateOfBirth' with '1-1-3000'
    Then I click the 'Continue' button
    Then I should see the 'Enter a date that is in the past' error
    Then I enter a date of birth for a 30 year old
    Then I click the 'Continue' button
    Then I click the 'Continue' button
    Then I should see the 'Enter details of your building and street' error
    Then I should see the 'Enter a town or city' error
    Then I should see the 'Enter your postcode' error
    Then I fill 'building' with '10 Downing Street'
    Then I fill 'townOrCity' with 'London3'
    Then I fill 'postcode' with 'W12 3DE'
    Then I click the 'Continue' button
    Then I should see the 'Enter a town or city without including digits' error
    Then I fill 'townOrCity' with 'London'
    Then I click the 'Continue' button
    Then I click the 'Continue' button
    Then I should see the 'Select all options that apply to you.' error
    Then I select 'Salary' 
    Then I select 'Child Benefit' 
    Then I click the 'Continue' button
    Then I click the 'Continue' button
    Then I should see the 'Select where the appeal hearing is to be held' error
    Then I select 'England and Wales'
    Then I click the 'Continue' button
    Then I click the 'Continue' button
    Then I should see the 'Enter your email address in the correct format' error
    Then I fill 'email' with '=testemail.com'
    Then I click the 'Continue' button
    Then I should see the 'Enter your email address in the correct format' error
    Then I fill 'email' with 'test@email.com'
    Then I click the 'Continue' button
    Then I click the 'Continue' button
    Then I should see the 'Enter your phone number' error
    Then I fill 'phone' with '020 0000 000000'
    Then I click the 'Continue' button
    Then I should see the 'Enter your phone number' error
    Then I fill 'phone' with '020 0000 0000'
    Then I click the 'Continue' button
    Then I should be on the 'confirm' page showing 'Check your answers before submitting your application.'
    Then I click the 'Confirm submission' button
    Then I should see 'Application sent' on the page
    Then I click the 'Start again' button
    Then I should be on the 'landing-page' page showing 'Choose one of the options below and press continue.'
  @complex_form
  Scenario: Full Complex Form Submission
    Given I start the 'base' application journey
    Then I continue to the next step
    Then I should see the 'Select an option below and press continue' error
    Then I choose 'Complex form'
    Then I continue to the next step
    Then I click the 'Continue' button
    Then I should see the 'Enter your full name' error
    Then I fill 'name' with 'Jane Doe'
    Then I click the 'Continue' button
    Then I click the 'Continue' button
    Then I should see the 'Enter your date of birth in the correct format; for example, 31 10 1990' error
    Then I fill the date 'dateOfBirth' with '1-1-1899'
    Then I click the 'Continue' button
    Then I should see the 'Enter a date after 1 1 1900' error
    Then I fill the date 'dateOfBirth' with '1-1-3000'
    Then I click the 'Continue' button
    Then I should see the 'Enter a date that is in the past' error
    Then I enter a date of birth for a 30 year old
    Then I click the 'Continue' button
    Then I click the 'Continue' button
    Then I should see the 'Enter details of your building and street' error
    Then I should see the 'Enter a town or city' error
    Then I should see the 'Enter your postcode' error
    Then I fill 'building' with '10 Downing Street'
    Then I fill 'townOrCity' with 'London3'
    Then I fill 'postcode' with 'W12 3DE'
    Then I click the 'Continue' button
    Then I should see the 'Enter a town or city without including digits' error
    Then I fill 'townOrCity' with 'London'
    Then I click the 'Continue' button
    Then I click the 'Continue' button
    Then I should see the 'Select all options that apply to you.' error
    Then I select 'Salary' 
    Then I select 'Child Benefit' 
    Then I click the 'Continue' button
    Then I click the 'Continue' button
    Then I should see the 'Select where the appeal hearing is to be held' error
    Then I select 'England and Wales'
    Then I click the 'Continue' button
    Then I click the 'Continue' button
    Then I should see the 'Enter your country of residence' error
    Then I fill 'countrySelect' with 'Fake Country'
    Then I click the 'Continue' button
    Then I should see the 'Enter a valid country of residence' error
    Then I fill 'countrySelect' with 'United'
    Then I select 'United Kingdom'
    Then I click the 'Continue' button
    Then I click the 'Continue' button
    Then I should see the 'Enter details about why you are making a complaint' error
    Then I fill 'complaintDetails' text area with 'I would like to make a complaint'
    Then I click the 'Continue' button
    Then I click the 'Continue' button
    Then I should see the 'Enter details about what happened' error
    Then I fill 'whatHappened' text area with 'This is what happened to when I typed in what happened'
    Then I click the 'Continue' button
    Then I should see the 'Keep to the 10 word limit' error
    Then I fill 'whatHappened' text area with 'This is what happened"
    Then I click the 'Continue' button
    Then I click the 'Continue' button
    Then I should see the 'Select an appeal stage from the list' error
    Then I select 'appealStages' and '01. First Tier IAC Appeal - In Country Appeals'
    Then I click the 'Continue' button
    Then I click the 'Confirm submission' button
    Then I should see 'Application sent' on the page
    Then I click the 'Start again' button
    Then I should be on the 'landing-page' page showing 'Choose one of the options below and press continue.'
